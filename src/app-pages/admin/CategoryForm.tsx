// @ts-nocheck
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, Link, FolderTree, CornerDownRight, Search, Check, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CategoryProductManager from '@/components/CategoryProductManager';
import {
  fetchCategoryRelationships,
  syncCategoryRelationships,
  CategoryRelationship,
  willCauseCycle,
} from '@/lib/categoryHierarchy';

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  image_url: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoryFormProps {
  category?: Category;
  isEdit?: boolean;
}

const CategoryForm = ({ category: propCategory, isEdit = false }: CategoryFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    is_active: true,
    image_url: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productCount, setProductCount] = useState(0);

  // Hierarchy States
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
  const [relationships, setRelationships] = useState<CategoryRelationship[]>([]);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [parentSearch, setParentSearch] = useState('');
  const [childSearch, setChildSearch] = useState('');

  useEffect(() => {
    fetchAllCategoriesAndRelationships();
  }, [id]);

  useEffect(() => {
    if (id && isEdit) {
      fetchCategory();
    } else if (propCategory) {
      setFormData({
        name: propCategory.name,
        description: propCategory.description,
        is_active: propCategory.is_active,
        image_url: propCategory.image_url,
        slug: propCategory.slug || '',
      });
    }
  }, [id, isEdit, propCategory]);

  const fetchAllCategoriesAndRelationships = async () => {
    try {
      // 1. Fetch categories for picker
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (catData) {
        // Exclude current category from options to avoid self-selection
        setAllCategories(catData.filter(c => !id || c.id !== id));
      }

      // 2. Fetch relationships
      const rels = await fetchCategoryRelationships();
      setRelationships(rels);

      if (id) {
        // Find parents for this category
        const parents = rels
          .filter(r => r.child_id === id)
          .map(r => r.parent_id);
        setSelectedParentIds(parents);

        // Find children for this category
        const children = rels
          .filter(r => r.parent_id === id)
          .map(r => r.child_id);
        setSelectedChildIds(children);
      }
    } catch (err) {
      console.warn('Error fetching hierarchy data:', err);
    }
  };

  const fetchCategory = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countError) throw countError;
      
      setFormData({
        name: data.name,
        description: data.description ?? '',
        is_active: data.is_active ?? true,
        image_url: data.image_url ?? '',
        slug: (data as any).slug ?? '',
        meta_title: (data as any).meta_title ?? '',
        meta_description: (data as any).meta_description ?? '',
        meta_keywords: (data as any).meta_keywords ?? '',
      });

      setProductCount(count || 0);
    } catch (error) {
      console.error('Error fetching category:', error);
      toast({
        title: "Error",
        description: "Failed to fetch category details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductRemoved = () => {
    setProductCount(prev => Math.max(0, prev - 1));
  };

  const handleInputChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-generate slug from category name
  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug === '' || prev.slug === autoSlug(prev.name ?? '')
        ? autoSlug(value)
        : prev.slug,
    }));
  };

  const autoSlug = (name: string) =>
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const normalizeCloudinaryUrl = (url: string): string => {
    if (!url.includes('res.cloudinary.com')) return url;
    if (url.includes('f_auto') && url.includes('q_auto')) return url;
    return url.replace(/\/image\/upload\//, '/image/upload/f_auto,q_auto/');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      handleInputChange('image_url', normalizeCloudinaryUrl(imageUrl));
    }
  };

  const removeImage = async () => {
    if (formData.image_url) {
      try {
        const url = new URL(formData.image_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('categories')).join('/');
        
        await supabase.storage
          .from('category-images')
          .remove([filePath]);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }
    handleInputChange('image_url', '');
  };

  // Toggle parent selection
  const toggleParent = (parentId: string) => {
    if (id && willCauseCycle(parentId, id, relationships)) {
      toast({
        title: "Cyclic relationship detected",
        description: "This category is already a parent of that item. Selecting it would create an infinite loop.",
        variant: "destructive",
      });
      return;
    }

    setSelectedParentIds(prev =>
      prev.includes(parentId)
        ? prev.filter(p => p !== parentId)
        : [...prev, parentId]
    );
  };

  // Toggle child selection
  const toggleChild = (childId: string) => {
    if (id && willCauseCycle(id, childId, relationships)) {
      toast({
        title: "Cyclic relationship detected",
        description: "Selecting this item would create an infinite loop.",
        variant: "destructive",
      });
      return;
    }

    setSelectedChildIds(prev =>
      prev.includes(childId)
        ? prev.filter(c => c !== childId)
        : [...prev, childId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name and description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let savedCategoryId = id;

      if (isEdit && id) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description,
            is_active: formData.is_active,
            image_url: formData.image_url,
            slug: formData.slug || autoSlug(formData.name ?? ''),
            meta_title: formData.meta_title || null,
            meta_description: formData.meta_description || null,
            meta_keywords: formData.meta_keywords || null,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data: insertData, error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            description: formData.description,
            is_active: formData.is_active,
            image_url: formData.image_url,
            slug: formData.slug || autoSlug(formData.name ?? ''),
            meta_title: formData.meta_title || null,
            meta_description: formData.meta_description || null,
            meta_keywords: formData.meta_keywords || null,
          } as any)
          .select('id')
          .single();

        if (error) throw error;
        savedCategoryId = insertData?.id;
      }

      // Sync Category Relationships (Parents and Children)
      if (savedCategoryId) {
        await syncCategoryRelationships({
          categoryId: savedCategoryId,
          parentIds: selectedParentIds,
          childIds: selectedChildIds,
        });
      }

      toast({
        title: isEdit ? "Category updated!" : "Category created!",
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} with all subcategory relationships.`,
      });
      
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = allCategories.filter(c =>
    c.name.toLowerCase().includes(parentSearch.toLowerCase()) &&
    !selectedChildIds.includes(c.id) // Cannot be both parent and child simultaneously
  );

  const filteredChildren = allCategories.filter(c =>
    c.name.toLowerCase().includes(childSearch.toLowerCase()) &&
    !selectedParentIds.includes(c.id) // Cannot be both parent and child simultaneously
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/admin/categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Category / Subcategory' : 'Add Category / Subcategory'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kaju Sweets, Pure Desi Ghee Mithai, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter detailed description of this category or subcategory"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => handleInputChange('is_active', value === 'active')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subcategory & Multi-Parent Hierarchy Section */}
          <Card className="border-[#B38B46]/30 shadow-sm bg-gradient-to-b from-white to-[#FAF9F6]">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#B38B46]" />
                <CardTitle className="text-lg font-semibold text-[#4A1C1F]">
                  Hierarchy & Subcategory Placement
                </CardTitle>
              </div>
              <CardDescription>
                Place this category inside one or more parent categories/subcategories, or attach child subcategories inside it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              
              {/* Parent Categories (Belongs Inside) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                    <CornerDownRight className="w-4 h-4 text-[#B38B46]" />
                    Belongs Inside (Parent Categories / Subcategories)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedParentIds.length === 0 ? 'Acts as Root / Main Category' : `${selectedParentIds.length} parent(s) selected`}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Select which categories or subcategories this belongs inside. <strong>A subcategory can belong to multiple parents!</strong> If none are selected, it stays at the top/main level.
                </p>

                {/* Selected Parent Badges */}
                {selectedParentIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#F9F3EA] border border-[#D4B6A2]/40 rounded-md">
                    {selectedParentIds.map(pid => {
                      const parent = allCategories.find(c => c.id === pid);
                      return (
                        <Badge
                          key={pid}
                          variant="secondary"
                          className="bg-[#4A1C1F] text-[#FFFDF7] hover:bg-[#783838] gap-1 px-2.5 py-1 text-xs"
                        >
                          <span>📁 {parent ? parent.name : pid}</span>
                          <X
                            className="w-3.5 h-3.5 cursor-pointer opacity-80 hover:opacity-100 ml-1"
                            onClick={() => toggleParent(pid)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Search & Checkbox List */}
                <div className="border rounded-md p-2 bg-white space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                    <Input
                      placeholder="Search parent categories..."
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                    {filteredParents.length === 0 ? (
                      <p className="text-xs text-gray-400 p-2 text-center">No matching categories found</p>
                    ) : (
                      filteredParents.map(cat => {
                        const isSelected = selectedParentIds.includes(cat.id);
                        return (
                          <div
                            key={cat.id}
                            onClick={() => toggleParent(cat.id)}
                            className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#FAF2E6] text-[#4A1C1F] font-medium border border-[#B38B46]/40'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>📁 {cat.name}</span>
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-[#B38B46]" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200" />

              {/* Child Subcategories (Contains Subcategories) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#B38B46]" />
                    Contains Subcategories (Children)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedChildIds.length} subcategory child(ren) attached
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Select which existing subcategories should be nested directly inside this category.
                </p>

                {/* Selected Child Badges */}
                {selectedChildIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#FAF9F6] border border-[#D4B6A2]/40 rounded-md">
                    {selectedChildIds.map(cid => {
                      const child = allCategories.find(c => c.id === cid);
                      return (
                        <Badge
                          key={cid}
                          variant="secondary"
                          className="bg-[#B38B46] text-[#FFFDF7] hover:bg-[#926F32] gap-1 px-2.5 py-1 text-xs"
                        >
                          <span>↳ {child ? child.name : cid}</span>
                          <X
                            className="w-3.5 h-3.5 cursor-pointer opacity-80 hover:opacity-100 ml-1"
                            onClick={() => toggleChild(cid)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Search & Checkbox List */}
                <div className="border rounded-md p-2 bg-white space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                    <Input
                      placeholder="Search subcategories to nest inside..."
                      value={childSearch}
                      onChange={(e) => setChildSearch(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                    {filteredChildren.length === 0 ? (
                      <p className="text-xs text-gray-400 p-2 text-center">No matching subcategories found</p>
                    ) : (
                      filteredChildren.map(cat => {
                        const isSelected = selectedChildIds.includes(cat.id);
                        return (
                          <div
                            key={cat.id}
                            onClick={() => toggleChild(cat.id)}
                            className={`flex items-center justify-between px-3 py-2 text-xs rounded cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#FAF2E6] text-[#4A1C1F] font-medium border border-[#B38B46]/40'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>↳ {cat.name}</span>
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-[#B38B46]" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* SEO Fields */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="auto-generated-from-name"
                />
                <p className="text-xs text-gray-500">
                  Public URL: /category/<strong>{formData.slug || 'slug'}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder={`${formData.name || 'Category'} | Raj Luxmi Sweets`}
                  maxLength={70}
                />
                <p className="text-xs text-gray-400">{(formData.meta_title?.length || 0)}/70 chars</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Compelling description for Google search results (up to 160 chars)"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-400">{(formData.meta_description?.length || 0)}/160 chars</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                  placeholder="mithai lucknow, indian sweets, kaju katli"
                />
                <p className="text-xs text-gray-500">Comma-separated keywords to target</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Management - Only show in edit mode */}
          {isEdit && id && (
            <CategoryProductManager
              categoryId={id}
              categoryName={formData.name || 'Category'}
              onProductRemoved={handleProductRemoved}
            />
          )}

        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imageFile')?.click()}
                  className="w-full"
                  disabled={uploadingImage}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </Button>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Or paste image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const url = input.value.trim();
                      if (url) {
                        handleInputChange('image_url', normalizeCloudinaryUrl(url));
                        input.value = '';
                      }
                    }}
                  >
                    <Link className="h-4 w-4 mr-1" />
                    Add URL
                  </Button>
                </div>
              </div>

              {!formData.image_url && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Upload an image file or paste a URL above
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}

              {formData.image_url && (
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="Category preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={uploadingImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hierarchy Placement Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Placement Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 font-medium">Type:</span>{' '}
                <Badge variant="outline" className={selectedParentIds.length === 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-purple-50 text-purple-800 border-purple-200"}>
                  {selectedParentIds.length === 0 ? 'Main / Root Category' : 'Subcategory'}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Parents ({selectedParentIds.length}):</span>{' '}
                <span className="text-gray-700">
                  {selectedParentIds.length === 0
                    ? 'None (Top Level)'
                    : selectedParentIds.map(p => allCategories.find(c => c.id === p)?.name || p).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Subcategories Inside ({selectedChildIds.length}):</span>{' '}
                <span className="text-gray-700">
                  {selectedChildIds.length === 0
                    ? 'None'
                    : selectedChildIds.map(c => allCategories.find(cat => cat.id === c)?.name || c).join(', ')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Category Stats - Only show in edit mode */}
          {isEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Category Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Products</span>
                    <span className="font-semibold">{productCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`text-sm font-medium ${formData.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" className="w-full bg-[#4A1C1F] hover:bg-[#5C4638] text-white" disabled={loading || uploadingImage}>
                  {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/admin/categories')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
