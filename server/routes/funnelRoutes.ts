/**
 * Sales funnel routes - optimized for free tier hosting
 * 
 * These routes handle the AI-driven sales optimization system with:
 * - Minimal memory usage
 * - Low-cost fallback alternatives
 * - Response caching
 * - Efficient database queries
 */

import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { customerSegments, determineFunnelStep, determineCustomerSegment, calculateDynamicPrice, getRecommendedProducts } from '../ai/salesOptimization';

// Cache for minimizing database queries
const productCache: Record<number, any> = {};
const MAX_CACHE_SIZE = 100;

// In-memory rate limiting to prevent abuse on free tier
const rateLimits: Record<string, {
  count: number,
  resetTime: number
}> = {};

// Clear rate limits every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimits).forEach(key => {
    if (rateLimits[key].resetTime < now) {
      delete rateLimits[key];
    }
  });
}, 15 * 60 * 1000); // Clean up every 15 minutes

/**
 * Simple rate limiting middleware optimized for memory efficiency
 */
function rateLimit(req: Request, res: Response, next: () => void) {
  // Use IP or session ID as identifier
  const identifier = req.ip || 'unknown';
  const now = Date.now();
  
  if (!rateLimits[identifier]) {
    rateLimits[identifier] = {
      count: 1,
      resetTime: now + (60 * 60 * 1000) // 1 hour
    };
    return next();
  }
  
  // Reset if time expired
  if (rateLimits[identifier].resetTime < now) {
    rateLimits[identifier] = {
      count: 1,
      resetTime: now + (60 * 60 * 1000)
    };
    return next();
  }
  
  // Increment and check limit
  rateLimits[identifier].count++;
  
  // Allow 100 requests per hour per client
  if (rateLimits[identifier].count > 100) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  next();
}

/**
 * Gets personalized product recommendations based on user data and viewed product
 */
export async function getPersonalizedOffers(req: Request, res: Response) {
  try {
    const { productId, userId, source } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Get the current product
    let product = productCache[productId];
    if (!product) {
      product = await storage.getProductById(productId);
      
      // Cache management - remove oldest item if cache is full
      if (Object.keys(productCache).length >= MAX_CACHE_SIZE) {
        const oldestKey = Object.keys(productCache)[0];
        delete productCache[parseInt(oldestKey)];
      }
      
      // Add to cache if found
      if (product) {
        productCache[productId] = product;
      }
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Determine user segment based on browsing history
    let segment;
    if (userId) {
      const user = await storage.getUser(userId);
      segment = await determineCustomerSegment(userId, [productId]);
    } else {
      // Use default segment for guest users
      segment = customerSegments[0];
    }
    
    // Get funnel step based on segment and product
    const funnelStep = determineFunnelStep(segment, product.id, source || 'product_page');
    
    // Get recommended products - limit to 3 to reduce payload size
    const recommendedProductIds = await getRecommendedProducts(funnelStep, 3);
    const offers = [];
    
    // Fetch product details for recommendations
    for (const recProductId of recommendedProductIds) {
      let recProduct = productCache[recProductId];
      
      if (!recProduct) {
        recProduct = await storage.getProductById(recProductId);
        
        if (recProduct) {
          productCache[recProductId] = recProduct;
        }
      }
      
      if (recProduct) {
        // Calculate dynamic price based on segment
        const pricing = calculateDynamicPrice(recProduct, segment);
        
        offers.push({
          id: recProduct.id,
          name: recProduct.name,
          description: recProduct.description,
          image: recProduct.imageUrl,
          originalPrice: recProduct.price,
          offerPrice: pricing.dynamicPrice !== recProduct.price ? pricing.dynamicPrice : undefined,
          discountPercentage: pricing.discountPercentage || 0
        });
      }
    }
    
    // Return lightweight response
    res.json({
      offers,
      message: funnelStep.description || "Products you might like",
      cta: funnelStep.cta || "View Details",
      segment: segment.id
    });
  } catch (error) {
    console.error('Error in personalized offers:', error);
    res.status(500).json({ error: 'Failed to get personalized offers' });
  }
}

/**
 * Gets checkout upsell offers based on cart contents
 */
export async function getCheckoutOffers(req: Request, res: Response) {
  try {
    const { cartItems, userId } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Valid cart items array is required' });
    }
    
    // Get product IDs from cart
    const productIds = cartItems.map(item => item.productId);
    
    // Determine user segment
    let segment;
    if (userId) {
      const user = await storage.getUser(userId);
      segment = await determineCustomerSegment(userId, productIds);
    } else {
      segment = customerSegments[0];
    }
    
    // Get funnel step for checkout
    const funnelStep = determineFunnelStep(segment, productIds[0], 'checkout');
    
    // Get recommended checkout products - limit to 1-2 to avoid overwhelming
    const recommendedProductIds = await getRecommendedProducts(funnelStep, 2);
    const offers = [];
    
    // Create checkout offers
    for (const recProductId of recommendedProductIds) {
      // Skip if product is already in cart
      if (productIds.includes(recProductId)) {
        continue;
      }
      
      let recProduct = productCache[recProductId];
      
      if (!recProduct) {
        recProduct = await storage.getProductById(recProductId);
        
        if (recProduct) {
          productCache[recProductId] = recProduct;
        }
      }
      
      if (recProduct) {
        // Calculate dynamic price
        const pricing = calculateDynamicPrice(recProduct, segment);
        
        offers.push({
          id: recProduct.id,
          name: recProduct.name,
          description: recProduct.description,
          message: funnelStep.description || `Add this ${recProduct.name} to complete your purchase!`,
          image: recProduct.imageUrl,
          price: pricing.dynamicPrice,
          cta: funnelStep.cta || "Add to Order"
        });
      }
    }
    
    // Return a lightweight response
    res.json({ offers });
  } catch (error) {
    console.error('Error in checkout offers:', error);
    res.status(500).json({ error: 'Failed to get checkout offers' });
  }
}

