/**
 * AI-driven sales optimization and customer segmentation
 * 
 * This system is specifically designed to work with free tier hosting limitations:
 * - Memory efficient algorithms
 * - Fallback mechanisms when AI API limits are reached
 * - Response caching to minimize API calls
 * - Optimized for latency with asynchronous processing
 */

import { OpenAI } from 'openai';
import { storage } from '../storage';
import { Product } from '../../shared/schema';

// Initialize OpenAI with fallback handling for API limits
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.error('OpenAI initialization failed, using fallback recommendations:', error);
}

// Memory-efficient caching - limited to prevent memory leaks on free hosting
const recommendationCache: Record<string, { 
  productIds: number[]; 
  timestamp: number;
}> = {};

const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Customer segmentation models with behavior patterns
export type CustomerSegment = 'price_sensitive' | 'feature_focused' | 'brand_loyal' | 'new_visitor' | 'returning_customer';

export interface CustomerData {
  viewedProducts: number[];
  purchaseHistory?: number[];
  cartAbandons?: number[];
  timeOnSite?: number;
  deviceType?: string;
  referrer?: string;
}

export const customerSegments = {
  price_sensitive: {
    name: 'Price Sensitive',
    description: 'Customers who prioritize cost over other factors',
    pricingStrategy: 'Offer discounts and highlight value',
    recommendationStrategy: 'Recommend lower-priced alternatives and value bundles',
  },
  feature_focused: {
    name: 'Feature Focused',
    description: 'Customers who seek specific features and performance',
    pricingStrategy: 'Emphasize performance and unique features, less price sensitivity',
    recommendationStrategy: 'Recommend premium products with advanced features',
  },
  brand_loyal: {
    name: 'Brand Loyal',
    description: 'Customers who repeatedly purchase from the same brands',
    pricingStrategy: 'Brand-focused messaging, less price sensitivity',
    recommendationStrategy: 'Recommend same-brand accessories and upgrades',
  },
  new_visitor: {
    name: 'New Visitor',
    description: 'First-time visitors with no purchase history',
    pricingStrategy: 'Introductory offers to encourage first purchase',
    recommendationStrategy: 'Recommend popular entry-level products with high conversion rates',
  },
  returning_customer: {
    name: 'Returning Customer',
    description: 'Customers who have made previous purchases',
    pricingStrategy: 'Loyalty-based pricing and bundles',
    recommendationStrategy: 'Recommend complementary products to previous purchases',
  }
};

export enum FunnelStep {
  BROWSING = 'browsing',
  PRODUCT_DETAIL = 'product_detail',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT = 'checkout',
  POST_PURCHASE = 'post_purchase'
}

/**
 * Determines the current funnel step for personalized recommendations
 * Memory-efficient version optimized for free tier hosting
 */
export function determineFunnelStep(customerData: CustomerData): FunnelStep | null {
  // No purchase history but viewed products -> Browsing/Detail
  if (!customerData.purchaseHistory && customerData.viewedProducts?.length > 0) {
    return customerData.viewedProducts.length > 3 
      ? FunnelStep.PRODUCT_DETAIL 
      : FunnelStep.BROWSING;
  }

  // Has cart abandons -> Add to Cart
  if (customerData.cartAbandons && customerData.cartAbandons.length > 0) {
    return FunnelStep.ADD_TO_CART;
  }

  // Has purchase history -> Post Purchase
  if (customerData.purchaseHistory && customerData.purchaseHistory.length > 0) {
    return FunnelStep.POST_PURCHASE;
  }

  // Default
  return FunnelStep.BROWSING;
}

/**
 * Determines customer segment based on browsing and purchase history
 * Using rule-based fallback when AI is unavailable
 */
