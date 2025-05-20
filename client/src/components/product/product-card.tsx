import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import StarRating from "@/components/ui/star-rating";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const {
    id,
    name,
    slug,
    price,
    compareAtPrice,
    images,
    brandId,
    inventoryCount,
    rating,
    reviewCount,
    tags
  } = product;

  const primaryImage = images && images.length > 0 ? images[0] : "";
  const discountPercentage = compareAtPrice ? calculateDiscount(price, compareAtPrice) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail page
    setIsAddingToCart(true);
    
    // Simulate a brief loading state
    setTimeout(() => {
      addItem(product, 1);
      
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
      
      setIsAddingToCart(false);
    }, 500);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail page
    
    toast({
      title: "Added to wishlist",
      description: `${name} has been added to your wishlist.`,
    });
  };

  return (
    <Link href={`/product/${slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden product-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full flex flex-col">
        <div className="relative">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="absolute top-2 left-2 z-10">
              {tags.includes("BEST SELLER") && (
                <Badge className="bg-primary text-white text-xs font-bold mb-1 block">BEST SELLER</Badge>
              )}
              {tags.includes("HOT") && (
                <Badge className="bg-accent text-white text-xs font-bold mb-1 block">HOT</Badge>
              )}
              {tags.includes("NEW") && (
                <Badge className="bg-green-500 text-white text-xs font-bold mb-1 block">NEW</Badge>
              )}
              {discountPercentage > 0 && (
                <Badge className="bg-red-500 text-white text-xs font-bold block">SAVE {discountPercentage}%</Badge>
              )}
            </div>
          )}
          
          {/* Product Image */}
          <img 
            src={primaryImage || `https://placehold.co/500x375?text=${encodeURIComponent(name)}`} 
            alt={name} 
            className="w-full h-56 object-cover"
          />
          
          {/* Quick action buttons */}
          <div className="absolute top-2 right-2 space-y-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-8 h-8 bg-white/80 hover:bg-white shadow-md backdrop-blur-sm"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-5 w-5 text-gray-700" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-8 h-8 bg-white/80 hover:bg-white shadow-md backdrop-blur-sm"
            >
              <Eye className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          {/* Brand & Rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-accent font-medium">TaylorMade</span>
            <div className="flex items-center">
              <StarRating rating={parseFloat(rating)} />
              <span className="text-sm text-gray-500 ml-1">({reviewCount})</span>
            </div>
          </div>
          
          {/* Product Name */}
          <h3 className="font-heading font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
          
          {/* Product Description (truncated) */}
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
            {product.description.length > 100
              ? `${product.description.substring(0, 100)}...`
              : product.description}
          </p>
          
          {/* Price & Stock */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-primary font-bold text-xl">{formatPrice(price)}</span>
              {compareAtPrice && (
                <span className="text-gray-500 line-through text-sm ml-2">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>
            
            <Badge
              variant={inventoryCount > 10 ? "default" : inventoryCount > 0 ? "outline" : "destructive"}
              className={`${
                inventoryCount > 10
                  ? "bg-success/10 text-success hover:bg-success/10"
                  : inventoryCount > 0
                  ? "bg-warning/10 text-warning hover:bg-warning/10"
                  : "bg-destructive/10 text-destructive hover:bg-destructive/10"
              } text-xs px-2 py-1 rounded`}
            >
              {inventoryCount > 10
                ? "In Stock"
                : inventoryCount > 0
                ? "Low Stock"
                : "Out of Stock"}
            </Badge>
          </div>
          
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={inventoryCount === 0 || isAddingToCart}
            className="mt-4 w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-2 px-4 rounded-md transition flex items-center justify-center"
          >
            {isAddingToCart ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