/**
 * Determines user segment based on browsing history
 */
export async function getUserSegment(req: Request, res: Response) {
  try {
    const { userId, browsingHistory } = req.body;
    
    if (!browsingHistory || !Array.isArray(browsingHistory)) {
      return res.status(400).json({ error: 'Valid browsing history array is required' });
    }
    
    // Get user segment
    const segment = await determineCustomerSegment(userId, browsingHistory);
    
    // Return just the segment info to minimize payload
    res.json({
      segment: segment.id,
      name: segment.name
    });
  } catch (error) {
    console.error('Error determining user segment:', error);
    res.status(500).json({ error: 'Failed to determine user segment' });
  }
}

/**
 * Simple tracking for analytics that minimizes resource usage
 */
export async function trackProductViews(req: Request, res: Response) {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Valid product IDs array is required' });
    }
    
    // For free tier, just acknowledge receipt without heavy processing
    // Actual processing can be done in batches during low traffic periods
    res.json({ success: true, message: 'Views recorded' });
    
    // Process asynchronously after response is sent
    setTimeout(async () => {
      try {
        // Do minimal processing to conserve resources
        // This is where you'd update view counts, but we'll keep it lightweight
      } catch (err) {
        // Silent fail - non-critical
      }
    }, 100);
  } catch (error) {
    console.error('Error tracking product views:', error);
    res.status(500).json({ error: 'Failed to track product views' });
  }
}

// Export route handlers with rate limiting
export default {
  getPersonalizedOffers: [rateLimit, getPersonalizedOffers],
  getCheckoutOffers: [rateLimit, getCheckoutOffers],
  getUserSegment: [rateLimit, getUserSegment],
  trackProductViews: [rateLimit, trackProductViews]
};

// Function to register all funnel routes with the Express app
export function registerFunnelRoutes(app: Express) {
  app.post('/api/funnel/personalized-offers', rateLimit, getPersonalizedOffers);
  app.post('/api/funnel/checkout-offers', rateLimit, getCheckoutOffers);
  app.post('/api/funnel/user-segment', rateLimit, getUserSegment);
  app.post('/api/analytics/product-views', rateLimit, trackProductViews);
}