'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CategoryProductManager from '@/components/CategoryProductManager';

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

  useEffect(() => {
    if (id && isEdit) {
      fetchCategory();
    } else if (propCategory) {
      setFormData({
        name: propCategory.name,
        description: propCategory.description,
        is_active: propCategory.is_active,
        image_url: propCategory.image_url
      });
    }
  }, [id, isEdit, propCategory]);

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
      // Only auto-fill slug if not manually edited (i.e., still matches auto pattern)
      slug: prev.slug === '' || prev.slug === autoSlug(prev.name ?? '')
        ? autoSlug(value)
        : prev.slug,
    }));
  };

  const autoSlug = (name: string) =>
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Auto-inject f_auto,q_auto for Cloudinary URLs that are missing it
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
        // Extract file path from URL for deletion
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
        const { error } = await supabase
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
          } as any);

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Category updated!" : "Category created!",
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/admin/categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Category' : 'Add New Category'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter category description"
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
                <Button type="submit" className="w-full" disabled={loading || uploadingImage}>
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