export async function determineCustomerSegment(customerData: CustomerData): Promise<CustomerSegment> {
  // AI-based segmentation with OpenAI
  if (openai) {
    try {
      const prompt = `
        Analyze this customer data and determine their segment:
        - Viewed Products: ${customerData.viewedProducts?.length || 0} products
        - Purchase History: ${customerData.purchaseHistory?.length || 0} purchases
        - Cart Abandons: ${customerData.cartAbandons?.length || 0} abandons
        - Time on Site: ${customerData.timeOnSite || 0} seconds
        - Device: ${customerData.deviceType || 'unknown'}
        - Referrer: ${customerData.referrer || 'direct'}

        Respond with only one of these segments: price_sensitive, feature_focused, brand_loyal, new_visitor, returning_customer.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a customer segmentation expert. Analyze the data and respond with exactly one word that represents the customer segment." },
          { role: "user", content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      const segmentText = response.choices[0].message.content?.trim().toLowerCase();
      
      // Validate that response is one of our segments
      if (segmentText && Object.keys(customerSegments).includes(segmentText)) {
        return segmentText as CustomerSegment;
      }
    } catch (error) {
      console.error('AI segmentation error, using fallback:', error);
      // Fallback to rule-based on error/API limit
    }
  }

  // Rule-based segmentation fallback - critical for free tier hosting
  if (customerData.purchaseHistory && customerData.purchaseHistory.length > 0) {
    return 'returning_customer';
  }
  
  if (customerData.cartAbandons && customerData.cartAbandons.length > 0) {
    return 'price_sensitive';
  }
  
  if (customerData.viewedProducts && customerData.viewedProducts.length > 5) {
    return 'feature_focused';
  }
  
  return 'new_visitor';
}

/**
 * Calculates dynamic pricing based on customer segment, inventory, and demand
 * Uses memory-efficient algorithm optimized for free tier hosting
 */
export function calculateDynamicPrice(
  basePrice: number, 
  segment: CustomerSegment, 
  inventoryLevel: number, 
  demandScore: number
): number {
  // Base price adjustments by segment
  const segmentMultipliers = {
    price_sensitive: 0.95, // 5% discount
    feature_focused: 1.05, // 5% markup
    brand_loyal: 1.0,      // standard pricing
    new_visitor: 0.97,     // 3% discount to encourage first purchase
    returning_customer: 1.02, // 2% loyalty markup
  };

  // Inventory adjustments - lower inventory increases price
  const inventoryFactor = Math.max(0.9, Math.min(1.1, 1 - (inventoryLevel - 50) / 500));
  
  // Demand adjustments - higher demand increases price
  const demandFactor = Math.max(0.95, Math.min(1.15, 1 + (demandScore - 50) / 300));
  
  // Calculate final price with constraints to prevent extremes
  const adjustedPrice = basePrice * segmentMultipliers[segment] * inventoryFactor * demandFactor;
  
  // Never go below 90% or above 115% of base price
  const finalPrice = Math.max(basePrice * 0.9, Math.min(basePrice * 1.15, adjustedPrice));
  
  // Round to nearest $0.99 for psychological pricing
  return Math.floor(finalPrice) + 0.99;
}

/**
 * Gets personalized product recommendations based on customer data and viewed products
 * Includes fallback for when AI API limits are reached
 */
export async function getRecommendedProducts(
  customerData: CustomerData, 
  currentProductId?: number, 
  limit: number = 4
): Promise<number[]> {
  const cacheKey = `${currentProductId}-${customerData.viewedProducts?.join(',')}-${limit}`;
  
  // Check cache first to avoid API calls
  const cached = recommendationCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.productIds;
  }
  
  // Manage cache size for memory efficiency
  if (Object.keys(recommendationCache).length >= MAX_CACHE_SIZE) {
    // Remove oldest cached item
    const oldestKey = Object.keys(recommendationCache).reduce((oldest, key) => {
      return recommendationCache[key].timestamp < recommendationCache[oldest].timestamp ? key : oldest;
    }, Object.keys(recommendationCache)[0]);
    
    delete recommendationCache[oldestKey];
  }
  
  // Try AI-based recommendations if available
  if (openai && currentProductId) {
    try {
      // Get current product data
      const product = await storage.getProductById(currentProductId);
      
      if (product) {
        // Get customer segment
        const segment = await determineCustomerSegment(customerData);
        
        // Generate AI-driven recommendations
        let prompt = `
          As a UTV parts recommendation system, suggest ${limit} products that would pair well with this item:
          - Current Product: ${product.name}
          - Description: ${product.description}
          - Category: ${product.categoryId ? 'Category ' + product.categoryId : 'Uncategorized'}
          - Brand: ${product.brandId ? 'Brand ' + product.brandId : 'Generic'}
          - Price: $${product.price}
          - Customer Segment: ${customerSegments[segment].name}
          
          Context: This customer has viewed ${customerData.viewedProducts?.length || 0} products
          and made ${customerData.purchaseHistory?.length || 0} previous purchases.
          
          Response format: Return ONLY a JSON array of product IDs, with no explanation.
          Example: [12, 45, 23, 67]
        `;
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: "You are a UTV parts recommendation specialist. Respond with only the JSON array of recommended product IDs." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 150,
          temperature: 0.2,
        });
        
        const content = response.choices[0].message.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
              // Cache the results
              recommendationCache[cacheKey] = {
                productIds: parsed.recommendations.slice(0, limit),
                timestamp: Date.now()
              };
              
              return parsed.recommendations.slice(0, limit);
            }
          } catch (parseError) {
            console.error('Failed to parse AI recommendation response:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('AI recommendation error, using fallback:', error);
    }
  }
  
  // Fallback: Rule-based recommendations
  // This is crucial for free tier hosting with API limits
  return getRuleBasedRecommendations(customerData, currentProductId, limit);
}

/**
 * Fallback recommendation system when AI is unavailable or API limits are reached
 * Optimized for low memory usage on free tier hosting
 */
async function getRuleBasedRecommendations(
  customerData: CustomerData, 
  currentProductId?: number, 
  limit: number = 4
): Promise<number[]> {
  const recommendations: number[] = [];
  
  try {
    // Get products for rule-based filtering
    const { products } = await storage.getProducts({ limit: 50 });
    
    if (currentProductId) {
      const currentProduct = await storage.getProductById(currentProductId);
      
      if (currentProduct) {
        // Find products in same category
        const sameCategoryProducts = products.filter(p => 
          p.id !== currentProductId && 
          p.categoryId === currentProduct.categoryId
        );
        
        // Add up to 2 same-category products
        for (let i = 0; i < Math.min(2, sameCategoryProducts.length); i++) {
          recommendations.push(sameCategoryProducts[i].id);
        }
        
        // Add complementary products (different category, similar price range)
        const priceMin = parseFloat(currentProduct.price) * 0.7;
        const priceMax = parseFloat(currentProduct.price) * 1.3;
        
        const complementaryProducts = products.filter(p => 
          p.id !== currentProductId && 
          p.categoryId !== currentProduct.categoryId &&
          parseFloat(p.price) >= priceMin &&
          parseFloat(p.price) <= priceMax &&
          !recommendations.includes(p.id)
        );
        
        // Add up to 2 complementary products
        for (let i = 0; i < Math.min(2, complementaryProducts.length); i++) {
          recommendations.push(complementaryProducts[i].id);
        }
      }
    }
    
    // If we still need more recommendations, add top-rated products
    if (recommendations.length < limit) {
      const topProducts = products
        .filter(p => !recommendations.includes(p.id) && p.id !== currentProductId)
        .sort((a, b) => {
          const aRating = a.reviewCount ? (a.averageRating || 0) : 0;
          const bRating = b.reviewCount ? (b.averageRating || 0) : 0;
          return bRating - aRating;
        })
        .slice(0, limit - recommendations.length);
      
      recommendations.push(...topProducts.map(p => p.id));
    }
    
    // Cache the results
    if (currentProductId) {
      const cacheKey = `${currentProductId}-${customerData.viewedProducts?.join(',')}-${limit}`;
      recommendationCache[cacheKey] = {
        productIds: recommendations.slice(0, limit),
        timestamp: Date.now()
      };
    }
    
    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('Rule-based recommendation error:', error);
    return [];
  }
}

/**
 * Gets upsell offers optimized for checkout conversion
 * Memory-efficient implementation for free tier hosting
 */
export async function getCheckoutUpsells(
  cartProductIds: number[], 
  customerData: CustomerData, 
  limit: number = 2
): Promise<number[]> {
  // Use cached recommendations if available
  const cacheKey = `checkout-${cartProductIds.join(',')}-${limit}`;
  const cached = recommendationCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.productIds;
  }
  
  try {
    // Get cart products
    const cartProducts: Product[] = [];
    for (const id of cartProductIds) {
      const product = await storage.getProductById(id);
      if (product) cartProducts.push(product);
    }
    
    // Calculate average cart price
    const totalPrice = cartProducts.reduce((sum, product) => sum + parseFloat(product.price), 0);
    const averagePrice = totalPrice / cartProducts.length;
    
    // Get upsell candidates - accessories under 30% of cart average
    const { products } = await storage.getProducts({ 
      limit: 20,
      isFeatured: true
    });
    
    const upsellCandidates = products.filter(p => 
      !cartProductIds.includes(p.id) && 
      parseFloat(p.price) < averagePrice * 0.3
    );
    
    // Select upsells based on complementary categories
    const cartCategories = new Set(cartProducts.map(p => p.categoryId).filter(Boolean));
    const complementaryUpsells = upsellCandidates.filter(p => !cartCategories.has(p.categoryId));
    
    // Final upsell selection
    const upsells = complementaryUpsells.length >= limit
      ? complementaryUpsells.slice(0, limit)
      : [...complementaryUpsells, ...upsellCandidates.filter(p => !complementaryUpsells.includes(p))].slice(0, limit);
    
    const result = upsells.map(p => p.id);
    
    // Cache results
    recommendationCache[cacheKey] = {
      productIds: result,
      timestamp: Date.now()
    };
    
    return result;
  } catch (error) {
    console.error('Checkout upsell error:', error);
    return [];
  }
}

/**
 * Gets bundle offers optimized for average order value increases
 * Designed to scale on free tier hosting
 */
export async function getBundleOffers(
  productId: number, 
  customerData: CustomerData
): Promise<{ bundleItems: number[], discountPercent: number }> {
  try {
    // Get main product
    const product = await storage.getProductById(productId);
    if (!product) {
      return { bundleItems: [], discountPercent: 0 };
    }
    
    // Get complementary products
    const recommendations = await getRecommendedProducts(customerData, productId, 3);
    
    // Calculate appropriate bundle discount based on total value
    const bundleItems = [productId, ...recommendations];
    
    // Higher value bundles get bigger discounts, max 15%
    let discountPercent = 5; // Base discount
    
    if (recommendations.length >= 2) {
      discountPercent = 10;
    }
    
    if (recommendations.length >= 3) {
      discountPercent = 15;
    }
    
    return {
      bundleItems,
      discountPercent
    };
  } catch (error) {
    console.error('Bundle offer error:', error);
    return { bundleItems: [productId], discountPercent: 0 };
  }
}