import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { ChevronRight } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Form schema for checkout
const checkoutSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  shippingAddress: z.object({
    line1: z.string().min(5, { message: "Address must be at least 5 characters" }),
    line2: z.string().optional(),
    city: z.string().min(2, { message: "City is required" }),
    state: z.string().min(2, { message: "State is required" }),
    postalCode: z.string().min(5, { message: "Postal code is required" }),
    country: z.string().min(2, { message: "Country is required" }),
  }),
  billingAddress: z.object({
    line1: z.string().min(5, { message: "Address must be at least 5 characters" }),
    line2: z.string().optional(),
    city: z.string().min(2, { message: "City is required" }),
    state: z.string().min(2, { message: "State is required" }),
    postalCode: z.string().min(5, { message: "Postal code is required" }),
    country: z.string().min(2, { message: "Country is required" }),
  }),
  sameAsShipping: z.boolean().default(true),
  notes: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// US States for dropdown
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

// Checkout form component that uses Stripe elements
const CheckoutForm = ({ formData }: { formData: CheckoutFormValues }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { items, cartTotal, clearCart } = useCart();
  const [, navigate] = useLocation();

  // Calculate order totals
  const shippingCost = cartTotal > 200 ? 0 : 15;
  const taxAmount = cartTotal * 0.08; // 8% tax
  const orderTotal = cartTotal + shippingCost + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Prepare cart items for the order
    const cartItems = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name
    }));

    // Prepare addresses in the format expected by the API
    const shippingAddress = {
      name: `${formData.firstName} ${formData.lastName}`,
      ...formData.shippingAddress
    };

    const billingAddress = formData.sameAsShipping
      ? shippingAddress
      : {
          name: `${formData.firstName} ${formData.lastName}`,
          ...formData.billingAddress
        };

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/{ORDERID}`,
          payment_method_data: {
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: billingAddress.line1,
                line2: billingAddress.line2 || '',
                city: billingAddress.city,
                state: billingAddress.state,
                postal_code: billingAddress.postalCode,
                country: billingAddress.country,
              }
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.");
        setIsProcessing(false);
      } else {
        // Payment succeeded, clear cart and redirect to confirmation page
        clearCart();
        
        // This would normally be replaced with the actual order ID
        // For this example, we'll just simulate it
        navigate("/order-confirmation/TMP" + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>
              Enter your payment details securely with Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Stripe Elements */}
            <PaymentElement />
            
            {/* Error message */}
            {errorMessage && (
              <div className="mt-4 text-red-600 text-sm">{errorMessage}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrice(orderTotal)}</span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 h-12"
              disabled={!stripe || !elements || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center">
                  Complete Order <ChevronRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

const Checkout = () => {
  const { items, cartTotal } = useCart();
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState<CheckoutFormValues | null>(null);
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  const [currentStep, setCurrentStep] = useState("customer-info");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      shippingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
      billingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
      sameAsShipping: true,
      notes: "",
      termsAccepted: false,
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // Watch for same as shipping checkbox changes
  const sameAsShipping = form.watch("sameAsShipping");

  // When same as shipping changes, update billing address fields
  useEffect(() => {
    if (sameAsShipping) {
      const shippingAddress = form.getValues("shippingAddress");
      form.setValue("billingAddress", { ...shippingAddress });
    }
  }, [sameAsShipping, form]);

  // Handle form submission to proceed to payment
  const onSubmit = async (data: CheckoutFormValues) => {
    setFormData(data);
    setIsLoadingPaymentIntent(true);

    try {
      // Calculate shipping, tax, and total
      const shippingCost = cartTotal > 200 ? 0 : 15;
      const taxAmount = cartTotal * 0.08; // 8% tax
      const orderTotal = cartTotal + shippingCost + taxAmount;

      // Prepare cart items for the order
      const cartItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name
      }));

      // Prepare addresses in the format expected by the API
      const shippingAddress = {
        name: `${data.firstName} ${data.lastName}`,
        ...data.shippingAddress
      };

      const billingAddress = data.sameAsShipping
        ? shippingAddress
        : {
            name: `${data.firstName} ${data.lastName}`,
            ...data.billingAddress
          };

      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        cartItems,
        email: data.email,
        shippingAddress,
        billingAddress,
      });

      const paymentData = await response.json();
      setClientSecret(paymentData.clientSecret);
      
      // Move to payment step
      setCurrentStep("payment");
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      // Handle error - show message to user
    } finally {
      setIsLoadingPaymentIntent(false);
    }
  };

  // Calculate order totals
  const shippingCost = cartTotal > 200 ? 0 : 15;
  const taxAmount = cartTotal * 0.08; // 8% tax
  const orderTotal = cartTotal + shippingCost + taxAmount;

  return (
    <>
      <Helmet>
        <title>Checkout | Taylor Made Performance UTV Parts</title>
        <meta name="description" content="Complete your purchase securely. Fast shipping and excellent customer service on all UTV performance parts." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-6">
          Checkout
        </h1>
        
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer-info" disabled={currentStep === "payment"}>Customer Information</TabsTrigger>
            <TabsTrigger value="payment" disabled={!formData}>Payment</TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="customer-info">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      {/* Contact Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="your.email@example.com" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="(555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                      
                      {/* Shipping Address */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="shippingAddress.line1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="shippingAddress.line2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address Line 2 (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apt 4B" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="shippingAddress.city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Anytown" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="shippingAddress.state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State / Province</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a state" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {US_STATES.map((state) => (
                                        <SelectItem key={state.value} value={state.value}>
                                          {state.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="shippingAddress.postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postal Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="12345" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="shippingAddress.country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a country" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="US">United States</SelectItem>
                                      <SelectItem value="CA">Canada</SelectItem>
                                      <SelectItem value="MX">Mexico</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Billing Address */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Billing Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="sameAsShipping"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Same as shipping address</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {!sameAsShipping && (
                            <>
                              <FormField
                                control={form.control}
                                name="billingAddress.line1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Address Line 1</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123 Main St" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="billingAddress.line2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Apt 4B" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="billingAddress.city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Anytown" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="billingAddress.state"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>State / Province</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a state" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {US_STATES.map((state) => (
                                            <SelectItem key={state.value} value={state.value}>
                                              {state.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="billingAddress.postalCode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Postal Code</FormLabel>
                                      <FormControl>
                                        <Input placeholder="12345" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="billingAddress.country"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Country</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a country" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="US">United States</SelectItem>
                                          <SelectItem value="CA">Canada</SelectItem>
                                          <SelectItem value="MX">Mexico</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Additional Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order Notes (Optional)</FormLabel>
                                <FormControl>
                                  <textarea
                                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Special delivery instructions or other notes"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I agree to the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 h-12"
                        disabled={isLoadingPaymentIntent}
                      >
                        {isLoadingPaymentIntent ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            Continue to Payment <ChevronRight className="ml-2 h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
                
                <div className="lg:col-span-1">
                  <div className="sticky top-32">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item.product.id} className="flex items-start">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                  <img
                                    src={item.product.images?.[0] || `https://placehold.co/200x200?text=${encodeURIComponent(item.product.name)}`}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="ml-3 flex-grow">
                                  <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                    <span className="text-sm font-medium">{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Order Totals */}
                          <div className="space-y-2 pt-4 border-t">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal</span>
                              <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Shipping</span>
                              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Tax</span>
                              <span>{formatPrice(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total</span>
                              <span className="text-primary">{formatPrice(orderTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <svg className="h-5 w-5 text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Free Shipping</h4>
                          <p className="mt-1 text-xs text-blue-700">On orders over $200. Orders typically ship within 1-2 business days.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="payment">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm formData={formData!} />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-1">
                  <div className="sticky top-32">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item.product.id} className="flex items-start">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                  <img
                                    src={item.product.images?.[0] || `https://placehold.co/200x200?text=${encodeURIComponent(item.product.name)}`}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="ml-3 flex-grow">
                                  <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                    <span className="text-sm font-medium">{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Order Totals */}
                          <div className="space-y-2 pt-4 border-t">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal</span>
                              <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Shipping</span>
                              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Tax</span>
                              <span>{formatPrice(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total</span>
                              <span className="text-primary">{formatPrice(orderTotal)}</span>
                            </div>
                          </div>
                          
                          {/* Shipping Address */}
                          {formData && (
                            <div className="pt-4 border-t">
                              <h4 className="font-medium text-sm mb-2">Shipping Address</h4>
                              <p className="text-sm text-gray-600">
                                {formData.firstName} {formData.lastName}<br />
                                {formData.shippingAddress.line1}<br />
                                {formData.shippingAddress.line2 && <>{formData.shippingAddress.line2}<br /></>}
                                {formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.postalCode}<br />
                                {formData.shippingAddress.country === "US" ? "United States" : formData.shippingAddress.country}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-green-800">Secure Checkout</h4>
                          <p className="mt-1 text-xs text-green-700">All transactions are secure and encrypted. Your personal information is never shared.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default Checkout;
