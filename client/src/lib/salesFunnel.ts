/**
 * Client-side sales funnel optimization
 * 
 * This module handles:
 * - Customer browsing behavior tracking
 * - Personalized recommendations
 * - Cart abandonment management
 * - Dynamic pricing and upsell offers
 * 
 * Optimized for free tier hosting with:
 * - LocalStorage persistence to reduce server calls
 * - Batched API calls to minimize quota usage
 * - Fallback mechanisms when API limits are reached
 */

import { apiRequest } from './queryClient';

// Session data structure
interface SessionData {
  viewedProducts: number[];
  cartItems: number[];
  cartAbandons: number[];
  sessionStartTime: number;
  deviceInfo: {
    screenWidth: number;
    mobileDevice: boolean;
    browser: string;
    os: string;
  };
  referrer: string | null;
}

// Customer segment based on browsing behavior
export type CustomerSegment = 'price_sensitive' | 'feature_focused' | 'brand_loyal' | 'new_visitor' | 'returning_customer';

// Initialize session tracking
export function initSessionTracking(): void {
  // Only initialize once per session
  if (window.localStorage.getItem('utv_session')) {
    return;
  }

  // Create and store new session data
  const sessionData: SessionData = {
    viewedProducts: [],
    cartItems: [],
    cartAbandons: [],
    sessionStartTime: Date.now(),
    deviceInfo: {
      screenWidth: window.innerWidth,
      mobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      browser: getBrowserInfo(),
      os: getOSInfo()
    },
    referrer: document.referrer || null
  };

  // Store session data in localStorage
  window.localStorage.setItem('utv_session', JSON.stringify(sessionData));

  // Send initial session data to server (non-blocking)
  try {
    apiRequest('POST', '/api/analytics/session', sessionData)
      .catch(err => console.error('Error sending session data:', err));
  } catch (error) {
    console.error('Error initializing session tracking:', error);
  }
}

