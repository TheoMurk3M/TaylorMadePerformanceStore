import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertProductSchema, 
  insertCategorySchema, 
  insertBrandSchema,
  insertUserSchema,
  insertContactMessageSchema,
  insertSubscriberSchema,
  insertReviewSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertChatConversationSchema,
  insertChatMessageSchema,
} from "@shared/schema";
import Stripe from "stripe";
import crypto from "crypto";
import { WebSocketServer } from "ws";
import OpenAI from "openai";

// Check for Stripe API key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable. Stripe payments will not work.');
}

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable. AI features will not work.');
}

// Initialize Stripe if API key is available
const stripe = process.env.STRIPE_SECRET_KEY ? 
  new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" }) : 
  null;

// Initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY ?
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "default_key" }) :
  null;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server for chatbot
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on('connection', (ws) => {
    // Generate a session ID for this connection
    const sessionId = crypto.randomUUID();
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'message') {
          // Create a conversation if it doesn't exist yet
          let conversationId = data.conversationId;
          
          if (!conversationId) {
            const conversation = await storage.createChatConversation({
              userId: data.userId || null,
              sessionId
            });
            conversationId = conversation.id;
          }
          
          // Store user message
          await storage.createChatMessage({
            conversationId,
            content: data.content,
            isFromUser: true
          });
          
          // Generate AI response
          const aiResponse = await generateAIResponse(data.content, conversationId);
          
          // Store AI response
          await storage.createChatMessage({
            conversationId,
            content: aiResponse,
            isFromUser: false
          });
          
          // Send response back to client
          ws.send(JSON.stringify({
            type: 'message',
            conversationId,
            content: aiResponse,
            isFromUser: false
          }));
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });
    
    // Send initial greeting message
    ws.send(JSON.stringify({
      type: 'message',
      sessionId,
      content: "Hello! I'm your Performance Assistant. How can I help you find the perfect parts for your UTV today?",
      isFromUser: false
    }));
  });
  
  // Helper function to generate AI response using OpenAI
  async function generateAIResponse(userMessage: string, conversationId: number): Promise<string> {
    if (!openai) {
      return "I'm sorry, but our AI assistant is currently unavailable. Please contact customer support for assistance.";
    }
    
    try {
      // Get conversation history
      const messages = await storage.getChatMessagesByConversationId(conversationId);
      
      // Prepare conversation context
      const conversationHistory = messages.map(msg => ({
        role: msg.isFromUser ? "user" : "assistant",
        content: msg.content
      }));
      
      // Create system message with context about the store
      const systemMessage = {
        role: "system",
        content: `You are a helpful assistant for Taylor Made Performance UTV Parts, an e-commerce store specializing in aftermarket parts for side-by-side UTVs such as Polaris, Honda, Yamaha, Can-Am, and Kawasaki. 
                 Your goal is to help customers find the right parts for their specific UTV model, answer questions about products, fitment, and make recommendations. 
                 Be knowledgeable about UTV parts including exhausts, suspension, wheels/tires, engine components, lighting, and protection. 
                 Be concise but thorough in your responses. If you don't know specific product details, encourage the customer to browse the relevant category or contact support.`
      };
      
      // Combine system message with conversation history
      const promptMessages = [
        systemMessage,
        ...conversationHistory.slice(-10), // Include last 10 messages for context
      ];
      
      // Generate response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: promptMessages.map(msg => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content
        })),
        max_tokens: 300
      });
      
      return completion.choices[0].message.content || "I'm not sure how to help with that. Would you like to browse our categories or contact customer support?";
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "I'm experiencing some technical difficulties. Please try again later or contact our customer support team for immediate assistance.";
    }
  }

  // Helper function to generate product recommendations
  async function generateProductRecommendations(productId: number): Promise<number[]> {
    try {
      const product = await storage.getProductById(productId);
      if (!product) return [];
      
      // Get products from the same category
      const { products: categoryProducts } = await storage.getProducts({
        categoryId: product.categoryId,
        limit: 10
      });
      
      // Filter out the current product
      const recommendations = categoryProducts
        .filter(p => p.id !== productId)
        .sort((a, b) => {
          // Sort by rating first
          if (Number(b.rating) !== Number(a.rating)) {
            return Number(b.rating) - Number(a.rating);
          }
          // Then by review count
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, 4)
        .map(p => p.id);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Error handler middleware
  function handleErrors(fn: (req: Request, res: Response) => Promise<void>) {
    return async (req: Request, res: Response) => {
      try {
        await fn(req, res);
      } catch (error) {
        console.error('API error:', error);
        
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ 
            message: 'Validation error', 
            errors: validationError.details 
          });
        }
        
        res.status(500).json({ message: 'Internal server error' });
      }
    };
  }

  // ===== API Routes =====

  // Categories
  app.get("/api/categories", handleErrors(async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  }));

  app.get("/api/categories/:slug", handleErrors(async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  }));

  app.post("/api/categories", handleErrors(async (req, res) => {
    const data = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(data);
    res.status(201).json(category);
  }));

  // Brands
  app.get("/api/brands", handleErrors(async (req, res) => {
    const brands = await storage.getBrands();
    res.json(brands);
  }));

  app.get("/api/brands/:slug", handleErrors(async (req, res) => {
    const brand = await storage.getBrandBySlug(req.params.slug);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  }));

  app.post("/api/brands", handleErrors(async (req, res) => {
    const data = insertBrandSchema.parse(req.body);
    const brand = await storage.createBrand(data);
    res.status(201).json(brand);
  }));

  // Vehicle Models
  app.get("/api/vehicle-makes", handleErrors(async (req, res) => {
    const makes = await storage.getVehicleMakes();
    res.json(makes);
  }));

  app.get("/api/vehicle-models/:make", handleErrors(async (req, res) => {
    const models = await storage.getVehicleModelsByMake(req.params.make);
    res.json(models);
  }));

  app.get("/api/vehicle-years/:make/:model", handleErrors(async (req, res) => {
    const years = await storage.getVehicleYearsByMakeAndModel(
      req.params.make,
      req.params.model
    );
    res.json(years);
  }));

  // Products
  app.get("/api/products", handleErrors(async (req, res) => {
    const { 
      limit = 20, 
      offset = 0, 
      category, 
      brand, 
      featured, 
      search,
      sort,
      order = 'desc'
    } = req.query;
    
    // Get category ID if slug is provided
    let categoryId: number | undefined = undefined;
    if (category) {
      const cat = await storage.getCategoryBySlug(category as string);
      categoryId = cat?.id;
    }
    
    // Get brand ID if slug is provided
    let brandId: number | undefined = undefined;
    if (brand) {
      const br = await storage.getBrandBySlug(brand as string);
      brandId = br?.id;
    }
    
    // Parse featured flag
    let isFeatured: boolean | undefined = undefined;
    if (featured === 'true') {
      isFeatured = true;
    } else if (featured === 'false') {
      isFeatured = false;
    }
    
    const { products, total } = await storage.getProducts({
      limit: Number(limit),
      offset: Number(offset),
      categoryId,
      brandId,
      isFeatured,
      searchTerm: search as string,
      sortBy: sort as string,
      sortOrder: (order as 'asc' | 'desc')
    });
    
    res.json({ 
      products, 
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  }));

  app.get("/api/products/:slug", handleErrors(async (req, res) => {
    const product = await storage.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get related products
    const recommendations = await generateProductRecommendations(product.id);
    const recommendedProducts = await Promise.all(
      recommendations.map(id => storage.getProductById(id))
    );
    
    // Get reviews
    const reviews = await storage.getReviewsByProductId(product.id);
    
    res.json({
      product,
      recommendedProducts: recommendedProducts.filter(p => p !== undefined),
      reviews
    });
  }));

  app.post("/api/products", handleErrors(async (req, res) => {
    const data = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(data);
    res.status(201).json(product);
  }));

  // Reviews
  app.post("/api/reviews", handleErrors(async (req, res) => {
    const data = insertReviewSchema.parse(req.body);
    const review = await storage.createReview(data);
    res.status(201).json(review);
  }));

  // Users & Auth
  app.post("/api/users/register", handleErrors(async (req, res) => {
    const data = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const user = await storage.createUser(data);
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName
    });
  }));

  app.post("/api/users/login", handleErrors(async (req, res) => {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string()
    }).parse(req.body);
    
    const user = await storage.getUserByEmail(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName
    });
  }));

  // Contact Form
  app.post("/api/contact", handleErrors(async (req, res) => {
    const data = insertContactMessageSchema.parse(req.body);
    const message = await storage.createContactMessage(data);
    res.status(201).json({ success: true, messageId: message.id });
  }));

  // Newsletter
  app.post("/api/newsletter/subscribe", handleErrors(async (req, res) => {
    const data = insertSubscriberSchema.parse(req.body);
    const subscriber = await storage.createSubscriber(data);
    res.status(201).json({ success: true, subscriberId: subscriber.id });
  }));

  // Articles/Blog
  app.get("/api/articles", handleErrors(async (req, res) => {
    const { 
      limit = 10, 
      offset = 0
    } = req.query;
    
    const { articles, total } = await storage.getArticles({
      limit: Number(limit),
      offset: Number(offset),
      isPublished: true
    });
    
    res.json({ 
      articles, 
      total,
      limit: Number(limit),
      offset: Number(offset)
    });
  }));

  app.get("/api/articles/:slug", handleErrors(async (req, res) => {
    const article = await storage.getArticleBySlug(req.params.slug);
    if (!article || !article.isPublished) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json(article);
  }));

  // Cart & Checkout
  app.post("/api/cart/validate", handleErrors(async (req, res) => {
    const cartSchema = z.array(z.object({
      productId: z.number(),
      quantity: z.number().positive()
    }));
    
    const cartItems = cartSchema.parse(req.body);
    const validationResults = await Promise.all(
      cartItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        if (!product) {
          return {
            productId: item.productId,
            valid: false,
            message: 'Product not found'
          };
        }
        
        if (!product.isActive) {
          return {
            productId: item.productId,
            valid: false,
            message: 'Product is no longer available'
          };
        }
        
        if (item.quantity > product.inventoryCount) {
          return {
            productId: item.productId,
            valid: false,
            message: `Only ${product.inventoryCount} available`,
            availableQuantity: product.inventoryCount
          };
        }
        
        return {
          productId: item.productId,
          valid: true,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            inventoryCount: product.inventoryCount
          }
        };
      })
    );
    
    const allValid = validationResults.every(result => result.valid);
    
    res.json({
      valid: allValid,
      items: validationResults
    });
  }));

  // Stripe Payment
  app.post("/api/create-payment-intent", handleErrors(async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment service unavailable' });
    }
    
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
    
    try {
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
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: order.id.toString(),
          orderNumber: order.orderNumber
        },
        receipt_email: email,
        description: `Order #${order.orderNumber}`
      });
      
      // Update order with payment intent ID
      await storage.updatePaymentStatus(order.id, 'pending', paymentIntent.id);
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        orderNumber: order.orderNumber
      });
    } catch (error) {
      console.error('Stripe payment error:', error);
      res.status(500).json({ message: 'Failed to process payment' });
    }
  }));

  app.post("/api/orders/:orderId/confirm", handleErrors(async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    const updatedOrder = await storage.updateOrderStatus(orderId, 'confirmed');
    await storage.updatePaymentStatus(orderId, 'paid');
    
    res.json({
      success: true,
      order: updatedOrder
    });
  }));

  app.get("/api/orders/:orderNumber", handleErrors(async (req, res) => {
    const order = await storage.getOrderByNumber(req.params.orderNumber);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get order items
    const items = await storage.getOrderItemsByOrderId(order.id);
    
    // Get products for each item
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return { ...item, product };
      })
    );
    
    res.json({
      order,
      items: products
    });
  }));

  // Stripe Webhook Handler - Critical for payment confirmations
  app.post("/api/stripe-webhook", handleErrors(async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment service unavailable' });
    }
    
    // Get the raw body and signature header
    const payload = req.body;
    const sig = req.headers['stripe-signature'] as string;
    
    let event;
    
    try {
      // Verify webhook signature using Stripe's webhook secret
      // For production, set process.env.STRIPE_WEBHOOK_SECRET in your environment
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      } else {
        // Fallback for development (NOT SECURE for production!)
        event = payload;
        console.warn('STRIPE_WEBHOOK_SECRET not set. Skipping signature verification - NOT SECURE FOR PRODUCTION!');
      }
      
      // Handle various payment events
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          
          // Update order status using the orderId from metadata
          const { orderId, orderNumber } = paymentIntent.metadata;
          if (orderId) {
            await storage.updateOrderStatus(parseInt(orderId), 'processing');
            await storage.updatePaymentStatus(parseInt(orderId), 'paid', paymentIntent.id);
            
            console.log(`Payment for order ${orderNumber} (ID: ${orderId}) completed successfully`);
          }
          break;
          
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          
          // Update order status to failed
          const failedOrderId = failedPaymentIntent.metadata.orderId;
          if (failedOrderId) {
            await storage.updatePaymentStatus(parseInt(failedOrderId), 'failed', failedPaymentIntent.id);
            console.log(`Payment for order ${failedOrderId} failed`);
          }
          break;
          
        case 'charge.refunded':
          const refund = event.data.object;
          const refundedOrderId = refund.metadata?.orderId;
          
          if (refundedOrderId) {
            await storage.updateOrderStatus(parseInt(refundedOrderId), 'refunded');
            await storage.updatePaymentStatus(parseInt(refundedOrderId), 'refunded');
            console.log(`Refund processed for order ${refundedOrderId}`);
          }
          break;
          
        // Handle other webhook events as needed
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      // Return a 200 success response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: 'Webhook error', error: error.message });
    }
  }));

  // Return the server instance
  return httpServer;
}
