import { supabase } from '@/integrations/supabase/client';

export interface CategoryRelationship {
  id?: string;
  parent_id: string;
  child_id: string;
  sort_order?: number;
  created_at?: string;
}

const SETTINGS_KEY = 'category_relationships_map';

/**
 * Fetch all category relationships.
 * Tries the dedicated 'category_relationships' table first.
 * If the table does not exist yet (PGRST205), gracefully falls back
 * to the 'settings' table so the system works immediately.
 */
export async function fetchCategoryRelationships(): Promise<CategoryRelationship[]> {
  try {
    const { data, error } = await supabase
      .from('category_relationships' as any)
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      return data as unknown as CategoryRelationship[];
    }

    // Check if error is table not found
    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist'))) {
      console.info('category_relationships table not detected yet, loading from settings fallback.');
      return await fetchRelationshipsFromSettings();
    }

    // Other errors: try fallback
    return await fetchRelationshipsFromSettings();
  } catch (err) {
    console.warn('Error fetching category relationships, using fallback:', err);
    return await fetchRelationshipsFromSettings();
  }
}

/**
 * Fallback loader from the settings table
 */
async function fetchRelationshipsFromSettings(): Promise<CategoryRelationship[]> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (!data || !data.value) return [];

    let parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed); // Double encoded safety
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load relationships from settings fallback:', err);
    return [];
  }
}

/**
 * Persist relationships to the settings table as fallback
 */
async function saveRelationshipsToSettings(relationships: CategoryRelationship[]): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(relationships);
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: SETTINGS_KEY,
        value: jsonStr,
      }, { onConflict: 'key' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to save relationships to settings fallback:', err);
    return false;
  }
}

/**
 * Sync relationships for a category:
 * Sets its exact parents (where child_id = categoryId)
 * and its exact children (where parent_id = categoryId)
 */
