'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Search, Save, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock_quantity: number;
}

interface FeaturedProductsManagerProps {
    title: string;
    description: string;
    settingKey: string;
}

const FeaturedProductsManager = ({ title, description, settingKey }: FeaturedProductsManagerProps) => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, [settingKey]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all active products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select(`
          id,
          name,
          price,
          images,
          stock_quantity,
          categories(name)
        `)
                .eq('is_active', true)
                .order('name');

            if (productsError) throw productsError;

            const formattedProducts = productsData.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.images?.[0] || '/placeholder.svg',
                category: p.categories?.name || 'Uncategorized',
                stock_quantity: p.stock_quantity
            }));

            setAllProducts(formattedProducts);

            // Fetch current selection from settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('settings')
                .select('value')
                .eq('key', settingKey)
                .single();

            if (settingsError && settingsError.code !== 'PGRST116') {
                throw settingsError;
            }

            if (settingsData?.value) {
                const ids = (settingsData.value as any).product_ids || [];
                // Verify ids exist in current products (in case products were deleted)
                const validIds = ids.filter((id: string) => formattedProducts.some(p => p.id === id));
                setSelectedProductIds(validIds);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: "Error",
                description: "Failed to load products",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Check if setting exists first
            const { data: existingSetting } = await supabase
                .from('settings')
                .select('id')
                .eq('key', settingKey)
                .single();

            if (existingSetting) {
                const { error } = await supabase
                    .from('settings')
                    .update({
                        value: { product_ids: selectedProductIds },
                        is_public: true,     // ← required so non-admin users can read via RLS
                        updated_at: new Date().toISOString()
                    })
                    .eq('key', settingKey);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('settings')
                    .insert({
                        key: settingKey,
                        value: { product_ids: selectedProductIds },
                        description: `Featured products for ${title}`,
                        is_public: true      // ← required so non-admin users can read via RLS
                    });
                if (error) throw error;
            }

            toast({
                title: "Success",
                description: "Featured products updated successfully",
            });
        } catch (error) {
            console.error('Error saving:', error);
            toast({
                title: "Error",
                description: "Failed to save changes",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleProduct = (id: string) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(prev => prev.filter(pid => pid !== id));
        } else {
            // Optional: Limit to 10 products if desired, but user said "select and 10 item", assuming approx.
            // Let's not strictly limit but maybe warn? User just said "select".
            setSelectedProductIds(prev => [...prev, id]);
        }
    };

    const moveProduct = (index: number, direction: 'up' | 'down') => {
        const newIds = [...selectedProductIds];
        if (direction === 'up' && index > 0) {
            [newIds[index], newIds[index - 1]] = [newIds[index - 1], newIds[index]];
        } else if (direction === 'down' && index < newIds.length - 1) {
            [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
        }
        setSelectedProductIds(newIds);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const selectedProducts = selectedProductIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean) as Product[];

    const availableProducts = allProducts.filter(p =>
        !selectedProductIds.includes(p.id) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-muted-foreground mt-1">{description}</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selected Products Column */}
                <Card className="h-[calc(100vh-250px)] flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Selected Products ({selectedProductIds.length})</span>
                        </CardTitle>
                        <CardDescription>
                            These products will appear in the {title} section. Order matters.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        {selectedProducts.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No products selected via this list.
                                <br />
                                Add products from the available list.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedProducts.map((product, index) => (
                                    <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors group">
                                        <div className="flex flex-col gap-1 mr-2 text-muted-foreground">
                                            <button
                                                onClick={() => moveProduct(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:text-foreground disabled:opacity-30"
                                            >
                                                <ArrowUp className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => moveProduct(index, 'down')}
                                                disabled={index === selectedProducts.length - 1}
                                                className="p-1 hover:text-foreground disabled:opacity-30"
                                            >
                                                <ArrowDown className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{product.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{formatPrice(product.price)}</span>
                                                <span>•</span>
                                                <span>{product.category}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => toggleProduct(product.id)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Available Products Column */}
                <Card className="h-[calc(100vh-250px)] flex flex-col">
                    <CardHeader>
                        <CardTitle>Available Products</CardTitle>
                        <CardDescription>
                            Search and add products to the list.
                        </CardDescription>
                        <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or category..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-2">
                            {availableProducts.slice(0, 50).map(product => (
                                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{product.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{formatPrice(product.price)}</span>
                                            <span>•</span>
                                            <span>{product.category}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => toggleProduct(product.id)}
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            ))}
                            {availableProducts.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No matching products found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FeaturedProductsManager;
