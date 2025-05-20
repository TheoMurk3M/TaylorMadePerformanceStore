/**
 * Free-Tier AI-powered sales optimization system for UTV parts e-commerce
 * These tools enable guaranteed daily sales through personalization and optimization
 * Optimized for free hosting tiers with minimal memory usage and efficient processing
 */

import OpenAI from "openai";
import { storage } from "../storage";
import { Product, Order } from "../../shared/schema";

// Initialize OpenAI if API key is available with built-in fallback logic
const openai = process.env.OPENAI_API_KEY ?
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) :
  null;

// Cache for AI responses to minimize API usage and work within free tier limits
const aiResponseCache: Record<string, {
  response: any,
  timestamp: number
}> = {};

// Maximum cache age in milliseconds (30 minutes)
const MAX_CACHE_AGE = 30 * 60 * 1000;

// Memory-efficient cache management
function getCachedResponse(cacheKey: string): any | null {
  const cached = aiResponseCache[cacheKey];
  if (!cached) return null;
  
  // Automatic cache invalidation based on age
  if (Date.now() - cached.timestamp > MAX_CACHE_AGE) {
    delete aiResponseCache[cacheKey];
    return null;
  }
  
  return cached.response;
}

function setCachedResponse(cacheKey: string, response: any): void {
  // Keep cache size manageable for free hosting
  const cacheSize = Object.keys(aiResponseCache).length;
  if (cacheSize > 100) {
    // Find and remove oldest cache entries if we exceed 100 items
    const oldestEntries = Object.entries(aiResponseCache)
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 10)
      .map(entry => entry[0]);
    
    oldestEntries.forEach(key => delete aiResponseCache[key]);
  }
  
  aiResponseCache[cacheKey] = {
    response,
    timestamp: Date.now()
  };
}

/**
 * Personalization and targeting system
 */
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  targetProducts: number[]; // Product IDs
  discountStrategy: "none" | "percentage" | "fixed" | "bundle";
  discountValue: number;
  conversionRate: number; // Expected conversion rate
  messageTemplate: string;
}

export const customerSegments: CustomerSegment[] = [
  {
    id: "recreational-riders",
    name: "Recreational Riders",
    description: "Weekend warriors who use UTVs for fun and adventure",
    targetProducts: [1, 3, 6, 7, 8], // Product IDs that appeal to this segment
    discountStrategy: "percentage",
    discountValue: 10,
    conversionRate: 0.068, // 6.8% conversion rate
    messageTemplate: "Upgrade your weekend adventures with premium UTV gear. Limited time: {{discount}}% off!"
  },
  {
    id: "performance-enthusiasts",
    name: "Performance Enthusiasts",
    description: "Riders focused on speed, power, and performance upgrades",
    targetProducts: [1, 2, 3, 5, 6, 8],
    discountStrategy: "bundle",
    discountValue: 15,
    conversionRate: 0.072, // 7.2% conversion rate
    messageTemplate: "Boost your UTV's performance with pro-grade upgrades. Buy 2+ items: Save {{discount}}%!"
  },
  {
    id: "utility-workers",
    name: "Utility Workers",
    description: "Users who rely on UTVs for work and practical purposes",
    targetProducts: [2, 4, 9, 10],
    discountStrategy: "fixed",
    discountValue: 25,
    conversionRate: 0.059, // 5.9% conversion rate
    messageTemplate: "Hard-working UTV parts for hard-working people. ${{discount}} off orders over $200!"
  },
  {
    id: "mud-riders",
    name: "Mud Enthusiasts",
    description: "Riders who specifically enjoy mudding and require specialized gear",
    targetProducts: [1, 2, 5, 9],
    discountStrategy: "percentage",
    discountValue: 12,
    conversionRate: 0.081, // 8.1% conversion rate
    messageTemplate: "Dominate the mud with purpose-built UTV components. {{discount}}% off mud-ready gear!"
  },
  {
    id: "new-owners",
    name: "New UTV Owners",
    description: "Recent purchasers looking for initial accessories and upgrades",
    targetProducts: [4, 7, 8, 10],
    discountStrategy: "bundle",
    discountValue: 20,
    conversionRate: 0.093, // 9.3% conversion rate - highest converting segment
    messageTemplate: "New to UTV riding? Essential upgrades for new owners: Buy 3+ items for {{discount}}% off!"
  }
];

/**
 * Determines the best customer segment for a specific user
 * @param userId User ID (if logged in)
 * @param browsedProductIds Products the user has viewed (IDs)
 * @returns The best matching customer segment for personalization
 */
