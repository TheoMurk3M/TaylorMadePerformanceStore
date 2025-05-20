/**
 * Client-side sales funnel with optimization for free tier hosting
 * - Uses browser localStorage for caching
 * - Implements bandwidth-friendly API calls
 * - Handles offline fallback for guaranteed sales
 */
import { apiRequest } from './queryClient';

// Types for personalized offers returned by the API
export interface FunnelOffer {
  id: number;
  name: string;
  description: string;
  image?: string;
  originalPrice: number | string;
  offerPrice?: number | string;
  discountPercentage: number;
}

export interface PersonalizedOffersResponse {
  offers: FunnelOffer[];
  message: string;
  cta: string;
  segment?: string;
}

export interface CheckoutOffer {
  id: number;
  name: string;
  description: string;
  message: string;
  image?: string;
  price: number | string;
  cta: string;
}

export interface CheckoutOffersResponse {
  offers: CheckoutOffer[];
}

// Cache durations in milliseconds - keep short for a responsive system
const CACHE_DURATIONS = {
  PERSONALIZED_OFFERS: 15 * 60 * 1000, // 15 minutes
  CHECKOUT_OFFERS: 10 * 60 * 1000,     // 10 minutes
  USER_SEGMENT: 24 * 60 * 60 * 1000,   // 24 hours
};

// Fallback recommendations in case of API failure or offline mode
// These ensure sales even if the API is unavailable
const FALLBACK_OFFERS: FunnelOffer[] = [
  {
    id: 1,
    name: "SuperATV Heavy Duty Replacement Axle",
    description: "Upgraded Rhino Brand axle for Polaris RZR models with reinforced CV joints.",
    image: "/images/products/superatv-axle.jpg",
    originalPrice: 299.99,
    offerPrice: 249.99,
    discountPercentage: 17
  },
  {
    id: 2,
    name: "Pro Armor Crawler XG Tires (Set of 4)",
    description: "Aggressive all-terrain UTV tires with reinforced sidewalls for extreme terrain.",
    image: "/images/products/proarmor-tires.jpg",
    originalPrice: 799.99,
    offerPrice: 699.99,
    discountPercentage: 12
  },
  {
    id: 3, 
    name: "High Lifter Lift Kit",
    description: "2-inch lift kit specifically designed for Honda Pioneer models.",
    image: "/images/products/highlifter-liftkit.jpg",
    originalPrice: 449.99,
    discountPercentage: 0
  }
];

const FALLBACK_CHECKOUT_OFFERS: CheckoutOffer[] = [
  {
    id: 4,
    name: "Tusk UTV Mirror Set",
    description: "Side view mirrors for improved visibility and safety. Universal mounting.",
    message: "Complete your order with this popular accessory!",
    image: "/images/products/tusk-mirrors.jpg",
    price: 49.99,
    cta: "Add to Order"
  }
];

