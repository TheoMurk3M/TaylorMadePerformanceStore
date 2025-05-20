import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

// Setup automatic payouts (configured to Wells Fargo debit card)
export async function setupAutomaticPayouts() {
  if (!stripe) {
    console.error('Stripe not initialized - cannot setup automatic payouts');
    return;
  }

  try {
    // Configure account to use automatic payouts
    await stripe.accounts.update('acct_current', {
      settings: {
        payouts: {
          schedule: {
            interval: 'daily', // Can be daily, weekly, or monthly
            delay_days: 2 // Minimum days Stripe requires to process
          }
        }
      }
    });
    
    console.log('Automatic payouts configured successfully');
  } catch (error) {
    console.error('Error setting up automatic payouts:', error);
  }
}

// Create a payment intent for a new order
export async function createPaymentIntent(orderData: {
  items: Array<{ 
    productId: number; 
    quantity: number; 
    price: string; 
    name: string 
  }>;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderId: number;
  orderNumber: string;
  email: string;
  total: number;
}) {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  // Create a payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(orderData.total * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      orderId: orderData.orderId.toString(),
      orderNumber: orderData.orderNumber
    },
    receipt_email: orderData.email,
    description: `Order #${orderData.orderNumber}`,
    automatic_payment_methods: {
      enabled: true
    }
  });

  return paymentIntent;
}

// Process a successful payment
export async function processSuccessfulPayment(paymentIntent: any) {
  // Extract order information from metadata
  const { orderId, orderNumber } = paymentIntent.metadata;
  
  // Return data needed to update order status
  return {
    orderId: parseInt(orderId),
    orderNumber,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100, // Convert from cents to dollars
    paymentMethod: paymentIntent.payment_method,
    status: 'paid'
  };
}

// Process a failed payment
export async function processFailedPayment(paymentIntent: any) {
  // Extract order information from metadata
  const { orderId, orderNumber } = paymentIntent.metadata;
  
  // Return data needed to update order status
  return {
    orderId: parseInt(orderId),
    orderNumber,
    paymentIntentId: paymentIntent.id,
    status: 'failed',
    failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
  };
}

// Create a refund
export async function createRefund(paymentIntentId: string, amount?: number) {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };
  
  // If partial refund, specify amount
  if (amount) {
    refundParams.amount = Math.round(amount * 100); // Convert to cents
  }

  const refund = await stripe.refunds.create(refundParams);
  return refund;
}

// Process webhook events
export function processWebhookEvent(
  payload: any, 
  signature: string, 
  endpointSecret?: string
) {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  let event;
  
  if (endpointSecret) {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } else {
    // In development, we might not have the webhook secret
    event = payload;
  }
  
  return event;
}

// Validate webhook signature
export function validateWebhookSignature(
  payload: any, 
  signature: string, 
  endpointSecret: string
) {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  try {
    stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    return true;
  } catch (error) {
    return false;
  }
}

export default stripe;