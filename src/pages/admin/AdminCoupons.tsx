import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  MoreHorizontal,
  Percent,
  DollarSign,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/useCoupons';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface CouponFormData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  expires_at: string;
}

export default function AdminCoupons() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_uses: null,
    expires_at: '',
  });

  const { data: coupons, isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const filteredCoupons = coupons?.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    const data = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      min_order_amount: formData.min_order_amount,
      max_uses: formData.max_uses,
      expires_at: formData.expires_at || null,
    };

    if (editCoupon) {
      updateCoupon.mutate({ id: editCoupon.id, ...data });
    } else {
      createCoupon.mutate(data);
    }

    setIsCreateOpen(false);
    setEditCoupon(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      max_uses: null,
      expires_at: '',
    });
  };

  const openEditDialog = (coupon: any) => {
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || 0,
      max_uses: coupon.max_uses,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
    });
    setEditCoupon(coupon);
    setIsCreateOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCoupon.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-semibold">Coupons</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage discount codes
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        {/* Coupons Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCoupons?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No coupons found</p>
                    <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
                      Create your first coupon
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons?.map((coupon, index) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  return (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {coupon.discount_type === 'percentage' ? (
                            <>
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <span>{coupon.discount_value}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{formatPrice(coupon.discount_value)}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coupon.min_order_amount
                          ? formatPrice(coupon.min_order_amount)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {coupon.used_count || 0}
                        {coupon.max_uses && ` / ${coupon.max_uses}`}
                      </TableCell>
                      <TableCell>
                        {coupon.expires_at
                          ? format(new Date(coupon.expires_at), 'MMM d, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isExpired ? 'destructive' : coupon.is_active ? 'default' : 'outline'}
                        >
                          {isExpired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(coupon)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(coupon.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </motion.div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) {
          setEditCoupon(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
            <DialogDescription>
              {editCoupon ? 'Update the coupon details.' : 'Create a new discount coupon for your customers.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SUMMER20"
                className="uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">Discount Value</Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_order">Min Order Amount</Label>
                <Input
                  id="min_order"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses (optional)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_uses: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiry Date (optional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editCoupon ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
