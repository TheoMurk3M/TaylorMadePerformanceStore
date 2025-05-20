import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
import { ChevronRight, Minus, Plus, Heart, Share2, Truck, ShieldCheck, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/ui/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "./product-card";
import { Link, useLocation } from "wouter";
import { analyzeProductFeatures } from "@/lib/openai";

interface ProductDetailProps {
  productSlug: string;
}

const ProductDetail = ({ productSlug }: ProductDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [location, navigate] = useLocation();
  const { addItem } = useCart();
  const { toast } = useToast();

  // Fetch product data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productSlug}`],
    staleTime: Infinity,
  });

  // When product data is loaded, generate key features using AI
  useEffect(() => {
    if (data?.product?.description) {
      const fetchKeyFeatures = async () => {
        try {
          const features = await analyzeProductFeatures(data.product.description);
          setKeyFeatures(features);
        } catch (error) {
          console.error("Failed to analyze product features:", error);
          // Fallback to manual extraction
          const sentences = data.product.description.split('.');
          const extractedFeatures = sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 15);
          setKeyFeatures(extractedFeatures);
        }
      };
      
      fetchKeyFeatures();
    }
  }, [data?.product?.description]);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0 && data?.product?.inventoryCount && newQuantity <= data.product.inventoryCount) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!data?.product) return;
    
    setIsAddingToCart(true);
    
    // Add to cart after a brief timeout to show loading state
    setTimeout(() => {
      addItem(data.product, quantity);
      
      toast({
        title: "Added to cart",
        description: `${quantity}x ${data.product.name} has been added to your cart.`,
      });
      
      setIsAddingToCart(false);
    }, 500);
  };

  const handleBuyNow = () => {
    if (!data?.product) return;
    
    // Add to cart and redirect to checkout
    addItem(data.product, quantity);
    navigate("/checkout");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="flex items-center text-gray-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-20" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="w-full aspect-square rounded-md" />
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="flex items-center">
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-2 my-6">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading product details.</p>
          <p className="text-sm">Please try again later or contact support if the problem persists.</p>
          <Button 
            onClick={() => navigate("/products")}
            className="mt-4 bg-primary"
          >
            Browse Other Products
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Product not found</p>
          <p className="text-sm">This product may no longer be available or the URL might be incorrect.</p>
          <Button 
            onClick={() => navigate("/products")}
            className="mt-4 bg-primary"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const { product, recommendedProducts = [], reviews = [] } = data;
  const images = product.images || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/products" className="hover:text-primary">Products</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-700">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={images[selectedImage] || `https://placehold.co/800x800?text=${encodeURIComponent(product.name)}`} 
              alt={product.name} 
              className="w-full aspect-square object-contain p-4"
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {images.slice(0, 4).map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`border rounded-md overflow-hidden ${selectedImage === idx ? 'border-primary' : 'border-gray-200'}`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} - view ${idx + 1}`} 
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          {/* Product Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {product.tags?.map((tag, idx) => (
              <Badge 
                key={idx}
                variant="outline"
                className={`
                  ${tag === "BEST SELLER" ? "border-primary text-primary" : ""}
                  ${tag === "HOT" ? "border-accent text-accent" : ""}
                  ${tag === "NEW" ? "border-green-500 text-green-500" : ""}
                  ${tag === "Low Stock" ? "border-amber-500 text-amber-500" : ""}
                `}
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Product Title */}
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-2">
            {product.name}
          </h1>
          
          {/* Brand */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            By <span className="font-semibold text-accent ml-1">TaylorMade Performance</span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <StarRating rating={parseFloat(product.rating)} />
            <span className="ml-2 text-gray-600">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold text-primary mr-3">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            
            {/* Stock Status */}
            <Badge 
              className={`ml-auto ${
                product.inventoryCount > 10
                  ? "bg-success/10 text-success"
                  : product.inventoryCount > 0
                  ? "bg-warning/10 text-warning"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {product.inventoryCount > 10
                ? "In Stock"
                : product.inventoryCount > 0
                ? `Only ${product.inventoryCount} left`
                : "Out of Stock"}
            </Badge>
          </div>
          
          {/* Short Description */}
          <div className="text-gray-700 mb-6 prose prose-sm max-w-none">
            <p>{product.description.split('.')[0]}.</p>
          </div>
          
          {/* Key Features */}
          {keyFeatures.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {keyFeatures.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Compatible Vehicles */}
          {product.compatibleVehicles && product.compatibleVehicles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Compatible With:</h3>
              <div className="flex flex-wrap gap-2">
                {product.compatibleVehicles.map((vehicle: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-gray-50">
                    {vehicle.make} {vehicle.model} {vehicle.years?.join(', ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Add to Cart Section */}
          <div className="flex items-center gap-4 my-6">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button 
                type="button"
                variant="ghost"
                className="h-12 px-3 text-gray-600 hover:text-primary rounded-r-none"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button 
                type="button"
                variant="ghost"
                className="h-12 px-3 text-gray-600 hover:text-primary rounded-l-none"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.inventoryCount || 9999)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Add to Cart Button */}
            <Button
              className="h-12 flex-grow bg-secondary hover:bg-secondary/90 text-white font-semibold"
              disabled={product.inventoryCount === 0 || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                "Add to Cart"
              )}
            </Button>
            
            {/* Buy Now Button */}
            <Button
              className="h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={product.inventoryCount === 0}
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            <Button variant="outline" className="text-gray-700 flex-1">
              <Heart className="h-5 w-5 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="text-gray-700 flex-1">
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
          
          {/* Shipping & Returns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="border border-gray-200 rounded-md p-3 flex items-start">
              <Truck className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-gray-500">On orders over $200</p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-md p-3 flex items-start">
              <ShieldCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <div>
                <p className="font-semibold">2-Year Warranty</p>
                <p className="text-gray-500">Manufacturer covered</p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-md p-3 flex items-start">
              <Clock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <div>
                <p className="font-semibold">30-Day Returns</p>
                <p className="text-gray-500">Hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details & Reviews Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="prose prose-lg max-w-none">
              <p>{product.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="specs" className="bg-white p-6 rounded-lg shadow-sm">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex border-b border-gray-100 pb-3">
                    <span className="font-semibold text-gray-700 w-1/3">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span className="text-gray-600 w-2/3">{value as string}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specifications available for this product.</p>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="bg-white p-6 rounded-lg shadow-sm">
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review: Review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.title || "Review"}</h4>
                        <div className="flex items-center mt-1">
                          <StarRating rating={review.rating} />
                          <span className="ml-2 text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      {review.isVerifiedPurchase && (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mt-2">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">This product has no reviews yet.</p>
                <Button className="bg-primary">Write a Review</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Recommended Products */}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold font-heading text-secondary mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {recommendedProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
