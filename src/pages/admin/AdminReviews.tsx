import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Search, Star, Check, X, Flag, MessageSquare, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useAdminReviews, useUpdateReview, useDeleteReview, useAdminReplyToReview } from '@/hooks/useReviews';
import { ReviewStars } from '@/components/reviews/ReviewStars';
import { toast } from 'sonner';

export default function AdminReviews() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'spam'>('pending');
  const [replyDialog, setReplyDialog] = useState<{ id: string; reply: string } | null>(null);
  
  const { data: reviews, isLoading } = useAdminReviews(tab);
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const replyToReview = useAdminReplyToReview();

  const handleApprove = (id: string) => updateReview.mutate({ id, is_approved: true, is_spam: false });
  const handleReject = (id: string) => updateReview.mutate({ id, is_approved: false });
  const handleSpam = (id: string) => updateReview.mutate({ id, is_spam: true, is_approved: false });
  const handleFeature = (id: string, featured: boolean) => updateReview.mutate({ id, is_featured: !featured });
  
  const handleReply = () => {
    if (replyDialog) {
      replyToReview.mutate({ id: replyDialog.id, reply: replyDialog.reply });
      setReplyDialog(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-semibold">Reviews</h1>
          <p className="text-muted-foreground mt-1">Moderate customer reviews</p>
        </motion.div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="spam">Spam</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : reviews?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No {tab} reviews</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews?.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {review.product?.images?.[0] && (
                              <img src={review.product.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                            )}
                            <span className="font-medium text-sm">{review.product?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ReviewStars rating={review.rating} size="sm" />
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div>
                            {review.title && <p className="font-medium text-sm">{review.title}</p>}
                            <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                            {review.is_verified_purchase && (
                              <Badge variant="outline" className="mt-1 text-xs">Verified</Badge>
                            )}
                            {review.is_featured && (
                              <Badge className="mt-1 ml-1 text-xs">Featured</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {review.user_profile?.full_name || 'Anonymous'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {tab === 'pending' && (
                              <>
                                <Button size="icon" variant="ghost" onClick={() => handleApprove(review.id)} title="Approve">
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleSpam(review.id)} title="Mark as Spam">
                                  <Flag className="h-4 w-4 text-orange-500" />
                                </Button>
                              </>
                            )}
                            {tab === 'approved' && (
                              <>
                                <Button size="icon" variant="ghost" onClick={() => handleFeature(review.id, review.is_featured)} title={review.is_featured ? 'Unfeature' : 'Feature'}>
                                  <Star className={`h-4 w-4 ${review.is_featured ? 'fill-primary text-primary' : ''}`} />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setReplyDialog({ id: review.id, reply: review.admin_reply || '' })} title="Reply">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => deleteReview.mutate(review.id)} title="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <Textarea
            value={replyDialog?.reply || ''}
            onChange={(e) => setReplyDialog(prev => prev ? { ...prev, reply: e.target.value } : null)}
            placeholder="Write your reply..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialog(null)}>Cancel</Button>
            <Button onClick={handleReply} disabled={replyToReview.isPending}>Save Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}