// Cache management using browser localStorage to reduce server load
function setCachedData(key: string, data: any, duration: number): void {
  if (!localStorage) return;
  
  try {
    const item = {
      data,
      expiry: Date.now() + duration
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

function getCachedData(key: string): any | null {
  if (!localStorage) return null;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsedItem = JSON.parse(item);
    if (Date.now() > parsedItem.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsedItem.data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
}

// Get personalized offers based on current product and user
export async function getPersonalizedOffers(
  productId: number,
  userId?: number
): Promise<PersonalizedOffersResponse> {
  // Try to use cached data first to reduce API calls (important for free tiers)
  const cacheKey = `offers_${productId}_${userId || 'guest'}`;
  const cachedOffers = getCachedData(cacheKey);
  
  if (cachedOffers) {
    return cachedOffers;
  }
  
  try {
    // Optimized request with minimal payload
    const response = await apiRequest('POST', '/api/funnel/personalized-offers', {
      productId,
      userId: userId || null,
      source: 'product_page'
    });
    
    const data = await response.json();
    
    // Cache the results to minimize API usage
    setCachedData(cacheKey, data, CACHE_DURATIONS.PERSONALIZED_OFFERS);
    
    return data;
  } catch (error) {
    console.error('Error fetching personalized offers:', error);
    
    // Return fallback offers to ensure sales funnel continues working
    // This is critical for guaranteed daily sales
    return {
      offers: FALLBACK_OFFERS,
      message: "Recommended Products For You",
      cta: "View Details"
    };
  }
}

// Get optimized checkout offers based on cart contents
export async function getCheckoutOffers(
  cartItems: { productId: number, quantity: number }[],
  userId?: number
): Promise<CheckoutOffersResponse> {
  // Build cache key based on cart contents
  const cartKey = cartItems
    .map(item => `${item.productId}:${item.quantity}`)
    .sort()
    .join('-');
  
  const cacheKey = `checkout_${cartKey}_${userId || 'guest'}`;
  const cachedOffers = getCachedData(cacheKey);
  
  if (cachedOffers) {
    return cachedOffers;
  }
  
  try {
    const response = await apiRequest('POST', '/api/funnel/checkout-offers', {
      cartItems,
      userId: userId || null
    });
    
    const data = await response.json();
    
    // Cache checkout offers
    setCachedData(cacheKey, data, CACHE_DURATIONS.CHECKOUT_OFFERS);
    
    return data;
  } catch (error) {
    console.error('Error fetching checkout offers:', error);
    
    // Return fallback checkout offers
    return {
      offers: FALLBACK_CHECKOUT_OFFERS
    };
  }
}

// Get user segment for personalized shopping experience
export async function getUserSegment(
  userId?: number,
  browsingHistory: number[] = []
): Promise<string> {
  const cacheKey = `segment_${userId || 'guest'}`;
  const cachedSegment = getCachedData(cacheKey);
  
  if (cachedSegment) {
    return cachedSegment;
  }
  
  try {
    const response = await apiRequest('POST', '/api/funnel/user-segment', {
      userId: userId || null,
      browsingHistory
    });
    
    const data = await response.json();
    const segment = data.segment || 'general';
    
    // Cache segment for longer period to reduce API usage
    setCachedData(cacheKey, segment, CACHE_DURATIONS.USER_SEGMENT);
    
    return segment;
  } catch (error) {
    console.error('Error determining user segment:', error);
    return 'general';
  }
}

// Track product views locally to conserve server resources
// This strategy is optimized for free tier hosting
const viewedProducts: Set<number> = new Set();

export function trackProductView(productId: number): void {
  viewedProducts.add(productId);
  
  // Only sync to server periodically to reduce API calls
  // This batch processing approach is more efficient for free tiers
  const shouldSync = viewedProducts.size % 5 === 0;
  
  if (shouldSync) {
    try {
      const productArray = Array.from(viewedProducts);
      
      // Fire and forget to avoid waiting for response
      apiRequest('POST', '/api/analytics/product-views', {
        productIds: productArray
      });
    } catch (error) {
      // Silent fail - analytics are non-critical
    }
  }
}

// Low-resource recommendation engine that works entirely client-side
// This is a fallback for when API calls are limited
export function getRelatedProducts(
  product: { id: number, categoryId?: number, brandId?: number },
  allProducts: any[]
): number[] {
  if (!allProducts || allProducts.length === 0) {
    return [];
  }
  
  // Simple algorithm that doesn't require heavy computation
  const sameCategoryProducts = allProducts.filter(
    p => p.id !== product.id && p.categoryId === product.categoryId
  );
  
  const sameBrandProducts = allProducts.filter(
    p => p.id !== product.id && p.brandId === product.brandId
  );
  
  // Combine and deduplicate
  const combinedProducts = [...sameCategoryProducts, ...sameBrandProducts];
  const uniqueProductIds = Array.from(new Set(combinedProducts.map(p => p.id)));
  
  // Return limited result set
  return uniqueProductIds.slice(0, 3);
}