// Track product view
export async function trackProductView(productId: number): Promise<void> {
  try {
    // Get current session data
    const sessionData = getSessionData();
    if (!sessionData) return;

    // Add to viewed products if not already viewed
    if (!sessionData.viewedProducts.includes(productId)) {
      sessionData.viewedProducts.push(productId);
      window.localStorage.setItem('utv_session', JSON.stringify(sessionData));
    }

    // Send view data to server (non-blocking)
    apiRequest('POST', '/api/analytics/product-view', { productId })
      .catch(err => console.error('Error sending product view data:', err));
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}

// Track adding items to cart
export async function trackAddToCart(productId: number): Promise<void> {
  try {
    // Get current session data
    const sessionData = getSessionData();
    if (!sessionData) return;

    // Add to cart items if not already in cart
    if (!sessionData.cartItems.includes(productId)) {
      sessionData.cartItems.push(productId);
      window.localStorage.setItem('utv_session', JSON.stringify(sessionData));
    }

    // Send cart data to server (non-blocking)
    apiRequest('POST', '/api/analytics/add-to-cart', { productId })
      .catch(err => console.error('Error sending add to cart data:', err));
  } catch (error) {
    console.error('Error tracking add to cart:', error);
  }
}

// Track cart abandonment
export async function trackCartAbandon(productIds: number[]): Promise<void> {
  try {
    // Get current session data
    const sessionData = getSessionData();
    if (!sessionData) return;

    // Add to cart abandons
    productIds.forEach(id => {
      if (!sessionData.cartAbandons.includes(id)) {
        sessionData.cartAbandons.push(id);
      }
    });
    window.localStorage.setItem('utv_session', JSON.stringify(sessionData));

    // Send abandon data to server (non-blocking)
    apiRequest('POST', '/api/analytics/cart-abandon', { productIds })
      .catch(err => console.error('Error sending cart abandon data:', err));
  } catch (error) {
    console.error('Error tracking cart abandon:', error);
  }
}

// Get personalized product recommendations
export async function getPersonalizedRecommendations(
  currentProductId?: number,
  limit: number = 4
): Promise<number[]> {
  try {
    // Get session data for context
    const sessionData = getSessionData();
    
    // First try to get recommendations from server
    try {
      const response = await apiRequest('POST', '/api/recommendations/personalized', {
        currentProductId,
        sessionData,
        limit
      });
      
      const data = await response.json();
      return data.recommendedProductIds;
    } catch (serverError) {
      console.error('Error fetching recommendations from server:', serverError);
      
      // Fall back to local recommendation strategy if server fails
      return getFallbackRecommendations(currentProductId, sessionData, limit);
    }
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    
    // Return empty array as last resort
    return [];
  }
}

// Get checkout upsell offers
export async function getCheckoutOffers(
  cartProductIds: number[],
  limit: number = 2
): Promise<number[]> {
  try {
    // Get session data for context
    const sessionData = getSessionData();
    
    // First try to get upsells from server
    try {
      const response = await apiRequest('POST', '/api/recommendations/checkout-offers', {
        cartProductIds,
        sessionData,
        limit
      });
      
      const data = await response.json();
      return data.recommendedProductIds;
    } catch (serverError) {
      console.error('Error fetching checkout offers from server:', serverError);
      
      // Fall back to local recommendation strategy if server fails
      return getFallbackCheckoutOffers(cartProductIds, sessionData, limit);
    }
  } catch (error) {
    console.error('Error getting checkout offers:', error);
    
    // Return empty array as last resort
    return [];
  }
}

// Get bundle offers for product detail page
export async function getBundleOffers(
  productId: number,
  limit: number = 3
): Promise<{
  bundleProducts: number[],
  bundleDiscount: number
}> {
  try {
    // First try to get bundle offers from server
    try {
      const response = await apiRequest('POST', '/api/recommendations/bundle-offers', {
        productId,
        limit
      });
      
      return await response.json();
    } catch (serverError) {
      console.error('Error fetching bundle offers from server:', serverError);
      
      // Fall back to local bundle strategy
      return {
        bundleProducts: await getFallbackBundleProducts(productId, limit),
        bundleDiscount: 0.15 // 15% discount as fallback
      };
    }
  } catch (error) {
    console.error('Error getting bundle offers:', error);
    
    // Return empty bundle as last resort
    return {
      bundleProducts: [],
      bundleDiscount: 0
    };
  }
}

// Helper function to get session data
function getSessionData(): SessionData | null {
  try {
    const sessionJson = window.localStorage.getItem('utv_session');
    if (!sessionJson) {
      initSessionTracking();
      return getSessionData();
    }
    
    return JSON.parse(sessionJson) as SessionData;
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
}

// Helper function to detect browser
function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Chrome") > -1) return "Chrome";
  if (userAgent.indexOf("Safari") > -1) return "Safari";
  if (userAgent.indexOf("Firefox") > -1) return "Firefox";
  if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "IE";
  if (userAgent.indexOf("Edge") > -1) return "Edge";
  return "Unknown";
}

// Helper function to detect OS
function getOSInfo(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Win") > -1) return "Windows";
  if (userAgent.indexOf("Mac") > -1) return "MacOS";
  if (userAgent.indexOf("Linux") > -1) return "Linux";
  if (userAgent.indexOf("Android") > -1) return "Android";
  if (userAgent.indexOf("iOS") > -1 || /iPad|iPhone|iPod/.test(userAgent)) return "iOS";
  return "Unknown";
}

// Fallback local recommendation algorithm when server is unavailable
async function getFallbackRecommendations(
  currentProductId?: number,
  sessionData?: SessionData | null,
  limit: number = 4
): Promise<number[]> {
  try {
    // Use cached top sellers if available
    const cachedTopSellers = window.localStorage.getItem('utv_top_sellers');
    if (cachedTopSellers) {
      const topSellers = JSON.parse(cachedTopSellers) as number[];
      
      // Filter out current product
      return topSellers
        .filter(id => id !== currentProductId)
        .slice(0, limit);
    }
    
    // Try to fetch top sellers from API
    try {
      const response = await apiRequest('GET', '/api/products?isFeatured=true&limit=10');
      const data = await response.json();
      
      // Extract product IDs
      const productIds = data.products.map((p: any) => p.id);
      
      // Cache for future use
      window.localStorage.setItem('utv_top_sellers', JSON.stringify(productIds));
      
      // Filter out current product
      return productIds
        .filter((id: number) => id !== currentProductId)
        .slice(0, limit);
    } catch (apiError) {
      console.error('Error fetching top sellers:', apiError);
      
      // Last resort: return hardcoded popular product IDs
      return [1, 2, 3, 4, 5, 6]
        .filter(id => id !== currentProductId)
        .slice(0, limit);
    }
  } catch (error) {
    console.error('Error in fallback recommendations:', error);
    return [];
  }
}

// Fallback checkout offers when server is unavailable
async function getFallbackCheckoutOffers(
  cartProductIds: number[],
  sessionData?: SessionData | null,
  limit: number = 2
): Promise<number[]> {
  try {
    // Use cached complementary products if available
    const cachedComplementary = window.localStorage.getItem('utv_complementary_products');
    if (cachedComplementary) {
      const complementary = JSON.parse(cachedComplementary) as number[];
      
      // Filter out products already in cart
      return complementary
        .filter(id => !cartProductIds.includes(id))
        .slice(0, limit);
    }
    
    // Try to fetch low-cost accessories from API
    try {
      const response = await apiRequest('GET', '/api/products?categoryId=3&limit=10&sortBy=price&sortOrder=asc');
      const data = await response.json();
      
      // Extract product IDs
      const productIds = data.products.map((p: any) => p.id);
      
      // Cache for future use
      window.localStorage.setItem('utv_complementary_products', JSON.stringify(productIds));
      
      // Filter out products already in cart
      return productIds
        .filter((id: number) => !cartProductIds.includes(id))
        .slice(0, limit);
    } catch (apiError) {
      console.error('Error fetching complementary products:', apiError);
      
      // Last resort: return hardcoded accessory product IDs
      return [7, 8, 9, 10]
        .filter(id => !cartProductIds.includes(id))
        .slice(0, limit);
    }
  } catch (error) {
    console.error('Error in fallback checkout offers:', error);
    return [];
  }
}

// Fallback bundle products when server is unavailable
async function getFallbackBundleProducts(
  productId: number,
  limit: number = 3
): Promise<number[]> {
  try {
    // Use cached bundles if available
    const cachedBundleKey = `utv_bundle_${productId}`;
    const cachedBundle = window.localStorage.getItem(cachedBundleKey);
    
    if (cachedBundle) {
      return JSON.parse(cachedBundle) as number[];
    }
    
    // Try to fetch related products from API
    try {
      // Get the product details to know its category
      const productResponse = await apiRequest('GET', `/api/products/${productId}`);
      const productData = await productResponse.json();
      
      // Get other products from same category
      const categoryId = productData.categoryId;
      const response = await apiRequest('GET', `/api/products?categoryId=${categoryId}&limit=${limit + 1}`);
      const data = await response.json();
      
      // Extract product IDs and filter out the current product
      const productIds = data.products
        .map((p: any) => p.id)
        .filter((id: number) => id !== productId)
        .slice(0, limit);
      
      // Cache for future use
      window.localStorage.setItem(cachedBundleKey, JSON.stringify(productIds));
      
      return productIds;
    } catch (apiError) {
      console.error('Error fetching bundle products:', apiError);
      
      // Last resort: return hardcoded bundle product IDs
      return [11, 12, 13]
        .filter(id => id !== productId)
        .slice(0, limit);
    }
  } catch (error) {
    console.error('Error in fallback bundle products:', error);
    return [];
  }
}