import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Helmet } from 'react-helmet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PersonalizedOffers from '../components/PersonalizedOffers';
import { initSessionTracking } from '../lib/salesFunnel';

// Initialize session tracking
initSessionTracking();

export default function ProductDetail() {
  const [, params] = useRoute('/products/:slug');
  const slug = params?.slug;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await apiRequest('GET', `/api/products/slug/${slug}`);
      return response.json();
    },
    enabled: !!slug,
  });
  
  // Fetch category details
  const { data: category } = useQuery({
    queryKey: ['category', product?.categoryId],
    queryFn: async () => {
      if (!product?.categoryId) return null;
      const response = await apiRequest('GET', `/api/categories/${product.categoryId}`);
      return response.json();
    },
    enabled: !!product?.categoryId,
  });
  
  // Fetch brand details
  const { data: brand } = useQuery({
    queryKey: ['brand', product?.brandId],
    queryFn: async () => {
      if (!product?.brandId) return null;
      const response = await apiRequest('GET', `/api/brands/${product.brandId}`);
      return response.json();
    },
    enabled: !!product?.brandId,
  });
  
  // Fetch product reviews
  const { data: reviews } = useQuery({
    queryKey: ['productReviews', product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const response = await apiRequest('GET', `/api/products/${product.id}/reviews`);
      return response.json();
    },
    enabled: !!product?.id,
  });
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      // In a real implementation, this would add to cart in localStorage or server
      // For now, we'll just show a toast
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart`,
      });
      
      // Invalidate cart query to refresh cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Could not add product to cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-96 w-full rounded-md" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p>Sorry, we couldn't find the product you're looking for.</p>
        </Card>
      </div>
    );
  }
  
  // Parse price and compare at price
  const price = parseFloat(product.price);
  const compareAtPrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const discountPercentage = compareAtPrice ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  
  // Format the product images
  const productImages = Array.isArray(product.images) ? product.images : [product.images];
  
  return (
    <>
      <Helmet>
        <title>{product.name} - Taylor Made Performance UTV Parts</title>
        <meta name="description" content={product.metaDescription || product.description.slice(0, 160)} />
        <meta property="og:title" content={`${product.name} - Taylor Made Performance UTV Parts`} />
        <meta property="og:description" content={product.metaDescription || product.description.slice(0, 160)} />
        {productImages[0] && <meta property="og:image" content={productImages[0]} />}
      </Helmet>
      
      <div className="container mx-auto py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-500">
          <span className="hover:underline cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          {category && (
            <>
              <span className="hover:underline cursor-pointer">{category.name}</span>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="font-medium text-gray-900">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            {productImages[0] ? (
              <img 
                src={productImages[0]} 
                alt={product.name} 
                className="w-full h-auto rounded-lg object-cover"
              />
            ) : (
              <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            
            {/* Thumbnail images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {productImages.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`${product.name} - view ${index + 1}`}
                    className="w-full h-20 object-cover rounded border hover:border-primary cursor-pointer"
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {brand && (
                <p className="text-sm text-gray-600">Brand: {brand.name}</p>
              )}
              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
            </div>
            
            <div className="flex items-center">
              <span className="text-3xl font-bold">${price.toFixed(2)}</span>
              {compareAtPrice && (
                <>
                  <span className="ml-4 text-lg text-gray-500 line-through">${compareAtPrice.toFixed(2)}</span>
                  <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>
            
            {product.inventoryCount !== null && (
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${product.inventoryCount > 10 ? 'bg-green-500' : product.inventoryCount > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span>
                  {product.inventoryCount > 10 
                    ? 'In Stock' 
                    : product.inventoryCount > 0 
                      ? `Only ${product.inventoryCount} left` 
                      : 'Out of Stock'}
                </span>
              </div>
            )}
            
            <div className="prose">
              <p>{product.description}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex border rounded-md overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center focus:outline-none" 
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                >
                  +
                </button>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                className="px-8"
                disabled={product.inventoryCount !== null && product.inventoryCount <= 0}
              >
                Add to Cart
              </Button>
            </div>
            
            {/* Shipping, Returns */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-600">Shipping:</span>
                <span>2-5 business days</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Returns:</span>
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Fitment:</span>
                <span>Guaranteed to fit your UTV model</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="w-full mb-12">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
            <TabsTrigger value="fitment">Vehicle Fitment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="py-4">
            <div className="prose max-w-none">
              <h3>Product Details</h3>
              <p>{product.description}</p>
              <ul>
                <li>Premium quality materials built to last</li>
                <li>Easy installation with included hardware</li>
                <li>Enhances both performance and appearance</li>
                <li>Made specifically for your UTV model</li>
              </ul>
              <p>This product is a direct replacement for your factory part, ensuring a perfect fit and seamless integration with your vehicle's systems.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Material</td>
                      <td className="py-2">High-grade aluminum / steel</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Weight</td>
                      <td className="py-2">4.5 lbs (2.04 kg)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Dimensions</td>
                      <td className="py-2">12" x 8" x 3" (30.5cm x 20.3cm x 7.6cm)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Color</td>
                      <td className="py-2">Matte Black</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Hardware</td>
                      <td className="py-2">Included</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Package Contents</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>1 x {product.name}</li>
                  <li>Mounting hardware kit</li>
                  <li>Installation instructions</li>
                  <li>Warranty card</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="py-4">
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{review.title}</h4>
                        <div className="flex items-center text-yellow-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{review.rating} out of 5</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p>{review.content}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      By {review.userName}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="fitment" className="py-4">
            <div className="prose max-w-none">
              <h3>Vehicle Compatibility</h3>
              <p>This product is compatible with the following UTV models:</p>
              
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium">Polaris</h4>
                  <ul className="list-disc pl-5">
                    <li>RZR XP 1000 (2019-2023)</li>
                    <li>RZR XP Turbo (2018-2023)</li>
                    <li>RZR XP 4 1000 (2019-2023)</li>
                    <li>RZR Pro XP (2020-2023)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Can-Am</h4>
                  <ul className="list-disc pl-5">
                    <li>Maverick X3 (2017-2023)</li>
                    <li>Maverick X3 Max (2017-2023)</li>
                    <li>Defender HD10 (2020-2023)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Yamaha</h4>
                  <ul className="list-disc pl-5">
                    <li>YXZ1000R (2019-2023)</li>
                    <li>YXZ1000R SS (2019-2023)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Honda</h4>
                  <ul className="list-disc pl-5">
                    <li>Talon 1000X (2019-2023)</li>
                    <li>Talon 1000R (2019-2023)</li>
                  </ul>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                * If your model is not listed, please contact us to verify compatibility before ordering.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Personalized Recommendations */}
        <PersonalizedOffers currentProductId={product.id} title="Customers Also Purchased" />
      </div>
    </>
  );
}