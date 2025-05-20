import React, { useEffect, useState } from 'react';
import { getPersonalizedRecommendations, trackProductView } from '../lib/salesFunnel';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';

interface PersonalizedOffersProps {
  currentProductId?: number;
  title?: string;
  limit?: number;
}

const PersonalizedOffers = ({ 
  currentProductId,
  title = "Recommended Products",
  limit = 4
}: PersonalizedOffersProps) => {
  const { toast } = useToast();
  
  // Track product view when component mounts
  useEffect(() => {
    if (currentProductId) {
      trackProductView(currentProductId).catch(error => {
        console.error('Error tracking product view:', error);
      });
    }
  }, [currentProductId]);
  
  // Fetch personalized recommendations
  const { data: recommendedProductIds, isLoading, error } = useQuery({
    queryKey: ['personalizedRecommendations', currentProductId, limit],
    queryFn: async () => {
      try {
        return await getPersonalizedRecommendations(currentProductId, limit);
      } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
      }
    },
    enabled: true
  });
  
  // Fetch product details for the recommended products
  const { data: recommendedProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['productDetails', recommendedProductIds],
    queryFn: async () => {
      if (!recommendedProductIds || recommendedProductIds.length === 0) return [];
      
      const promises = recommendedProductIds.map(id => 
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
    enabled: !!recommendedProductIds && recommendedProductIds.length > 0
  });
  
  // Add to cart handler
  const handleAddToCart = (productId: number) => {
    // Add to cart logic would go here
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    });
  };
  
  if (isLoading || isLoadingProducts) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(limit).fill(0).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-48 w-full" />
              <CardContent className="py-4">
                <Skeleton className="h-4 w-3/4 my-2" />
                <Skeleton className="h-4 w-1/2 my-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    console.error('Error fetching recommendations:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error loading recommendations. Please try again later.</p>
      </div>
    );
  }
  
  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null; // Don't show anything if no recommendations
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendedProducts.map(product => (
          <Card key={product.id} className="flex flex-col h-full">
            <div className="h-48 overflow-hidden relative">
              {product.images && (
                <img 
                  src={Array.isArray(product.images) ? product.images[0] : product.images} 
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              )}
              {product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price) && (
                <span className="absolute top-2 right-2 bg-red-500 text-white py-1 px-2 rounded-md text-sm font-medium">
                  Sale
                </span>
              )}
            </div>
            <CardContent className="py-4 flex-grow">
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-medium text-lg hover:text-primary cursor-pointer">{product.name}</h3>
              </Link>
              <div className="flex justify-between items-center mt-2">
                <div className="text-lg font-bold">${parseFloat(product.price).toFixed(2)}</div>
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
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedOffers;