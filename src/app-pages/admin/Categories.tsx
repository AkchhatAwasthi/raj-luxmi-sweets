// @ts-nocheck
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Package, FolderTree, CornerDownRight, Layers, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CategoryDeleteModal from '@/components/CategoryDeleteModal';
import { fetchCategoryRelationships, CategoryRelationship } from '@/lib/categoryHierarchy';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  image: string;
}

const AdminCategories = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [relationships, setRelationships] = useState<CategoryRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'main' | 'sub'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: '',
    categoryName: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories with product count
      const [categoriesRes, relsData] = await Promise.all([
        supabase
          .from('categories')
          .select(`
            *,
            products(count)
          `)
          .order('name', { ascending: true }),
        fetchCategoryRelationships(),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;

      const formattedCategories = categoriesRes.data?.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug || '',
        description: category.description || '',
        productCount: category.products?.length || 0,
        status: category.is_active ? 'active' as const : 'inactive' as const,
        createdAt: new Date(category.created_at).toLocaleDateString(),
        image: category.image_url || '/placeholder.svg'
      })) || [];

      setCategories(formattedCategories);
      setRelationships(relsData);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Parents of each category: child_id -> parent_ids[]
  const parentsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    relationships.forEach(r => {
      const existing = map.get(r.child_id) || [];
      existing.push(r.parent_id);
      map.set(r.child_id, existing);
    });
    return map;
  }, [relationships]);

  // Children of each category: parent_id -> child_ids[]
  const childrenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    relationships.forEach(r => {
      const existing = map.get(r.parent_id) || [];
      existing.push(r.child_id);
      map.set(r.parent_id, existing);
    });
    return map;
  }, [relationships]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const parents = parentsMap.get(cat.id) || [];
      const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cat.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'main') {
        return parents.length === 0;
      }
      if (activeTab === 'sub') {
        return parents.length > 0;
      }
      return true;
    });
  }, [categories, parentsMap, activeTab, searchQuery]);

  const mainCategoriesCount = categories.filter(c => (parentsMap.get(c.id) || []).length === 0).length;
  const subCategoriesCount = categories.filter(c => (parentsMap.get(c.id) || []).length > 0).length;

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name
    });
  };

  const handleDeleteConfirm = () => {
    fetchData(); // Refresh list after deletion
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      categoryId: '',
      categoryName: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A1C1F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A1C1F]">Categories & Subcategories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store navigation hierarchy with multi-parent subcategories.
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/categories/add')}
          className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category / Subcategory
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4A1C1F]">{categories.length}</div>
            <p className="text-xs text-gray-400 mt-1">Total items in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Main Categories</CardTitle>
            <FolderTree className="h-4 w-4 text-[#B38B46]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#B38B46]">{mainCategoriesCount}</div>
            <p className="text-xs text-gray-400 mt-1">Top-level root categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Subcategories</CardTitle>
            <Layers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{subCategoriesCount}</div>
            <p className="text-xs text-gray-400 mt-1">Nested under main or other subs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
            </div>
            <p className="text-xs text-gray-400 mt-1">Across all categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'bg-[#4A1C1F] text-white' : ''}
          >
            All Items ({categories.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'main' ? 'default' : 'outline'}
            onClick={() => setActiveTab('main')}
            className={activeTab === 'main' ? 'bg-[#4A1C1F] text-white' : ''}
          >
            Main Categories ({mainCategoriesCount})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'sub' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sub')}
            className={activeTab === 'sub' ? 'bg-[#4A1C1F] text-white' : ''}
          >
            Subcategories ({subCategoriesCount})
          </Button>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <Input
            placeholder="Search category or subcategory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70">
                <TableHead>Category / Subcategory</TableHead>
                <TableHead>Hierarchy Level</TableHead>
                <TableHead>Belongs Inside (Parents)</TableHead>
                <TableHead>Subcategories Inside</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No categories found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => {
                  const parents = parentsMap.get(category.id) || [];
                  const children = childrenMap.get(category.id) || [];
                  const isMain = parents.length === 0;

                  return (
                    <TableRow key={category.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-11 h-11 rounded object-cover border border-gray-100"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              /{category.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isMain ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 font-medium text-xs">
                            Main Category
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-50 text-purple-900 border-purple-200 font-medium text-xs">
                            Subcategory ({parents.length} parents)
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {parents.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">None (Root Level)</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {parents.map(pid => (
                              <Badge key={pid} variant="secondary" className="bg-[#4A1C1F]/10 text-[#4A1C1F] border border-[#4A1C1F]/20 text-[11px] py-0.5">
                                📁 {categoryNameMap.get(pid) || pid}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {children.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">0 subcategories</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {children.map(cid => (
                              <Badge key={cid} variant="secondary" className="bg-[#B38B46]/15 text-[#856329] border border-[#B38B46]/30 text-[11px] py-0.5">
                                ↳ {categoryNameMap.get(cid) || cid}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="font-medium text-xs">
                          {category.productCount}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant={category.status === 'active' ? 'default' : 'secondary'}
                          className={category.status === 'active' ? 'bg-emerald-600 hover:bg-emerald-700 text-xs' : 'text-xs'}
                        >
                          {category.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/categories/edit/${category.id}`)}
                            title="Edit Category & Subcategories"
                            className="hover:bg-[#FAF2E6] hover:text-[#4A1C1F]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(category.id, category.name)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <CategoryDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        categoryId={deleteModal.categoryId}
        categoryName={deleteModal.categoryName}
      />
    </div>
  );
};

export default AdminCategories;
