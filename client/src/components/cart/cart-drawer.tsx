import { useCart } from "@/hooks/use-cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, X } from "lucide-react";
import CartItem from "./cart-item";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateItemQuantity,
    cartTotal,
    cartCount,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="sm:max-w-md w-full pr-0">
        <SheetHeader className="pr-6">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
              {cartCount > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({cartCount} {cartCount === 1 ? "item" : "items"})
                </span>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={closeCart}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
            <p className="text-gray-500 text-center mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button className="bg-primary" onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[65vh] mt-6 pr-6">
              <div className="space-y-1">
                {items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onQuantityChange={updateItemQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-gray-200 pt-4 mt-4 pr-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-600">Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between mb-6 font-semibold text-lg">
                <span>Estimated Total</span>
                <span className="text-primary">{formatPrice(cartTotal)}</span>
              </div>
              <div className="grid gap-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 h-12"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