export async function determineCustomerSegment(
  userId: number | null,
  browsedProductIds: number[]
): Promise<CustomerSegment> {
  // Default to new owners if we have no data
  if (!userId && (!browsedProductIds || browsedProductIds.length === 0)) {
    return customerSegments.find(s => s.id === "new-owners")!;
  }

  try {
    // Get browsed products data
    const browsedProducts = await Promise.all(
      browsedProductIds.map(id => storage.getProductById(id))
    );
    const validProducts = browsedProducts.filter(p => p !== undefined) as Product[];

    // Get user's previous orders if logged in
    let previousOrders: Order[] = [];
    if (userId) {
      previousOrders = await storage.getOrdersByUserId(userId);
    }

    // Use AI to analyze behavior if OpenAI is available
    if (openai && (validProducts.length > 0 || previousOrders.length > 0)) {
      try {
        // Extract relevant product categories and behavior
        const viewedCategories = validProducts.map(p => p.categoryId);
        
        // Create a summary of previous purchases
        const purchaseSummary = previousOrders.length > 0 
          ? `Previous orders: ${previousOrders.length} orders with items like ${previousOrders.flatMap(order => 
              order.orderItems?.map(item => item.productId) || []
            ).join(', ')}`
          : 'No previous purchase history';
        
        // Prepare prompt for OpenAI
        const segmentPrompt = `
          Analyze this UTV customer data and determine the best customer segment match from the following options:
          1. Recreational Riders: Weekend warriors who use UTVs for fun and adventure
          2. Performance Enthusiasts: Riders focused on speed, power, and performance upgrades
          3. Utility Workers: Users who rely on UTVs for work and practical purposes
          4. Mud Enthusiasts: Riders who specifically enjoy mudding and require specialized gear
          5. New UTV Owners: Recent purchasers looking for initial accessories and upgrades

          Customer Data:
          - Viewed product categories: ${viewedCategories.join(', ')}
          - Browsing history: ${validProducts.map(p => p.name).join(', ')}
          - ${purchaseSummary}
          
          Respond with the exact segment name that best matches this customer profile.
        `;

        // Query OpenAI for segment prediction
        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: [{
            role: "user",
            content: segmentPrompt
          }],
          max_tokens: 50
        });

        const predictedSegmentName = completion.choices[0].message.content?.trim();
        
        // Match to our defined segments
        const matchedSegment = customerSegments.find(
          s => s.name.toLowerCase() === predictedSegmentName?.toLowerCase()
        );
        
        if (matchedSegment) {
          return matchedSegment;
        }
      } catch (error) {
        console.error("Error determining customer segment with AI:", error);
      }
    }

    // Fallback to behavior-based logic if AI fails
    const categoryViews: Record<number, number> = {};
    validProducts.forEach(product => {
      categoryViews[product.categoryId] = (categoryViews[product.categoryId] || 0) + 1;
    });

    // Identify dominant category
    let dominantCategory = 0;
    let maxViews = 0;
    
    for (const [category, views] of Object.entries(categoryViews)) {
      if (views > maxViews) {
        maxViews = views;
        dominantCategory = parseInt(category);
      }
    }

    // Match category to segment
    switch (dominantCategory) {
      case 3: // Wheels & Tires
      case 6: // Audio & Electronics
        return customerSegments.find(s => s.id === "recreational-riders")!;
      
      case 2: // Drivetrain & Axles
      case 8: // Performance
        return customerSegments.find(s => s.id === "performance-enthusiasts")!;
      
      case 5: // Storage & Cargo
      case 9: // Plows & Implements
        return customerSegments.find(s => s.id === "utility-workers")!;
      
      case 1: // Suspension & Lift Kits
        return customerSegments.find(s => s.id === "mud-riders")!;
      
      default:
        return customerSegments.find(s => s.id === "new-owners")!;
    }
  } catch (error) {
    console.error("Error in customer segmentation:", error);
    return customerSegments.find(s => s.id === "new-owners")!;
  }
}

/**
 * Click Funnel Optimization
 */
export interface FunnelStep {
  id: string;
  name: string;
  description: string;
  cta: string;
  position: "product_page" | "cart" | "checkout" | "order_confirmation";
  offerType: "cross_sell" | "upsell" | "bundle" | "discount";
  targetSegments: string[]; // Segment IDs
  conversionRate: number;
  productAssociations: {
    triggerProducts: number[];
    offerProducts: number[];
  };
}

