/**
 * Client-side Sales Funnel Integration
 * Connect to AI-powered optimization APIs to drive guaranteed sales
 */

import { apiRequest } from "./queryClient";
import { Product } from "../../shared/schema";

// Types for API responses
export interface FunnelOffer {
  id: number;
  name: string;
  description: string;
  image: string | null;
  originalPrice: number | string;
  offerPrice: number | string | null;
  discountPercentage: number;
}

export interface PersonalizedOffersResponse {
  segmentId: string;
  funnelStepId: string;
  cta: string;
  message: string;
  offers: FunnelOffer[];
}

export interface ProductRecommendation {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  image: string | null;
  rating: number;
  reviewCount: number;
}

export interface RecommendationsResponse {
  recommendations: ProductRecommendation[];
}

export interface CartRecommendation {
  triggerProductId: number;
  recommendations: FunnelOffer[];
}

export interface CartRecommendationsResponse {
  segmentId: string;
  recommendations: CartRecommendation[];
}

export interface CheckoutOffer {
  id: number;
  name: string;
  image: string | null;
  price: number | string;
  description: string;
  cta: string;
  message: string;
}

export interface CheckoutOffersResponse {
  offers: CheckoutOffer[];
}

export interface NextPurchaseOffer {
  discountCode: string;
  discountValue: number;
  discountType: string;
  validDays: number;
  message: string;
}

export interface OrderConfirmationOffersResponse {
  segmentId: string;
  nextPurchaseOffer: NextPurchaseOffer;
  recommendations: ProductRecommendation[];
}

// Session storage for viewed products
const SESSION_VIEWED_PRODUCTS_KEY = 'viewed_products';

/**
 * Records a product view to the backend for analytics and personalization
 * @param productId Product that was viewed
 * @param userId User ID if logged in
 */
export async function recordProductView(productId: number, userId?: number): Promise<void> {
  try {
    // Generate a simple session ID if not available
    const sessionId = localStorage.getItem('session_id') || 
      `session_${Math.random().toString(36).substring(2, 15)}`;
    
    // Store session ID if not already stored
    if (!localStorage.getItem('session_id')) {
      localStorage.setItem('session_id', sessionId);
    }
    
    // Add to viewed products in session
    const viewedProducts = getViewedProducts();
    if (!viewedProducts.includes(productId)) {
      viewedProducts.push(productId);
      localStorage.setItem(SESSION_VIEWED_PRODUCTS_KEY, JSON.stringify(viewedProducts));
    }
    
    // Send to backend
    await apiRequest('POST', '/api/record-product-view', {
      productId,
      userId,
      sessionId
    });
  } catch (error) {
    console.error('Error recording product view:', error);
  }
}

/**
 * Get list of products viewed in this session
 */
export function getViewedProducts(): number[] {
  try {
    const viewedProductsStr = localStorage.getItem(SESSION_VIEWED_PRODUCTS_KEY);
    if (viewedProductsStr) {
      return JSON.parse(viewedProductsStr) as number[];
    }
    return [];
  } catch (error) {
    console.error('Error getting viewed products:', error);
    return [];
  }
}

/**
 * Get personalized offers for the product page
 * @param currentProductId Currently viewed product
 * @param userId User ID if logged in
 * @returns Personalized offers response
 */
export async function getPersonalizedOffers(
  currentProductId: number,
  userId?: number
): Promise<PersonalizedOffersResponse> {
  try {
    const viewedProductIds = getViewedProducts();
    
    const response = await apiRequest('POST', '/api/personalized-offers', {
      currentProductId,
      viewedProductIds,
      userId,
      position: 'product_page'
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error getting personalized offers:', error);
    // Return empty default
    return {
      segmentId: '',
      funnelStepId: '',
      cta: 'View Details',
      message: 'You might also like these products',
      offers: []
    };
  }
}

/**
 * Get personalized product recommendations
 * @param currentProductId Currently viewed product
 * @param userId User ID if logged in
 * @param limit Number of recommendations to fetch
 * @returns Product recommendations
 */
export async function getPersonalizedRecommendations(
  currentProductId?: number,
  userId?: number,
  limit: number = 4
): Promise<RecommendationsResponse> {
  try {
    const viewedProductIds = getViewedProducts();
    
    const response = await apiRequest('POST', '/api/personalized-recommendations', {
      currentProductId,
      viewedProductIds,
      userId,
      limit
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return {
      recommendations: []
    };
  }
}

/**
 * Get cart recommendations (cross-sells or upsells)
 * @param cartItems Items in the cart
 * @param userId User ID if logged in
 * @returns Cart recommendations
 */
export async function getCartRecommendations(
  cartItems: { productId: number; quantity: number }[],
  userId?: number
): Promise<CartRecommendationsResponse> {
  try {
    const sessionId = localStorage.getItem('session_id');
    
    const response = await apiRequest('POST', '/api/cart-recommendations', {
      cartItems,
      userId,
      sessionId
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error getting cart recommendations:', error);
    return {
      segmentId: '',
      recommendations: []
    };
  }
}

/**
 * Get checkout offers (last chance upsells)
 * @param cartItems Items in cart
 * @param userId User ID if logged in
 * @returns Checkout offers
 */
export async function getCheckoutOffers(
  cartItems: { productId: number; quantity: number }[],
  userId?: number
): Promise<CheckoutOffersResponse> {
  try {
    const sessionId = localStorage.getItem('session_id');
    
    const response = await apiRequest('POST', '/api/checkout-offers', {
      cartItems,
      userId,
      sessionId
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error getting checkout offers:', error);
    return {
      offers: []
    };
  }
}

/**
 * Get order confirmation offers and recommendations
 * @param orderId Order ID
 * @param orderItems Items in order
 * @param userId User ID if logged in
 * @returns Order confirmation offers
 */
export async function getOrderConfirmationOffers(
  orderId: number,
  orderItems: { productId: number }[],
  userId?: number
): Promise<OrderConfirmationOffersResponse> {
  try {
    const response = await apiRequest('POST', '/api/order-confirmation-offers', {
      orderId,
      orderItems,
      userId
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error getting order confirmation offers:', error);
    return {
      segmentId: '',
      nextPurchaseOffer: {
        discountCode: '',
        discountValue: 0,
        discountType: 'percentage',
        validDays: 0,
        message: 'Thank you for your purchase!'
      },
      recommendations: []
    };
  }
}

/**
 * Record order revenue to ensure monthly limit compliance
 * @param orderId Order ID
 * @param amount Order amount
 * @returns Status including whether we're approaching monthly limits
 */
export async function recordOrderRevenue(
  orderId: number,
  amount: number
): Promise<{
  success: boolean;
  withinLimits: boolean;
  dailyPercentage: number;
  monthlyPercentage: number;
  revenueStatus: string;
}> {
  try {
    const response = await apiRequest('POST', '/api/record-order-revenue', {
      orderId,
      amount
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error recording order revenue:', error);
    return {
      success: false,
      withinLimits: true,
      dailyPercentage: 0,
      monthlyPercentage: 0,
      revenueStatus: 'under_target'
    };
  }
}