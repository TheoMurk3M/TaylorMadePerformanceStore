import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Order, OrderItem } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronRight, Package, Truck } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [activeStep, setActiveStep] = useState<number>(0);

  // Get order details
  const { data: order, isLoading } = useQuery<Order>({ 
    queryKey: ['/api/orders', orderNumber],
    enabled: !!orderNumber
  });

  // Get order items
  const { data: orderItems, isLoading: isItemsLoading } = useQuery<OrderItem[]>({ 
    queryKey: ['/api/orders', orderNumber, 'items'],
    enabled: !!orderNumber
  });

  useEffect(() => {
    // Simulate order processing steps advancing
    if (order) {
      const timer = setInterval(() => {
        setActiveStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [order]);

  if (isLoading || isItemsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Order Not Found</CardTitle>
            <CardDescription>
              We couldn't find an order with the number {orderNumber}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Format amount
  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  // Generate tracking number
  const generateTrackingNumber = () => {
    return `TM${Math.floor(10000000 + Math.random() * 90000000)}US`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Order Confirmation | TaylorMade Performance</title>
        <meta name="description" content="Your order has been confirmed. Track your order status and view details." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-4">Thank You for Your Order!</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Your order #{order.orderNumber} has been confirmed.
          </p>
          <p className="text-lg text-muted-foreground">
            A confirmation email has been sent to the email address provided.
          </p>
        </div>

        {/* Order Progress */}
        <div className="mb-12">
          <h2 className="text-xl font-heading font-semibold mb-6">Order Progress</h2>
          <div className="relative">
            <div className="absolute left-0 top-5 w-full h-1 bg-gray-200">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${(activeStep / 3) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between relative">
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 mx-auto ${activeStep >= 0 ? 'bg-primary text-white border-primary' : 'border-gray-300 bg-white'}`}>
                  {activeStep >= 0 ? <Check className="h-5 w-5" /> : "1"}
                </div>
                <p className="text-sm font-medium">Order Placed</p>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 mx-auto ${activeStep >= 1 ? 'bg-primary text-white border-primary' : 'border-gray-300 bg-white'}`}>
                  {activeStep >= 1 ? <Check className="h-5 w-5" /> : "2"}
                </div>
                <p className="text-sm font-medium">Processing</p>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 mx-auto ${activeStep >= 2 ? 'bg-primary text-white border-primary' : 'border-gray-300 bg-white'}`}>
                  {activeStep >= 2 ? <Check className="h-5 w-5" /> : "3"}
                </div>
                <p className="text-sm font-medium">Ready to Ship</p>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 mx-auto ${activeStep >= 3 ? 'bg-primary text-white border-primary' : 'border-gray-300 bg-white'}`}>
                  {activeStep >= 3 ? <Check className="h-5 w-5" /> : "4"}
                </div>
                <p className="text-sm font-medium">Shipped</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Order #{order.orderNumber}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-semibold mb-2 flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Items in Your Order
                    </h3>
                    <div className="space-y-4">
                      {orderItems && orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                            {item.product.imageUrl ? (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 opacity-30" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatAmount(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Shipping Information</h3>
                      {order.shippingAddress && (
                        <div className="text-sm space-y-1">
                          <p className="font-medium">{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                          <p>{order.shippingAddress.country}</p>
                          {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Shipping Method</h3>
                      <div className="flex items-start space-x-2">
                        <Truck className="h-5 w-5 mt-0.5" />
                        <div>
                          <p className="font-medium">{order.shippingMethod || "Standard Shipping"}</p>
                          <p className="text-sm text-muted-foreground">
                            {activeStep >= 3 
                              ? `Shipped on ${new Date().toLocaleDateString()}` 
                              : "Expected to ship within 1-2 business days"}
                          </p>
                          {activeStep >= 3 && (
                            <p className="text-sm mt-1">
                              Tracking #: <span className="font-medium">{generateTrackingNumber()}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatAmount(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatAmount(order.shippingCost || "0.00")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatAmount(order.tax || "0.00")}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatAmount(order.total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/products">
                    Continue Shopping <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;