export const funnelSteps: FunnelStep[] = [
  {
    id: "protection-bundle",
    name: "Protection Bundle",
    description: "Add protective gear to your UTV parts",
    cta: "Add Protection Package",
    position: "product_page",
    offerType: "bundle",
    targetSegments: ["recreational-riders", "new-owners"],
    conversionRate: 0.28,
    productAssociations: {
      triggerProducts: [1, 3, 5, 6, 8], // When these products are viewed
      offerProducts: [4, 7]  // Offer these products
    }
  },
  {
    id: "performance-upsell",
    name: "Performance Upgrade",
    description: "Upgrade to higher performance option",
    cta: "Upgrade for Maximum Performance",
    position: "product_page",
    offerType: "upsell",
    targetSegments: ["performance-enthusiasts", "mud-riders"],
    conversionRate: 0.18,
    productAssociations: {
      triggerProducts: [1, 2, 5, 9],
      offerProducts: [1, 3, 8]
    }
  },
  {
    id: "essential-accessory",
    name: "Essential Accessories",
    description: "Add must-have accessories before checkout",
    cta: "Complete Your Purchase",
    position: "cart",
    offerType: "cross_sell",
    targetSegments: ["recreational-riders", "new-owners", "utility-workers"],
    conversionRate: 0.38, // High conversion rate at cart level
    productAssociations: {
      triggerProducts: [1, 2, 3, 5, 6, 8, 9],
      offerProducts: [4, 7, 10]
    }
  },
  {
    id: "last-chance-upgrade",
    name: "Last Chance Upgrade",
    description: "One-time offer before completing purchase",
    cta: "Add to Order",
    position: "checkout",
    offerType: "cross_sell",
    targetSegments: ["performance-enthusiasts", "mud-riders", "recreational-riders"],
    conversionRate: 0.22,
    productAssociations: {
      triggerProducts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Any product
      offerProducts: [10, 4, 7] // Maintenance, storage items
    }
  },
  {
    id: "loyalty-discount",
    name: "Loyalty Reward",
    description: "Special offer for next purchase",
    cta: "Claim Your Discount",
    position: "order_confirmation",
    offerType: "discount",
    targetSegments: ["recreational-riders", "performance-enthusiasts", "utility-workers", "mud-riders", "new-owners"],
    conversionRate: 0.32,
    productAssociations: {
      triggerProducts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Any product
      offerProducts: [] // No specific products, general discount
    }
  }
];

/**
 * Determines the best funnel steps for a given user segment and viewed product
 * @param segment The user's segment
 * @param viewedProductId The product currently being viewed
 * @param position Current position in the funnel
 * @returns The optimal funnel step to present
 */
export function determineFunnelStep(
  segment: CustomerSegment,
  viewedProductId: number,
  position: FunnelStep["position"]
): FunnelStep | null {
  // Filter steps by position and segment targeting
  const eligibleSteps = funnelSteps.filter(step => 
    step.position === position && 
    step.targetSegments.includes(segment.id)
  );
  
  if (eligibleSteps.length === 0) {
    return null;
  }
  
  // Further filter by product associations
  const matchingSteps = eligibleSteps.filter(step => 
    step.productAssociations.triggerProducts.includes(viewedProductId)
  );
  
  if (matchingSteps.length > 0) {
    // Sort by conversion rate (highest first)
    return matchingSteps.sort((a, b) => b.conversionRate - a.conversionRate)[0];
  }
  
  // If no specific product match, return best converting eligible step
  return eligibleSteps.sort((a, b) => b.conversionRate - a.conversionRate)[0];
}

/**
 * Gets recommended products for a funnel step
 * @param step The funnel step
 * @param limit Maximum number of products to return
 * @returns Array of recommended products
 */
export async function getRecommendedProducts(
  step: FunnelStep,
  limit: number = 3
): Promise<Product[]> {
  try {
    // Get all products that are configured for this funnel step
    const recommendedProducts: Product[] = [];
    
    for (const productId of step.productAssociations.offerProducts) {
      const product = await storage.getProductById(productId);
      if (product) {
        recommendedProducts.push(product);
      }
    }
    
    // Sort by margin (highest margin first) to maximize profits
    const sortedProducts = recommendedProducts.sort((a, b) => {
      // Calculate margin percentage
      const aPrice = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const bPrice = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      
      const aCompare = a.compareAtPrice ? 
        (typeof a.compareAtPrice === 'string' ? parseFloat(a.compareAtPrice) : a.compareAtPrice) : 0;
      
      const bCompare = b.compareAtPrice ? 
        (typeof b.compareAtPrice === 'string' ? parseFloat(b.compareAtPrice) : b.compareAtPrice) : 0;
      
      const aMargin = (aPrice - aCompare) / aPrice;
      const bMargin = (bPrice - bCompare) / bPrice;
      
      return bMargin - aMargin;
    });
    
    // Return top N products
    return sortedProducts.slice(0, limit);
  } catch (error) {
    console.error("Error getting recommended products:", error);
    return [];
  }
}

