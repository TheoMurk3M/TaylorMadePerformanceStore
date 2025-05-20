import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShoppingBag, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import CartItem from "@/components/cart/cart-item";
import { formatPrice } from "@/lib/utils";
import { Helmet } from "react-helmet";

const CartPage = () => {
  const { items, updateItemQuantity, removeItem, cartTotal } = useCart();
  const [, navigate] = useLocation();
  const [shippingCost, setShippingCost] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [estimatedTax, setEstimatedTax] = useState(0);

  // Calculate tax and shipping when cart total changes
  useEffect(() => {
    // Tax calculation (simplified - 8%)
    const tax = cartTotal * 0.08;
    setEstimatedTax(tax);

    // Shipping calculation (free shipping over $200)
    const shipping = cartTotal > 200 ? 0 : 15;
    setShippingCost(shipping);
  }, [cartTotal]);

  // Handle shipping calculation
  const calculateShipping = () => {
    setIsCalculatingShipping(true);
    // Simulate shipping calculation
    setTimeout(() => {
      const shipping = cartTotal > 200 ? 0 : 15;
      setShippingCost(shipping);
      setIsCalculatingShipping(false);
    }, 1000);
  };

  // Calculate order total
  const orderTotal = cartTotal + shippingCost + estimatedTax;

  return (
    <>
      <Helmet>
        <title>Shopping Cart | Taylor Made Performance UTV Parts</title>
        <meta name="description" content="Review your shopping cart items, update quantities, and proceed to checkout." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-6">
          Your Shopping Cart
        </h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <h2 className="text-lg font-semibold">
                    Cart Items ({items.reduce((total, item) => total + item.quantity, 0)})
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-red-500 flex items-center"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to remove all items from your cart?")) {
                        items.forEach(item => removeItem(item.product.id));
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear Cart
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onQuantityChange={updateItemQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => navigate("/products")}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                  
                  <Button 
                    className="bg-primary hover:bg-primary/90 flex items-center"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-32">
                <h2 className="text-lg font-semibold border-b pb-4 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping</span>
                    <div className="flex items-center">
                      {isCalculatingShipping ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <span className="font-medium">{formatPrice(shippingCost)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Tax</span>
                    <span className="font-medium">{formatPrice(estimatedTax)}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Order Total</span>
                      <span className="text-primary">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center py-3"
                    onClick={() => navigate("/checkout")}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
                
                <div className="mt-6 text-center text-sm text-gray-500">
                  {cartTotal < 200 ? (
                    <p>Add {formatPrice(200 - cartTotal)} more to qualify for free shipping!</p>
                  ) : (
                    <p>Your order qualifies for free shipping! 🎉</p>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-2">We Accept</h3>
                  <div className="flex gap-2">
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/visa.svg" alt="Visa" className="h-8 w-12 opacity-70" />
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/mastercard.svg" alt="Mastercard" className="h-8 w-12 opacity-70" />
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/americanexpress.svg" alt="American Express" className="h-8 w-12 opacity-70" />
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/paypal.svg" alt="PayPal" className="h-8 w-12 opacity-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
