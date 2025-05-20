import React, { useEffect } from 'react';
import { getCheckoutOffers } from '../lib/salesFunnel';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutUpsellProps {
  cartProductIds: number[];
  onAddToCart: (productId: number) => void;
  limit?: number;
}

const CheckoutUpsell = ({ 
  cartProductIds,
  onAddToCart,
  limit = 2
}: CheckoutUpsellProps) => {
  const { toast } = useToast();
  
  // Fetch checkout upsell offers
  const { data: upsellProductIds, isLoading, error } = useQuery({
    queryKey: ['checkoutUpsells', cartProductIds.join(','), limit],
    queryFn: async () => {
      try {
        return await getCheckoutOffers(cartProductIds, limit);
      } catch (error) {
        console.error('Error getting upsell offers:', error);
        return [];
      }
    },
    enabled: cartProductIds.length > 0
  });
  
  // Fetch product details for upsell products
  const { data: upsellProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['productDetails', upsellProductIds],
    queryFn: async () => {
      if (!upsellProductIds || upsellProductIds.length === 0) return [];
      
      const promises = upsellProductIds.map(id => 
        apiRequest('GET', `/api/products/${id}`)
          .then(res => res.json())
          .catch(err => {
            console.error(`Error fetching product ${id}:`, err);
            return null;
          })
      );
      
      const results = await Promise.all(promises);
      return results.filter(Boolean); // Remove nulls from failures
    },
    enabled: !!upsellProductIds && upsellProductIds.length > 0
  });
  
  // Add to cart handler
  const handleAddToCart = (productId: number) => {
    onAddToCart(productId);
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    });
  };
  
  if (!cartProductIds.length) {
    return null; // Don't show upsells when cart is empty
  }
  
  if (isLoading || isLoadingProducts) {
    return (
      <div className="my-8 p-6 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Complete Your Purchase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className="flex">
              <div className="w-1/3">
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="w-2/3">
                <CardContent className="py-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4 mt-2" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return null; // Don't show errors at checkout
  }
  
  if (!upsellProducts || upsellProducts.length === 0) {
    return null; // Don't show anything if no upsells
  }
  
  return (
    <div className="my-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Customers Also Bought</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upsellProducts.map(product => (
          <Card key={product.id} className="flex overflow-hidden">
            <div className="w-1/3">
              {product.images && (
                <img 
                  src={Array.isArray(product.images) ? product.images[0] : product.images} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="w-2/3">
              <CardContent className="py-4">
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex items-center mt-2">
                  <div className="text-lg font-bold mr-2">${parseFloat(product.price).toFixed(2)}</div>
                  {product.compareAtPrice && (
                    <div className="text-sm line-through text-gray-400">
                      ${parseFloat(product.compareAtPrice).toFixed(2)}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleAddToCart(product.id)} 
                  className="w-full"
                  variant="outline"
                >
                  Add to Order
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CheckoutUpsell;