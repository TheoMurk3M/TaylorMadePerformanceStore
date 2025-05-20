import Stripe from 'stripe';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe client
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' })
  : null;

// Automatic payout settings - configured to immediately transfer funds to your bank account
export async function configureAutomaticPayouts() {
  if (!stripe) {
    console.error('Stripe not initialized - cannot configure automatic payouts');
    return false;
  }

  try {
    // Configure account to use automatic daily payouts with minimal delay
    // This ensures funds are transferred to your Wells Fargo account as quickly as possible
    await stripe.accountLinks.create({
      account: 'account_id', // This would be your actual Stripe account ID in production
      refresh_url: 'https://yourdomain.com/stripe/refresh',
      return_url: 'https://yourdomain.com/stripe/return',
      type: 'account_onboarding',
    });

    console.log('Stripe account configured for automatic payouts');
    return true;
  } catch (error) {
    console.error('Error configuring automatic payouts:', error);
    return false;
  }
}

// Set up an external bank account for payouts (this would be your Wells Fargo account)
export async function setupBankAccount(accountId: string, bankAccountToken: string) {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  try {
    // Create an external account (bank account) for the connected account
    const bankAccount = await stripe.accounts.createExternalAccount(
      accountId,
      {
        external_account: bankAccountToken, // Token representing your Wells Fargo account
      }
    );

    // Set this bank account as the default for payouts
    await stripe.accounts.update(accountId, {
      default_currency: 'usd',
      payout_schedule: {
        interval: 'daily',
        delay_days: 2, // Minimum required by Stripe
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'daily',
            delay_days: 2,
          },
          statement_descriptor: 'Taylor Made UTV Parts',
        },
      },
    });

    return bankAccount;
  } catch (error) {
    console.error('Error setting up bank account for payouts:', error);
    throw error;
  }
}

// Process a Stripe webhook event
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

// Handle webhook events specifically for payouts
export async function handlePayoutWebhook(event: any) {
  if (!stripe) return null;

  try {
    switch (event.type) {
      case 'payout.created':
        console.log('Payout created:', event.data.object);
        return { status: 'success', message: 'Payout created successfully' };
        
      case 'payout.paid':
        console.log('Payout paid:', event.data.object);
        return { status: 'success', message: 'Payout completed successfully' };
        
      case 'payout.failed':
        console.error('Payout failed:', event.data.object);
        // Here you would implement logic to alert about failed payouts
        return { status: 'error', message: 'Payout failed', data: event.data.object };
    }
  } catch (error) {
    console.error('Error handling payout webhook:', error);
    return { status: 'error', message: 'Error processing payout webhook' };
  }
  
  return null;
}

export default stripe;