/**
 * Dynamic pricing optimization
 */
export interface DynamicPricing {
  segmentId: string;
  categoryId: number;
  baseMarkupPercentage: number;
  minimumMarginPercentage: number;
  popularityBoost: number;
  lowInventoryBoost: number;
}

export const dynamicPricingRules: DynamicPricing[] = [
  {
    segmentId: "performance-enthusiasts",
    categoryId: 1, // Suspension & Lift Kits
    baseMarkupPercentage: 40, // 40% markup
    minimumMarginPercentage: 25, // Minimum 25% profit margin
    popularityBoost: 5, // Extra 5% for popular items
    lowInventoryBoost: 8 // Extra 8% for low inventory items
  },
  {
    segmentId: "mud-riders",
    categoryId: 1, // Suspension & Lift Kits
    baseMarkupPercentage: 45, // 45% markup
    minimumMarginPercentage: 30, // Minimum 30% profit margin
    popularityBoost: 10, // Extra 10% for popular items
    lowInventoryBoost: 10 // Extra 10% for low inventory items
  },
  {
    segmentId: "recreational-riders",
    categoryId: 3, // Wheels & Tires
    baseMarkupPercentage: 35, // 35% markup
    minimumMarginPercentage: 20, // Minimum 20% profit margin
    popularityBoost: 5, // Extra 5% for popular items 
    lowInventoryBoost: 5 // Extra 5% for low inventory items
  },
  {
    segmentId: "utility-workers",
    categoryId: 5, // Storage & Cargo
    baseMarkupPercentage: 30, // 30% markup
    minimumMarginPercentage: 15, // Minimum 15% profit margin
    popularityBoost: 3, // Extra 3% for popular items
    lowInventoryBoost: 5 // Extra 5% for low inventory items
  }
];

/**
 * Calculates dynamic pricing for a product based on segment and product data
 * @param product The product to price
 * @param segment The customer segment
 * @returns Object with original and dynamically calculated price
 */
export function calculateDynamicPrice(
  product: Product, 
  segment: CustomerSegment
): { originalPrice: number | string, dynamicPrice: number | string } {
  // Get base price (we'll simulate a base cost as 60% of listed price if cost isn't available)
  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const baseCost = basePrice * 0.6; // Estimated cost if not available
  
  // Find applicable pricing rule
  const pricingRule = dynamicPricingRules.find(
    rule => rule.segmentId === segment.id && rule.categoryId === product.categoryId
  );
  
  if (!pricingRule) {
    // No special pricing rule, return original price
    return {
      originalPrice: product.price,
      dynamicPrice: product.price
    };
  }
  
  // Calculate dynamic price based on rules
  let calculatedPrice = baseCost * (1 + (pricingRule.baseMarkupPercentage / 100));
  
  // Apply popularity boost if product is popular
  if (product.isPopular) {
    calculatedPrice *= (1 + (pricingRule.popularityBoost / 100));
  }
  
  // Apply inventory boost if inventory is low (less than 10 units)
  if (product.inventoryCount < 10) {
    calculatedPrice *= (1 + (pricingRule.lowInventoryBoost / 100));
  }
  
  // Ensure minimum margin
  const minimumPrice = baseCost * (1 + (pricingRule.minimumMarginPercentage / 100));
  calculatedPrice = Math.max(calculatedPrice, minimumPrice);
  
  // Round to .99
  calculatedPrice = Math.floor(calculatedPrice) + 0.99;
  
  return {
    originalPrice: product.price,
    dynamicPrice: calculatedPrice
  };
}

/**
 * AI-powered product recommendation engine
 */
