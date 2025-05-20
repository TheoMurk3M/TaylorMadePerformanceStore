import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem = ({ item, onQuantityChange, onRemove }: CartItemProps) => {
  const { product, quantity } = item;
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    
    if (newQuantity > 0 && newQuantity <= (product.inventoryCount || 100)) {
      setIsUpdating(true);
      
      // Simulate a brief loading state for better UX
      setTimeout(() => {
        onQuantityChange(product.id, newQuantity);
        setIsUpdating(false);
      }, 300);
    }
  };

  const handleRemove = () => {
    setIsUpdating(true);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      onRemove(product.id);
      setIsUpdating(false);
    }, 300);
  };

  const itemTotalPrice = parseFloat(product.price) * quantity;

  return (
    <div className={`flex py-4 border-b ${isUpdating ? 'opacity-60' : ''}`}>
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
        <img
          src={product.images?.[0] || `https://placehold.co/200x200?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-grow ml-4">
        <Link href={`/product/${product.slug}`} className="text-secondary font-semibold hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </Link>
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-gray-500">
            <span>SKU: {product.sku}</span>
          </div>
          <div className="text-primary font-semibold">
            {formatPrice(product.price)}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border border-gray-200 rounded">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none text-gray-500 hover:text-primary"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isUpdating}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none text-gray-500 hover:text-primary"
              onClick={() => handleQuantityChange(1)}
              disabled={isUpdating || quantity >= (product.inventoryCount || 100)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center">
            <span className="mr-2 font-medium">{formatPrice(itemTotalPrice)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
