import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Plus, X, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    notes: '',
    price: 0,
    sale_price: '',
    currency: 'INR',
    size: '100ml',
    stock: 0,
    category_id: '',
    tags: [] as string[],
    images: [] as string[],
    is_visible: true,
    is_featured: false,
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      fetchProduct(id);
    }
  }, [id, isEditing]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        slug: data.slug,
        sku: data.sku || '',
        description: data.description || '',
        notes: data.notes || '',
        price: data.price,
        sale_price: data.sale_price?.toString() || '',
        currency: data.currency || 'INR',
        size: data.size || '100ml',
        stock: data.stock || 0,
        category_id: data.category_id || '',
        tags: data.tags || [],
        images: data.images || [],
        is_visible: data.is_visible ?? true,
        is_featured: data.is_featured ?? false,
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: isEditing ? formData.slug : slugify(name),
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      slug: formData.slug,
      sku: formData.sku || null,
      description: formData.description || null,
      notes: formData.notes || null,
      price: formData.price,
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      currency: formData.currency,
      size: formData.size || null,
      stock: formData.stock,
      category_id: formData.category_id || null,
      tags: formData.tags,
      images: formData.images,
      is_visible: formData.is_visible,
      is_featured: formData.is_featured,
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id, ...productData });
      } else {
        await createProduct.mutateAsync(productData);
      }
      navigate('/admin/products');
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/products')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-3xl font-semibold">
                {isEditing ? 'Edit Product' : 'New Product'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? 'Update product details' : 'Add a new product to your catalog'}
              </p>
            </div>
          </div>
          <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
            {(createProduct.isPending || updateProduct.isPending) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Update' : 'Create'} Product
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="100ml"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Fragrance Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Top: Bergamot, Lemon | Heart: Rose, Jasmine | Base: Sandalwood, Musk"
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold">Images</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground text-center">Add image URL</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <Button type="button" variant="outline" onClick={addImage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Status */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold">Status</h3>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Visible</Label>
                  <p className="text-sm text-muted-foreground">Show in store</p>
                </div>
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(is_visible) =>
                    setFormData({ ...formData, is_visible })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage</p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(is_featured) =>
                    setFormData({ ...formData, is_featured })
                  }
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold">Pricing</h3>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale Price</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Organization */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold">Organization</h3>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(category_id) => setFormData({ ...formData, category_id })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </AdminLayout>
  );
}