export async function syncCategoryRelationships({
  categoryId,
  parentIds,
  childIds,
}: {
  categoryId: string;
  parentIds?: string[];
  childIds?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. First test if 'category_relationships' table is operational
    let useDedicatedTable = true;
    const testCheck = await supabase
      .from('category_relationships' as any)
      .select('id')
      .limit(1);

    if (testCheck.error && (testCheck.error.code === 'PGRST205' || testCheck.error.message?.includes('schema cache'))) {
      useDedicatedTable = false;
    }

    if (useDedicatedTable) {
      // Manage using dedicated SQL table
      if (parentIds !== undefined) {
        // Delete current parents
        await supabase
          .from('category_relationships' as any)
          .delete()
          .eq('child_id', categoryId);

        // Insert new parents (excluding self)
        const validParents = parentIds.filter(pid => pid && pid !== categoryId);
        if (validParents.length > 0) {
          const rows = validParents.map((pid, idx) => ({
            parent_id: pid,
            child_id: categoryId,
            sort_order: idx,
          }));
          const { error: insErr } = await supabase
            .from('category_relationships' as any)
            .insert(rows);
          if (insErr) console.warn('Error inserting parent relationships:', insErr);
        }
      }

      if (childIds !== undefined) {
        // Delete current children
        await supabase
          .from('category_relationships' as any)
          .delete()
          .eq('parent_id', categoryId);

        // Insert new children (excluding self)
        const validChildren = childIds.filter(cid => cid && cid !== categoryId);
        if (validChildren.length > 0) {
          const rows = validChildren.map((cid, idx) => ({
            parent_id: categoryId,
            child_id: cid,
            sort_order: idx,
          }));
          const { error: insErr } = await supabase
            .from('category_relationships' as any)
            .insert(rows);
          if (insErr) console.warn('Error inserting child relationships:', insErr);
        }
      }

      // Also mirror to settings so both table and fallback are always in sync!
      const allRels = await fetchCategoryRelationships();
      await saveRelationshipsToSettings(allRels);

      return { success: true };
    } else {
      // Manage using settings fallback
      let all = await fetchRelationshipsFromSettings();

      if (parentIds !== undefined) {
        // Remove existing parent links for this category
        all = all.filter(r => r.child_id !== categoryId);
        // Add new parent links
        const validParents = parentIds.filter(pid => pid && pid !== categoryId);
        validParents.forEach((pid, idx) => {
          all.push({
            parent_id: pid,
            child_id: categoryId,
            sort_order: idx,
          });
        });
      }

      if (childIds !== undefined) {
        // Remove existing children links for this category
        all = all.filter(r => r.parent_id !== categoryId);
        // Add new children links
        const validChildren = childIds.filter(cid => cid && cid !== categoryId);
        validChildren.forEach((cid, idx) => {
          all.push({
            parent_id: categoryId,
            child_id: cid,
            sort_order: idx,
          });
        });
      }

      // Deduplicate
      const seen = new Set<string>();
      const deduped = all.filter(r => {
        const key = `${r.parent_id}:${r.child_id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const ok = await saveRelationshipsToSettings(deduped);
      return { success: ok };
    }
  } catch (err: any) {
    console.error('Failed to sync category relationships:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Checks if adding parentId -> childId would cause a cycle
 */
export function willCauseCycle(
  targetParentId: string,
  targetChildId: string,
  relationships: CategoryRelationship[]
): boolean {
  if (targetParentId === targetChildId) return true;

  // If targetParentId is already reachable from targetChildId, adding targetParentId -> targetChildId creates a cycle
  const visited = new Set<string>();
  const queue = [targetParentId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetChildId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    // Find all parents of current
    const parents = relationships
      .filter(r => r.child_id === current)
      .map(r => r.parent_id);

    for (const p of parents) {
      if (!visited.has(p)) queue.push(p);
    }
  }

  return false;
}

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean | null;
  parent_ids: string[];
  parents?: CategoryTreeItem[];
  subcategories?: CategoryTreeItem[];
}

/**
 * Build hierarchical view from flat categories and relationships list
 */
export function buildCategoryTree(
  categories: any[],
  relationships: CategoryRelationship[]
): {
  allWithMeta: CategoryTreeItem[];
  rootCategories: CategoryTreeItem[];
  subcategoriesList: CategoryTreeItem[];
  subcategoriesByParentId: Record<string, CategoryTreeItem[]>;
  parentsByChildId: Record<string, CategoryTreeItem[]>;
} {
  const catMap = new Map<string, CategoryTreeItem>();

  categories.forEach(c => {
    catMap.set(c.id, {
      ...c,
      parent_ids: [],
      parents: [],
      subcategories: [],
    });
  });

  const subcategoriesByParentId: Record<string, CategoryTreeItem[]> = {};
  const parentsByChildId: Record<string, CategoryTreeItem[]> = {};

  relationships.forEach(rel => {
    const parent = catMap.get(rel.parent_id);
    const child = catMap.get(rel.child_id);

    if (parent && child) {
      if (!child.parent_ids.includes(parent.id)) {
        child.parent_ids.push(parent.id);
        child.parents!.push(parent);
      }
      if (!parent.subcategories!.some(s => s.id === child.id)) {
        parent.subcategories!.push(child);
      }

      if (!subcategoriesByParentId[parent.id]) subcategoriesByParentId[parent.id] = [];
      if (!subcategoriesByParentId[parent.id].some(s => s.id === child.id)) {
        subcategoriesByParentId[parent.id].push(child);
      }

      if (!parentsByChildId[child.id]) parentsByChildId[child.id] = [];
      if (!parentsByChildId[child.id].some(p => p.id === parent.id)) {
        parentsByChildId[child.id].push(parent);
      }
    }
  });

  const allWithMeta = Array.from(catMap.values());
  const rootCategories = allWithMeta.filter(c => c.parent_ids.length === 0);
  const subcategoriesList = allWithMeta.filter(c => c.parent_ids.length > 0);

  return {
    allWithMeta,
    rootCategories,
    subcategoriesList,
    subcategoriesByParentId,
    parentsByChildId,
  };
}
