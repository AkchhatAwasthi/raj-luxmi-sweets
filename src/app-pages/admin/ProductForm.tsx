'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, X, ChevronUp, ChevronDown, Plus, Trash2, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { slugify } from '@/utils/slugify';
import { fetchCategoryRelationships } from '@/lib/categoryHierarchy';
import { ProductVariant } from '@/store/useStore';

interface Product {
  id?: string;
  name: string;
  price: number;
  original_price?: number;
  category_id?: string;
  weight?: string;
  pieces?: string;
  serves?: number;
  storage_instructions?: string;
  description?: string;
  stock_quantity?: number;
  is_active?: boolean;
  is_bestseller?: boolean;
  new_arrival?: boolean;
  images?: string[];
  features?: any;
  nutritional_info?: any;
  marketing_info?: any;
  sku?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  faqs?: any;
  variants?: ProductVariant[];
}

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

const ProductForm = ({ product: propProduct, isEdit = false }: ProductFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [formData, setFormData] = useState<Product>({
    name: '',
    price: 0,
    original_price: 0,
    category_id: '',
    weight: '',
    description: '',
    stock_quantity: 0,
    is_active: true,
    is_bestseller: false,
    new_arrival: false,
    sku: '',
    pieces: '',
    serves: 0,
    storage_instructions: ''
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [productSpecs, setProductSpecs] = useState({
    material: '',
    dimensions: '',
    weight_per_unit: '',
    brand: '',
    model: '',
    warranty: '',
    certification: '',
    origin: ''
  });

  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const [marketingInfo, setMarketingInfo] = useState({
    marketedBy: '',
    address: '',
    city: '',
    state: '',
    fssaiLicense: ''
  });

  const [seoData, setSeoData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  const [faqsList, setFaqsList] = useState<{ question: string; answer: string }[]>([]);

  const STANDARD_SWEET_FAQS = [
    {
      question: "Is this sweet prepared in pure Desi Ghee?",
      answer: "Yes! All our traditional sweets are freshly handcrafted using 100% pure desi ghee and premium grade ingredients."
    },
    {
      question: "What is the shelf life of this item?",
      answer: "This sweet stays fresh for 7 to 10 days at room temperature in an airtight container, and up to 20 days when refrigerated."
    },
    {
      question: "How is it packaged for shipping?",
      answer: "We pack every order in food-grade, vacuum-sealed boxes with protective cushioning to guarantee maximum freshness upon arrival."
    },
    {
      question: "What is the estimated delivery time?",
      answer: "Orders within Lucknow are delivered within 24 hours. Pan-India shipping typically takes 3 to 5 business days."
    }
  ];

  const addFaqItem = () => {
    setFaqsList(prev => [...prev, { question: '', answer: '' }]);
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeFaqItem = (index: number) => {
    setFaqsList(prev => prev.filter((_, i) => i !== index));
  };

  const moveFaqUp = (index: number) => {
    if (index <= 0) return;
    setFaqsList(prev => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  const moveFaqDown = (index: number) => {
    if (index >= faqsList.length - 1) return;
    setFaqsList(prev => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  };

  const loadStandardFaqs = () => {
    if (faqsList.length > 0) {
      if (!confirm('This will append standard FAQs to your current list. Continue?')) return;
    }
    setFaqsList(prev => [...prev, ...STANDARD_SWEET_FAQS]);
    toast({
      title: "Standard FAQs Loaded",
      description: "Added standard Mithai FAQs to the product form.",
    });
  };

  // Product Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);

  const generateVariantId = () => `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const addEmptyVariant = () => {
    const newVariant: ProductVariant = {
      id: generateVariantId(),
      title: '',
      price: Number(formData.price) || 0,
      original_price: formData.original_price ? Number(formData.original_price) : undefined,
      weight: formData.weight || '',
      pieces: formData.pieces || '',
      stock_quantity: Number(formData.stock_quantity) || 50,
      sku: '',
      is_default: variantsList.length === 0,
    };
    setVariantsList(prev => [...prev, newVariant]);
    setHasVariants(true);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariantsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const setDefaultVariant = (index: number) => {
    setVariantsList(prev =>
      prev.map((v, i) => ({
        ...v,
        is_default: i === index,
      }))
    );
  };

  const removeVariant = (index: number) => {
    setVariantsList(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some(v => v.is_default)) {
        updated[0].is_default = true;
      }
      if (updated.length === 0) {
        setHasVariants(false);
      }
      return updated;
    });
  };

  const moveVariant = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= variantsList.length) return;
    setVariantsList(prev => {
      const updated = [...prev];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  };

  const applySweetsPreset = () => {
    const baseP = Number(formData.price) || 500;
    const baseOrig = Number(formData.original_price) || Math.round(baseP * 1.1);

    const presets: ProductVariant[] = [
      {
        id: generateVariantId(),
        title: '250g Box',
        price: Math.max(50, Math.round((baseP * 0.53) / 10) * 10),
        original_price: Math.round((baseOrig * 0.53) / 10) * 10,
        weight: '250g',
        pieces: '6-8 pcs',
        stock_quantity: 50,
        is_default: false,
      },
      {
        id: generateVariantId(),
        title: '500g Box',
        price: baseP,
        original_price: baseOrig,
        weight: '500g',
        pieces: '12-16 pcs',
        stock_quantity: 50,
        is_default: true,
      },
      {
        id: generateVariantId(),
        title: '1kg Box (Best Value)',
        price: Math.round((baseP * 1.95) / 10) * 10,
        original_price: Math.round((baseOrig * 1.95) / 10) * 10,
        weight: '1kg',
        pieces: '24-30 pcs',
        stock_quantity: 50,
        is_default: false,
      },
    ];

    setVariantsList(presets);
    setHasVariants(true);
    toast({
      title: "Sweets Presets Loaded",
      description: "Added 250g, 500g, and 1kg options with proportional pricing.",
    });
  };

  const applyNamkeenPreset = () => {
    const baseP = Number(formData.price) || 200;
    const presets: ProductVariant[] = [
      {
        id: generateVariantId(),
        title: '200g Pack',
        price: Math.max(30, Math.round((baseP * 0.55) / 10) * 10),
        weight: '200g',
        stock_quantity: 50,
        is_default: false,
      },
      {
        id: generateVariantId(),
        title: '400g Pack',
        price: baseP,
        weight: '400g',
        stock_quantity: 50,
        is_default: true,
      },
      {
        id: generateVariantId(),
        title: '1kg Family Pack',
        price: Math.round((baseP * 2.3) / 10) * 10,
        weight: '1kg',
        stock_quantity: 50,
        is_default: false,
      },
    ];

    setVariantsList(presets);
    setHasVariants(true);
    toast({
      title: "Namkeen Presets Loaded",
      description: "Added 200g, 400g, and 1kg options.",
    });
  };

  const applyPcsPreset = () => {
    const baseP = Number(formData.price) || 450;
    const presets: ProductVariant[] = [
      {
        id: generateVariantId(),
        title: 'Box of 8 pcs',
        price: Math.max(50, Math.round((baseP * 0.55) / 10) * 10),
        pieces: '8 pcs',
        weight: '300g',
        stock_quantity: 40,
        is_default: false,
      },
      {
        id: generateVariantId(),
        title: 'Box of 16 pcs',
        price: baseP,
        pieces: '16 pcs',
        weight: '600g',
        stock_quantity: 40,
        is_default: true,
      },
      {
        id: generateVariantId(),
        title: 'Box of 24 pcs',
        price: Math.round((baseP * 1.45) / 10) * 10,
        pieces: '24 pcs',
        weight: '900g',
        stock_quantity: 40,
        is_default: false,
      },
    ];

    setVariantsList(presets);
    setHasVariants(true);
    toast({
      title: "Pack Size Presets Loaded",
      description: "Added Box of 8, 16, and 24 pcs options.",
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchAvailableFeatures();
    if (id && isEdit) {
      fetchProduct();
    } else if (propProduct) {
      setFormData(propProduct);
      setImages(propProduct.images || []);
      if (propProduct.variants && Array.isArray(propProduct.variants) && propProduct.variants.length > 0) {
        setHasVariants(true);
        setVariantsList(propProduct.variants);
      }
    }
  }, [id, isEdit, propProduct]);

  const fetchCategories = async () => {
    try {
      const [catRes, rels] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
        fetchCategoryRelationships(),
      ]);

      if (catRes.error) throw catRes.error;
      const rawCats = catRes.data || [];

      // Build parent map: child_id -> parent names[]
      const catNameMap = new Map(rawCats.map(c => [c.id, c.name]));
      const parentsMap = new Map<string, string[]>();
      rels.forEach(r => {
        const existing = parentsMap.get(r.child_id) || [];
        const pName = catNameMap.get(r.parent_id);
        if (pName && !existing.includes(pName)) existing.push(pName);
        parentsMap.set(r.child_id, existing);
      });

      // Format categories with hierarchy information
      const formatted = rawCats.map(cat => {
        const parents = parentsMap.get(cat.id) || [];
        const isSub = parents.length > 0;
        return {
          id: cat.id,
          name: cat.name,
          isSub,
          displayName: isSub
            ? `↳ ${cat.name} (under ${parents.join(', ')})`
            : `📁 ${cat.name}`,
        };
      });

      // Sort: Main categories first, then subcategories
      formatted.sort((a, b) => {
        if (a.isSub === b.isSub) return a.name.localeCompare(b.name);
        return a.isSub ? 1 : -1;
      });

      setCategories(formatted);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAvailableFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('product_features')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableFeatures(data?.map(f => f.name) || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      // Fallback to default features if table doesn't exist yet
      setAvailableFeatures([
        'Bulk Pack',
        'Wholesale Price',
        'Commercial Grade',
        'Energy Efficient',
        'Eco Friendly',
        'Premium Quality',
        'Fast Delivery',
        'Bulk Discount Available'
      ]);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        original_price: data.original_price ?? undefined,
        category_id: data.category_id ?? '',
        weight: data.weight ?? '',
        pieces: data.pieces ?? '',
        serves: data.serves ?? 0,
        storage_instructions: data.storage_instructions ?? '',
        description: data.description ?? '',
        stock_quantity: data.stock_quantity ?? 0,
        is_active: data.is_active ?? true,
        is_bestseller: data.is_bestseller ?? false,
        new_arrival: (data as any).new_arrival ?? false,
        images: data.images ?? [],
        sku: data.sku ?? '',
      });
      setImages(data.images || []);
      if (data.nutritional_info && typeof data.nutritional_info === 'object') {
        setProductSpecs(data.nutritional_info as any);
      }
      if (data.features && Array.isArray(data.features)) {
        setSelectedFeatures(data.features as string[]);
      } else if (data.features && typeof data.features === 'object') {
        // Convert old format to new format
        const oldFeatures = data.features as any;
        const convertedFeatures = Object.entries(oldFeatures)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        setSelectedFeatures(convertedFeatures);
      }
      if (data.marketing_info && typeof data.marketing_info === 'object') {
        setMarketingInfo({ ...marketingInfo, ...(data.marketing_info as any) });
      }
      setSeoData({
        meta_title: (data as any).meta_title || '',
        meta_description: (data as any).meta_description || '',
        meta_keywords: (data as any).meta_keywords || '',
      });
      if ((data as any).faqs && Array.isArray((data as any).faqs)) {
        setFaqsList((data as any).faqs);
      }
      if ((data as any).variants && Array.isArray((data as any).variants) && (data as any).variants.length > 0) {
        setHasVariants(true);
        setVariantsList((data as any).variants);
      } else {
        setHasVariants(false);
        setVariantsList([]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
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
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 10 - images.length); i++) {
      const file = files[i];
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        newImages.push(imageUrl);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];

    try {
      // Extract file path from URL for deletion
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('products')).join('/');

      await supabase.storage
        .from('product-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error removing image:', error);
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add this new function to move images up in the array
  const moveImageUp = (index: number) => {
    if (index <= 0) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return newImages;
    });
  };

  // Add this new function to move images down in the array
  const moveImageDown = (index: number) => {
    if (index >= images.length - 1) return;
    setImages(prev => {
      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return newImages;
    });
  };

  const addNewFeature = async () => {
    if (!newFeature.trim()) return;

    try {
      // Try to add to database first
      const { error } = await supabase
        .from('product_features')
        .insert({ name: newFeature.trim(), is_active: true });

      if (error && !error.message.includes('relation "product_features" does not exist')) {
        throw error;
      }

      // Add to local state
      if (!availableFeatures.includes(newFeature.trim())) {
        setAvailableFeatures(prev => [...prev, newFeature.trim()].sort());
      }

      // Add to selected features
      if (!selectedFeatures.includes(newFeature.trim())) {
        setSelectedFeatures(prev => [...prev, newFeature.trim()]);
      }

      setNewFeature('');

      toast({
        title: "Feature added",
        description: `"${newFeature.trim()}" has been added to available features.`,
      });
    } catch (error) {
      console.error('Error adding feature:', error);
      // Still add to local state even if database fails
      if (!availableFeatures.includes(newFeature.trim())) {
        setAvailableFeatures(prev => [...prev, newFeature.trim()].sort());
      }
      if (!selectedFeatures.includes(newFeature.trim())) {
        setSelectedFeatures(prev => [...prev, newFeature.trim()]);
      }
      setNewFeature('');
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const removeFeatureFromAvailable = async (feature: string) => {
    try {
      // Try to remove from database
      const { error } = await supabase
        .from('product_features')
        .update({ is_active: false })
        .eq('name', feature);

      if (error && !error.message.includes('relation "product_features" does not exist')) {
        throw error;
      }

      // Remove from local state
      setAvailableFeatures(prev => prev.filter(f => f !== feature));
      setSelectedFeatures(prev => prev.filter(f => f !== feature));

      toast({
        title: "Feature removed",
        description: `"${feature}" has been removed from available features.`,
      });
    } catch (error) {
      console.error('Error removing feature:', error);
      toast({
        title: "Error",
        description: "Failed to remove feature. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateSKU = () => {
    const slug = slugify(formData.name || 'product');
    handleInputChange('sku', slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category_id || !formData.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, category, and price.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const cleanedVariants = hasVariants
        ? variantsList
            .filter(v => v.title && v.title.trim() !== '' && Number(v.price) > 0)
            .map(v => ({
              id: v.id || generateVariantId(),
              title: v.title.trim(),
              price: Number(v.price),
              original_price: v.original_price ? Number(v.original_price) : undefined,
              weight: v.weight ? v.weight.trim() : undefined,
              pieces: v.pieces ? v.pieces.trim() : undefined,
              stock_quantity: v.stock_quantity !== undefined ? Number(v.stock_quantity) : undefined,
              sku: v.sku ? v.sku.trim() : undefined,
              is_default: !!v.is_default,
            }))
        : [];

      if (cleanedVariants.length > 0 && !cleanedVariants.some(v => v.is_default)) {
        cleanedVariants[0].is_default = true;
      }

      const defaultVar = cleanedVariants.find(v => v.is_default) || cleanedVariants[0];

      const productData: any = {
        name: formData.name,
        price: defaultVar ? defaultVar.price : Number(formData.price),
        original_price: defaultVar?.original_price ? defaultVar.original_price : (Number(formData.original_price) || Number(formData.price)),
        category_id: formData.category_id,
        weight: defaultVar?.weight || formData.weight,
        description: formData.description,
        stock_quantity: Number(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        is_bestseller: formData.is_bestseller,
        new_arrival: formData.new_arrival,
        images: images,
        features: selectedFeatures,
        nutritional_info: productSpecs,
        sku: formData.sku,
        pieces: defaultVar?.pieces || formData.pieces,
        serves: Number(formData.serves) || 0,
        storage_instructions: formData.storage_instructions,
        marketing_info: marketingInfo,
        meta_title: seoData.meta_title || null,
        meta_description: seoData.meta_description || null,
        meta_keywords: seoData.meta_keywords || null,
        faqs: faqsList.filter(f => f.question.trim() !== '' && f.answer.trim() !== ''),
        variants: cleanedVariants,
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Product updated!" : "Product created!",
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });

      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (error.code === '23505' || error.message?.includes('products_sku_key')) {
        toast({
          title: "Duplicate SKU",
          description: "This SKU is already in use. Please enter a unique SKU or click 'Generate' to create one.",
          variant: "destructive",
        });
      } else if (error.message?.includes('variants') && error.message?.includes('column')) {
        toast({
          title: "Database Migration Required",
          description: "The 'variants' column needs to be created in your Supabase SQL Editor: ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;",
          variant: "destructive",
          duration: 12000,
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save product. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/admin/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.displayName || category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">URL Slug (used in product URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                    placeholder="e.g. kaju-katli-500g"
                  />
                  <Button type="button" variant="outline" onClick={generateSKU} title="Auto-generate from product name">
                    Generate
                  </Button>
                </div>
                {formData.sku && (
                  <p className="text-xs text-muted-foreground">
                    URL: <span className="font-mono text-blue-600">rajluxmi.com/product/<strong>{formData.sku}</strong></span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 500g, 1kg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pieces">Pieces</Label>
                  <Input
                    id="pieces"
                    value={formData.pieces}
                    onChange={(e) => handleInputChange('pieces', e.target.value)}
                    placeholder="e.g., 8-10 pieces"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units/Quantity</Label>
                  <Input
                    id="units"
                    type="number"
                    value={formData.serves}
                    onChange={(e) => handleInputChange('serves', Number(e.target.value))}
                    placeholder="e.g., 50 (for bulk pack)"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_bestseller"
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                  />
                  <Label htmlFor="is_bestseller">Mark as Best Seller</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new_arrival"
                    checked={formData.new_arrival}
                    onCheckedChange={(checked) => handleInputChange('new_arrival', checked)}
                  />
                  <Label htmlFor="new_arrival">Mark as New Arrival</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Variants Section */}
          <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 shadow-sm">
            <CardHeader className="pb-3 border-b border-amber-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-800 border border-amber-200">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-amber-950 font-bold flex items-center gap-2">
                      Product Variants &amp; Weight Options
                      {hasVariants && variantsList.length > 0 && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 text-xs">
                          {variantsList.length} {variantsList.length === 1 ? 'option' : 'options'}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Sell this product in multiple weights (250g, 500g, 1kg) or pack sizes with independent prices and inventory.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-amber-300 shadow-sm self-start sm:self-auto">
                  <Checkbox
                    id="has_variants"
                    checked={hasVariants}
                    onCheckedChange={(checked) => {
                      const enabled = !!checked;
                      setHasVariants(enabled);
                      if (enabled && variantsList.length === 0) {
                        applySweetsPreset();
                      }
                    }}
                  />
                  <Label htmlFor="has_variants" className="text-xs font-bold cursor-pointer text-amber-950 select-none">
                    Enable Variants
                  </Label>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {!hasVariants ? (
                <div className="text-center py-6 px-4 bg-white/80 rounded-xl border border-dashed border-amber-200">
                  <Layers className="h-10 w-10 text-amber-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-stone-800">Single option product</p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                    This product currently sells at a single base price and weight. Enable variants to let your customers choose 250g, 500g, 1kg, or custom pack sizes.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium"
                    onClick={() => {
                      setHasVariants(true);
                      applySweetsPreset();
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                    Enable &amp; Quick Add Mithai Weights (250g, 500g, 1kg)
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preset quick buttons */}
                  <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      Quick Presets:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium"
                        onClick={applySweetsPreset}
                      >
                        Mithai (250g, 500g, 1kg)
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium"
                        onClick={applyNamkeenPreset}
                      >
                        Namkeen (200g, 400g, 1kg)
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 font-medium"
                        onClick={applyPcsPreset}
                      >
                        Gift Boxes (8, 16, 24 pcs)
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium"
                        onClick={addEmptyVariant}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Variant
                      </Button>
                    </div>
                  </div>

                  {/* Variants List */}
                  <div className="space-y-3">
                    {variantsList.map((variant, index) => (
                      <div
                        key={variant.id || index}
                        className={`p-3.5 rounded-xl border transition-all ${
                          variant.is_default
                            ? 'bg-amber-50/50 border-amber-400 shadow-sm ring-1 ring-amber-300'
                            : 'bg-white border-stone-200 hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                              Option #{index + 1}
                            </span>
                            <span className="text-sm font-bold text-stone-800">
                              {variant.title || 'Untitled Variant'}
                            </span>
                            {variant.is_default && (
                              <Badge className="bg-amber-600 hover:bg-amber-600 text-white text-[10px] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Default (Shown First)
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant={variant.is_default ? "secondary" : "outline"}
                              className={`h-7 text-xs px-2.5 font-medium ${
                                variant.is_default
                                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                                  : 'text-stone-700 hover:bg-amber-50'
                              }`}
                              onClick={() => setDefaultVariant(index)}
                            >
                              {variant.is_default ? 'Default' : 'Make Default'}
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-stone-500 hover:text-stone-800"
                              disabled={index === 0}
                              onClick={() => moveVariant(index, 'up')}
                              title="Move Up"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-stone-500 hover:text-stone-800"
                              disabled={index === variantsList.length - 1}
                              onClick={() => moveVariant(index, 'down')}
                              title="Move Down"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeVariant(index)}
                              title="Delete Variant"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Variant fields */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                          <div className="col-span-2 sm:col-span-1 md:col-span-2 space-y-1">
                            <Label className="text-xs font-semibold text-stone-700">Option Name *</Label>
                            <Input
                              value={variant.title}
                              onChange={(e) => updateVariant(index, 'title', e.target.value)}
                              placeholder="e.g. 500g Box, 1kg, Pack of 16"
                              className="h-8 text-xs font-medium"
                              required={hasVariants}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-stone-700">Selling Price (₹) *</Label>
                            <Input
                              type="number"
                              value={variant.price || ''}
                              onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                              placeholder="450"
                              min="0"
                              step="0.01"
                              className="h-8 text-xs font-bold text-amber-900"
                              required={hasVariants}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-stone-700">MRP / Cut Price (₹)</Label>
                            <Input
                              type="number"
                              value={variant.original_price || ''}
                              onChange={(e) => updateVariant(index, 'original_price', e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="500"
                              min="0"
                              step="0.01"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-stone-700">Weight (for shipping)</Label>
                            <Input
                              value={variant.weight || ''}
                              onChange={(e) => updateVariant(index, 'weight', e.target.value)}
                              placeholder="e.g. 500g, 1kg"
                              className="h-8 text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-stone-700">Pieces / Info</Label>
                            <Input
                              value={variant.pieces || ''}
                              onChange={(e) => updateVariant(index, 'pieces', e.target.value)}
                              placeholder="e.g. 12-14 pcs"
                              className="h-8 text-xs font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed border-amber-300 text-amber-900 hover:bg-amber-50 font-medium py-4"
                    onClick={addEmptyVariant}
                  >
                    <Plus className="h-4 w-4 mr-1 text-amber-600" /> Add Another Option / Variant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle>Product Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Feature */}
              <div className="space-y-2">
                <Label>Add New Feature</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter new feature name"
                    onKeyPress={(e) => e.key === 'Enter' && addNewFeature()}
                  />
                  <Button type="button" onClick={addNewFeature} disabled={!newFeature.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Available Features */}
              <div className="space-y-4">
                <Label>Available Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {availableFeatures.map((feature) => (
                    <div key={feature} className="flex items-center justify-between space-x-2 p-2 hover:bg-muted rounded">
                      <div className="flex items-center space-x-2 flex-1">
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <Label htmlFor={feature} className="text-sm cursor-pointer flex-1">
                          {feature}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeatureFromAvailable(feature)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Features Preview */}
              {selectedFeatures.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Features ({selectedFeatures.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.map((feature) => (
                      <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeature(feature)}
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product FAQs */}
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-[#2C1810]">
                  <span>❓</span> Product FAQs (Frequently Asked Questions)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Custom Q&A displayed on the product page and used for Google FAQ rich snippets.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadStandardFaqs}
                className="text-xs border-[#8B2131] text-[#8B2131] hover:bg-[#8B2131] hover:text-white"
              >
                + Load Preset Sweets FAQs
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqsList.length === 0 ? (
                <div className="border border-dashed border-amber-300 rounded-lg p-6 text-center bg-white/50">
                  <p className="text-sm text-gray-600 mb-3">No custom FAQs added for this product yet.</p>
                  <div className="flex justify-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={addFaqItem}>
                      + Add First FAQ
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={loadStandardFaqs}>
                      ⚡ Load Presets
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqsList.map((faq, index) => (
                    <div key={index} className="p-4 border border-amber-200 rounded-lg bg-white shadow-sm space-y-3 relative group">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-semibold text-[#8B2131] uppercase tracking-wider">
                          FAQ #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFaqUp(index)}
                            disabled={index === 0}
                            className="h-7 w-7 p-0"
                            title="Move Up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFaqDown(index)}
                            disabled={index === faqsList.length - 1}
                            className="h-7 w-7 p-0"
                            title="Move Down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFaqItem(index)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Remove FAQ"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`faq-q-${index}`} className="text-xs font-medium">Question</Label>
                        <Input
                          id={`faq-q-${index}`}
                          value={faq.question}
                          onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                          placeholder="e.g. Is this sweet suitable for gifting?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`faq-a-${index}`} className="text-xs font-medium">Answer</Label>
                        <Textarea
                          id={`faq-a-${index}`}
                          value={faq.answer}
                          onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                          placeholder="e.g. Yes, it comes in premium rigid box packaging suitable for all celebrations."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFaqItem}
                    className="w-full border-amber-300 text-amber-900 hover:bg-amber-100/50"
                  >
                    + Add Another FAQ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images (Max 10)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Upload Images</Label>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('images')?.click()}
                    disabled={images.length >= 10 || uploadingImage}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : `Upload Images (${images.length}/10)`}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Or Add Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. https://example.com/image.jpg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget as HTMLInputElement;
                          if (input.value.trim()) {
                            if (images.length >= 10) {
                              toast({
                                title: "Limit reached",
                                description: "Maximum 10 images allowed",
                                variant: "destructive"
                              });
                              return;
                            }
                            setImages(prev => [...prev, input.value.trim()]);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          if (images.length >= 10) {
                            toast({
                              title: "Limit reached",
                              description: "Maximum 10 images allowed",
                              variant: "destructive"
                            });
                            return;
                          }
                          setImages(prev => [...prev, input.value.trim()]);
                          input.value = '';
                        }
                      }}
                    >
                      Add URL
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-transparent hover:border-primary transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveImageUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveImageDown(index)}
                          disabled={index === images.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                          disabled={uploadingImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs bg-primary">Primary</Badge>
                      )}
                      <Badge className="absolute top-1 left-1 text-xs bg-black/70 text-white">
                        {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>

                {images.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Upload images or add URLs
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max 10 images total
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={productSpecs.material}
                    onChange={(e) => setProductSpecs({ ...productSpecs, material: e.target.value })}
                    placeholder="e.g., Plastic, Metal, Cotton"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={productSpecs.dimensions}
                    onChange={(e) => setProductSpecs({ ...productSpecs, dimensions: e.target.value })}
                    placeholder="e.g., 30x20x15 cm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_per_unit">Weight per Unit</Label>
                  <Input
                    id="weight_per_unit"
                    value={productSpecs.weight_per_unit}
                    onChange={(e) => setProductSpecs({ ...productSpecs, weight_per_unit: e.target.value })}
                    placeholder="e.g., 500g, 2kg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={productSpecs.brand}
                    onChange={(e) => setProductSpecs({ ...productSpecs, brand: e.target.value })}
                    placeholder="e.g., Samsung, Nike"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={productSpecs.model}
                    onChange={(e) => setProductSpecs({ ...productSpecs, model: e.target.value })}
                    placeholder="e.g., Model XYZ-123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    value={productSpecs.warranty}
                    onChange={(e) => setProductSpecs({ ...productSpecs, warranty: e.target.value })}
                    placeholder="e.g., 1 year, 6 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certification">Certification</Label>
                  <Input
                    id="certification"
                    value={productSpecs.certification}
                    onChange={(e) => setProductSpecs({ ...productSpecs, certification: e.target.value })}
                    placeholder="e.g., ISO 9001, CE, FDA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Country of Origin</Label>
                  <Input
                    id="origin"
                    value={productSpecs.origin}
                    onChange={(e) => setProductSpecs({ ...productSpecs, origin: e.target.value })}
                    placeholder="e.g., India, China, USA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage & Marketing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storage_instructions">Storage Instructions</Label>
                <Textarea
                  id="storage_instructions"
                  value={formData.storage_instructions}
                  onChange={(e) => handleInputChange('storage_instructions', e.target.value)}
                  placeholder="e.g., Store frozen at -18°C or below"
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Marketing Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="marketedBy">Marketed By</Label>
                  <Input
                    id="marketedBy"
                    value={marketingInfo.marketedBy}
                    onChange={(e) => setMarketingInfo({ ...marketingInfo, marketedBy: e.target.value })}
                    placeholder="Company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={marketingInfo.address}
                    onChange={(e) => setMarketingInfo({ ...marketingInfo, address: e.target.value })}
                    placeholder="Company address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={marketingInfo.city}
                      onChange={(e) => setMarketingInfo({ ...marketingInfo, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={marketingInfo.state}
                      onChange={(e) => setMarketingInfo({ ...marketingInfo, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fssaiLicense">FSSAI License</Label>
                  <Input
                    id="fssaiLicense"
                    value={marketingInfo.fssaiLicense}
                    onChange={(e) => setMarketingInfo({ ...marketingInfo, fssaiLicense: e.target.value })}
                    placeholder="FSSAI License number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO & Google Settings */}
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <span>🔍</span> SEO & Google Settings
              </CardTitle>
              <p className="text-xs text-green-700 mt-1">
                Leave blank to auto-generate from product name & description.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meta Title */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="meta_title">Google Title</Label>
                  <span className={`text-xs font-mono ${
                    seoData.meta_title.length > 60
                      ? 'text-red-500 font-bold'
                      : seoData.meta_title.length > 50
                      ? 'text-yellow-600'
                      : 'text-muted-foreground'
                  }`}>
                    {seoData.meta_title.length}/60
                  </span>
                </div>
                <Input
                  id="meta_title"
                  value={seoData.meta_title}
                  onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                  placeholder={formData.name ? `${formData.name} | Raj Luxmi Sweets` : 'e.g. Kaju Katli | Raj Luxmi Sweets'}
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground">Appears as the blue headline in Google results. Max 60 chars.</p>
              </div>

              {/* Meta Description */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="meta_description">Google Description</Label>
                  <span className={`text-xs font-mono ${
                    seoData.meta_description.length > 160
                      ? 'text-red-500 font-bold'
                      : seoData.meta_description.length > 140
                      ? 'text-yellow-600'
                      : 'text-muted-foreground'
                  }`}>
                    {seoData.meta_description.length}/160
                  </span>
                </div>
                <Textarea
                  id="meta_description"
                  value={seoData.meta_description}
                  onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                  placeholder="e.g. Buy fresh Kaju Katli online from Raj Luxmi Sweets — handcrafted, delivered to your door."
                  rows={3}
                  maxLength={180}
                />
                <p className="text-xs text-muted-foreground">The snippet shown under the title in Google. Max 160 chars.</p>
              </div>

              {/* Meta Keywords */}
              <div className="space-y-1">
                <Label htmlFor="meta_keywords">Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={seoData.meta_keywords}
                  onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                  placeholder="e.g. kaju katli, buy sweets online, mithai delivery"
                />
                <p className="text-xs text-muted-foreground">Comma-separated. Not shown publicly but used by some search engines.</p>
              </div>

              {/* Live Preview */}
              {(seoData.meta_title || formData.name) && (
                <div className="mt-4 p-3 border rounded-lg bg-white space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-2">Google Preview</p>
                  <p className="text-[15px] text-blue-700 font-medium leading-tight truncate">
                    {seoData.meta_title || `${formData.name} | Raj Luxmi Sweets`}
                  </p>
                  <p className="text-[13px] text-green-700">rajluxmi.com/product/{formData.sku || 'product-slug'}</p>
                  <p className="text-[13px] text-gray-600 line-clamp-2 leading-snug">
                    {seoData.meta_description ||
                      (formData.description
                        ? formData.description.substring(0, 160)
                        : `Buy ${formData.name} at Raj Luxmi Sweets.`)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading || uploadingImage}>
                  {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/admin/products')}
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

export default ProductForm;