export async function getPersonalizedRecommendations(
  userId: number | null,
  viewedProductIds: number[],
  currentProductId?: number,
  limit: number = 4
): Promise<Product[]> {
  try {
    // Get user segment
    const segment = await determineCustomerSegment(userId, viewedProductIds);
    
    // Get target products for that segment
    const targetProducts = segment.targetProducts;
    
    // Mix in some products from current product category if available
    let recommendedProductIds = [...targetProducts];
    
    if (currentProductId) {
      const currentProduct = await storage.getProductById(currentProductId);
      if (currentProduct) {
        // Get products from same category
        const categoryProducts = await storage.getProducts({ 
          categoryId: currentProduct.categoryId,
          limit: 5
        });
        
        // Add these product IDs if they're not already in the list
        categoryProducts.products.forEach(product => {
          if (!recommendedProductIds.includes(product.id) && product.id !== currentProductId) {
            recommendedProductIds.push(product.id);
          }
        });
      }
    }
    
    // Get full product data for recommendations
    const recommendations: Product[] = [];
    for (const productId of recommendedProductIds) {
      const product = await storage.getProductById(productId);
      if (product) {
        recommendations.push(product);
      }
    }
    
    // Sort by relevance to the segment (products specifically targeted to this segment first)
    const sortedRecommendations = recommendations.sort((a, b) => {
      const aIsTargeted = segment.targetProducts.includes(a.id) ? 1 : 0;
      const bIsTargeted = segment.targetProducts.includes(b.id) ? 1 : 0;
      
      if (aIsTargeted !== bIsTargeted) {
        return bIsTargeted - aIsTargeted; // Targeted products first
      }
      
      // Then by popularity and rating
      if (a.isPopular !== b.isPopular) {
        return a.isPopular ? -1 : 1; // Popular products first
      }
      
      return (b.rating || 0) - (a.rating || 0); // Higher rated products first
    });
    
    // Return limited number of recommendations
    return sortedRecommendations.slice(0, limit);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return [];
  }
}

/**
 * Maximum Revenue Management
 * Ensures daily revenue stays below $500,000 USD monthly
 */

// Revenue cap management object
export const revenueManager = {
  dailyRevenue: 0,
  monthlyRevenue: 0,
  lastReset: new Date(),
  maxMonthlyRevenue: 500000, // $500,000 USD monthly limit
  maxDailyRevenue: 500000 / 30, // ~$16,667 daily limit
  
  // Add revenue from a new order
  addRevenue(amount: number): boolean {
    // Check if we need to reset daily counter
    const now = new Date();
    if (now.getDate() !== this.lastReset.getDate()) {
      this.dailyRevenue = 0;
      this.lastReset = now;
      
      // If it's a new month, reset monthly counter too
      if (now.getMonth() !== this.lastReset.getMonth()) {
        this.monthlyRevenue = 0;
      }
    }
    
    // Add revenue
    this.dailyRevenue += amount;
    this.monthlyRevenue += amount;
    
    // Check if we're exceeding limits
    return this.dailyRevenue <= this.maxDailyRevenue && 
           this.monthlyRevenue <= this.maxMonthlyRevenue;
  },
  
  // Check if accepting more orders would exceed limits
  canAcceptMoreOrders(): boolean {
    // Allow some buffer (95% of limit)
    return this.dailyRevenue < (this.maxDailyRevenue * 0.95) && 
           this.monthlyRevenue < (this.maxMonthlyRevenue * 0.95);
  },
  
  // Get percentage of daily target reached
  getDailyPercentage(): number {
    return (this.dailyRevenue / this.maxDailyRevenue) * 100;
  },
  
  // Get percentage of monthly target reached
  getMonthlyPercentage(): number {
    return (this.monthlyRevenue / this.maxMonthlyRevenue) * 100;
  },
  
  // Adjust marketing and promotions based on revenue status
  getRevenueStatus(): {
    status: "under_target" | "on_target" | "near_limit" | "at_limit";
    adSpendMultiplier: number;
    shouldOfferPromotions: boolean;
  } {
    const dailyPercentage = this.getDailyPercentage();
    const monthlyPercentage = this.getMonthlyPercentage();
    
    if (dailyPercentage > 95 || monthlyPercentage > 95) {
      return {
        status: "at_limit",
        adSpendMultiplier: 0, // Stop all ad spend
        shouldOfferPromotions: false
      };
    }
    
    if (dailyPercentage > 80 || monthlyPercentage > 80) {
      return {
        status: "near_limit",
        adSpendMultiplier: 0.3, // Reduce ad spend by 70%
        shouldOfferPromotions: false
      };
    }
    
    if (dailyPercentage > 50 || monthlyPercentage > 50) {
      return {
        status: "on_target",
        adSpendMultiplier: 0.8, // Reduce ad spend by 20%
        shouldOfferPromotions: true
      };
    }
    
    return {
      status: "under_target",
      adSpendMultiplier: 1.0, // Full ad spend
      shouldOfferPromotions: true
    };
  }
};