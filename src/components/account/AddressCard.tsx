import { motion } from 'framer-motion';
import { MapPin, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Address } from '@/types';
import { useDeleteAddress, useSetDefaultAddress } from '@/hooks/useAddresses';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  index?: number;
}

export function AddressCard({ address, onEdit, index = 0 }: AddressCardProps) {
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-lg p-4 relative"
    >
      {address.is_default && (
        <Badge className="absolute top-3 right-3 bg-primary/20 text-primary border-0">
          <Star className="h-3 w-3 mr-1 fill-primary" />
          Default
        </Badge>
      )}

      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{address.full_name}</h4>
          <p className="text-sm text-muted-foreground">{address.phone}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {address.address_line1}
            {address.address_line2 && `, ${address.address_line2}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {address.city}, {address.state} {address.postal_code}
          </p>
          <p className="text-sm text-muted-foreground">{address.country}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address)}
          className="flex-1"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit
        </Button>
        {!address.is_default && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDefaultAddress.mutate(address.id)}
            disabled={setDefaultAddress.isPending}
            className="flex-1"
          >
            <Star className="h-4 w-4 mr-2" />
            Set Default
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteAddress.mutate(address.id)}
          disabled={deleteAddress.isPending}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
