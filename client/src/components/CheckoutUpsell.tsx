/**
 * Checkout upsell component for last-minute conversion optimization
 * This implements the critical "last chance" conversion point in the funnel
 */
import React, { useEffect, useState } from 'react';
import { getCheckoutOffers, type CheckoutOffer } from '../lib/salesFunnel';
import { useCart } from '../hooks/use-cart';
import { useAuth } from '../context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CheckoutUpsellProps {
  onAddToOrder: (productId: number) => void;
}

const CheckoutUpsell: React.FC<CheckoutUpsellProps> = ({ onAddToOrder }) => {
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<CheckoutOffer | null>(null);
  const { items } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Convert cart items to format needed by API
  const cartItems = items.map(item => ({
    productId: item.product.id,
    quantity: item.quantity
  }));

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await getCheckoutOffers(cartItems, user?.id);
        
        if (data && data.offers && data.offers.length > 0) {
          // Just show the first offer at checkout to avoid overloading user
          setOffer(data.offers[0]);
        } else {
          setOffer(null);
        }
      } catch (error) {
        console.error('Error fetching checkout offers:', error);
        setOffer(null);
      } finally {
        setLoading(false);
      }
    };

    if (cartItems.length > 0) {
      fetchOffers();
    }
  }, [cartItems, user?.id]);

  // Don't show anything if we don't have an offer
  if (!loading && !offer) {
    return null;
  }

  const handleAddToOrder = () => {
    if (offer) {
      onAddToOrder(offer.id);
      toast({
        title: "Added to order!",
        description: `${offer.name} has been added to your order.`,
      });
    }
  };

  return (
    <div className="my-6">
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : offer ? (
        <Card className="overflow-hidden border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {offer.image && (
                <div className="w-full md:w-1/3 h-48 md:h-auto">
                  <img 
                    src={offer.image} 
                    alt={offer.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <div className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm inline-block self-start mb-2">
                  SPECIAL OFFER
                </div>
                <h3 className="text-xl font-bold mb-2">{offer.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{offer.message}</p>
                <div className="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-lg font-bold">
                    ${typeof offer.price === 'number' 
                      ? offer.price.toFixed(2) 
                      : parseFloat(offer.price).toFixed(2)}
                  </div>
                  <Button 
                    onClick={handleAddToOrder}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {offer.cta}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default CheckoutUpsell;