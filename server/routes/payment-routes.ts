import type { Express } from "express";
import { z } from "zod";
import stripe from '../stripe-config';
import { configureAutomaticPayouts } from '../stripe-config';
import { 
  createCheckoutPaymentIntent, 
  processSuccessfulPayment, 
  createRefund, 
  parseWebhookEvent,
  handlePaymentWebhookEvent
} from '../payment-processing';
import { storage } from '../storage';

// Register payment-related routes
export function registerPaymentRoutes(app: Express) {
  // Create payment intent for checkout
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { cartItems, shippingAddress, billingAddress, email } = z.object({
        cartItems: z.array(z.object({
          productId: z.number(),
          quantity: z.number().positive(),
          price: z.string(),
          name: z.string()
        })),
        shippingAddress: z.object({
          name: z.string(),
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string()
        }),
        billingAddress: z.object({
          name: z.string(),
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string()
        }),
        email: z.string().email()
      }).parse(req.body);

      // Calculate order total
      const subtotal = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0);
      
      // Add tax (e.g., 8%)
      const taxRate = 0.08;
      const tax = subtotal * taxRate;
      
      // Calculate shipping (simplified example)
      const shippingCost = subtotal > 200 ? 0 : 15;
      
      // Total
      const total = subtotal + tax + shippingCost;

      // Create a new order
      const order = await storage.createOrder({
        userId: null, // Guest checkout
        shippingAddress,
        billingAddress,
        shippingMethod: shippingCost === 0 ? 'Free Shipping' : 'Standard Shipping',
        shippingCost: shippingCost.toString(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        paymentMethod: 'Stripe',
        note: ''
      });
      
      // Add order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: (parseFloat(item.price) * item.quantity).toString()
        });
        
        // Update inventory
        await storage.updateProductInventory(item.productId, item.quantity);
      }

      // Create payment intent using our payment processing module
      const paymentData = await createCheckoutPaymentIntent({
        items: cartItems,
        shippingAddress,
        billingAddress,
        email,
        orderId: order.id,
        orderNumber: order.orderNumber,
        subtotal,
        tax,
        shipping: shippingCost,
        total
      });

      res.json({
        clientSecret: paymentData.clientSecret,
        orderId: order.id,
        orderNumber: order.orderNumber
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ message: 'Failed to process payment' });
    }
  });

  // Handle Stripe webhook events
  app.post("/api/stripe-webhook", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment service unavailable' });
    }
    
    try {
      // Get the raw body and signature header
      const payload = req.body;
      const sig = req.headers['stripe-signature'] as string;
      
      // Process and verify the webhook event
      const event = parseWebhookEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
      
      // Handle the event based on type
      const result = await handlePaymentWebhookEvent(event);
      
      res.json({ received: true, result });
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({ message: 'Webhook error' });
    }
  });

  // Create refund for an order
  app.post("/api/refunds", async (req, res) => {
    try {
      const { orderNumber, amount, reason } = z.object({
        orderNumber: z.string(),
        amount: z.number().optional(),
        reason: z.string().optional()
      }).parse(req.body);
      
      // Find the order
      const order = await storage.getOrderByNumber(orderNumber);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if order has payment intent
      if (!order.stripePaymentIntentId) {
        return res.status(400).json({ message: 'No payment information found for this order' });
      }
      
      // Process refund
      const refund = await createRefund(order.stripePaymentIntentId, amount);
      
      res.json(refund);
    } catch (error) {
      console.error('Refund error:', error);
      res.status(500).json({ message: 'Failed to process refund' });
    }
  });

  // Setup automatic payouts to Wells Fargo card
  app.post("/api/setup-automatic-payouts", async (req, res) => {
    try {
      // Configure automatic payouts to your Wells Fargo account
      const success = await configureAutomaticPayouts();
      
      if (success) {
        res.json({ 
          success: true, 
          message: 'Automatic payouts have been configured to your Wells Fargo account (ending in 1593)'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to configure automatic payouts' 
        });
      }
    } catch (error) {
      console.error('Error setting up automatic payouts:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to configure automatic payouts' 
      });
    }
  });
}