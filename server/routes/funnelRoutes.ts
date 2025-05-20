/**
 * Click Funnel API Routes for UTV Parts Shop
 * These APIs power the advanced sales optimization systems
 */

import { Express, Request, Response } from "express";
import { 
  determineCustomerSegment, 
  determineFunnelStep, 
  getRecommendedProducts,
  calculateDynamicPrice,
  getPersonalizedRecommendations,
  revenueManager
} from "../ai/salesOptimization";
import { storage } from "../storage";

export function registerFunnelRoutes(app: Express) {
  /**
   * Get personalized offers for a user based on their browsing history and segment
   */
  app.post("/api/personalized-offers", async (req: Request, res: Response) => {
    try {
      const { userId, viewedProductIds, currentProductId, position } = req.body;
      
      if (!viewedProductIds || !Array.isArray(viewedProductIds)) {
        return res.status(400).json({ 
          error: "Missing required parameter: viewedProductIds (array)" 
        });
      }

      // Check if we're at sales limit for the day/month
      const revenueStatus = revenueManager.getRevenueStatus();
      if (revenueStatus.status === "at_limit") {
        return res.json({
          offers: [],
          message: "No special offers available at this time"
        });
      }

      // Determine customer segment
      const segment = await determineCustomerSegment(
        userId || null, 
        viewedProductIds || []
      );
      
      // Get the best funnel step for this user/position
      const funnelStep = determineFunnelStep(
        segment,
        currentProductId || viewedProductIds[0], 
        position || "product_page"
      );
      
      if (!funnelStep) {
        return res.json({
          offers: [],
          message: "No special offers available at this time"
        });
      }
      
      // Get recommended products for this funnel step
      const recommendedProducts = await getRecommendedProducts(funnelStep, 3);
      
      // Apply any dynamic pricing
      const offers = await Promise.all(recommendedProducts.map(async (product) => {
        const pricing = calculateDynamicPrice(product, segment);
        
        // Check if there's an actual discount
        const hasDiscount = pricing.dynamicPrice !== pricing.originalPrice;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          originalPrice: pricing.originalPrice,
          offerPrice: hasDiscount ? pricing.dynamicPrice : null,
          discountPercentage: hasDiscount ? 
            Math.round((1 - (Number(pricing.dynamicPrice) / Number(pricing.originalPrice))) * 100) : 0
        };
      }));
      
      // Format the message using the segment template
      let message = segment.messageTemplate;
      message = message.replace("{{discount}}", segment.discountValue.toString());
      
      res.json({
        segmentId: segment.id,
        funnelStepId: funnelStep.id,
        cta: funnelStep.cta,
        message,
        offers
      });
    } catch (error) {
      console.error("Error generating personalized offers:", error);
      res.status(500).json({ error: "Failed to generate personalized offers" });
    }
  });

  /**
   * Get personalized recommendations for products
   */
  app.post("/api/personalized-recommendations", async (req: Request, res: Response) => {
    try {
      const { userId, viewedProductIds, currentProductId, limit } = req.body;
      
      const recommendations = await getPersonalizedRecommendations(
        userId || null,
        viewedProductIds || [],
        currentProductId,
        limit || 4
      );
      
      const formattedRecommendations = recommendations.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0
      }));
      
      res.json({
        recommendations: formattedRecommendations
      });
    } catch (error) {
      console.error("Error generating personalized recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  /**
   * Record product view for analytics and personalization
   */
  app.post("/api/record-product-view", async (req: Request, res: Response) => {
    try {
      const { userId, productId, sessionId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Missing required parameter: productId" });
      }
      
      // In a real implementation, we would store this in a database
      console.log(`Recording product view: Product ${productId} viewed by User ${userId || 'anonymous'} (Session: ${sessionId || 'unknown'})`);
      
      // Return recommended products based on this view
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Get related products from same category
      const relatedProducts = await storage.getProducts({
        categoryId: product.categoryId,
        limit: 4
      });
      
      res.json({
        success: true,
        relatedProducts: relatedProducts.products.filter(p => p.id !== productId)
      });
    } catch (error) {
      console.error("Error recording product view:", error);
      res.status(500).json({ error: "Failed to record product view" });
    }
  });

  /**
   * Add to cart optimization - returns upsell/cross-sell recommendations
   */
  app.post("/api/cart-recommendations", async (req: Request, res: Response) => {
    try {
      const { userId, cartItems, sessionId } = req.body;
      
      if (!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({ error: "Missing required parameter: cartItems (array)" });
      }
      
      // Get all product IDs in cart
      const productIds = cartItems.map(item => item.productId);
      
      // Determine customer segment based on cart items
      const segment = await determineCustomerSegment(
        userId || null, 
        productIds
      );
      
      // Find bundles or complementary products specific to cart
      const recommendations = await Promise.all(cartItems.map(async (item) => {
        // Get funnel step based on the cart position
        const funnelStep = determineFunnelStep(
          segment,
          item.productId, 
          "cart"
        );
        
        if (!funnelStep) {
          return null;
        }
        
        // Get product recommendations for this item
        const recommendedProducts = await getRecommendedProducts(funnelStep, 2);
        
        // Format and return recommendations
        return {
          triggerProductId: item.productId,
          recommendations: recommendedProducts.map(product => ({
            id: product.id,
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            price: product.price,
            description: product.description
          }))
        };
      }));
      
      // Filter out null entries and flatten recommendations
      const filteredRecommendations = recommendations
        .filter(r => r !== null && r.recommendations.length > 0);
      
      res.json({
        segmentId: segment.id,
        recommendations: filteredRecommendations
      });
    } catch (error) {
      console.error("Error generating cart recommendations:", error);
      res.status(500).json({ error: "Failed to generate cart recommendations" });
    }
  });

  /**
   * Checkout upsell offers API
   */
  app.post("/api/checkout-offers", async (req: Request, res: Response) => {
    try {
      const { userId, cartItems, sessionId } = req.body;
      
      if (!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({ error: "Missing required parameter: cartItems (array)" });
      }
      
      // Get all product IDs in cart
      const productIds = cartItems.map(item => item.productId);
      
      // Determine customer segment
      const segment = await determineCustomerSegment(
        userId || null, 
        productIds
      );
      
      // Find the best funnel step for checkout position
      const funnelStep = determineFunnelStep(
        segment,
        productIds[0], // Use first product as trigger
        "checkout"
      );
      
      if (!funnelStep) {
        return res.json({
          offers: []
        });
      }
      
      // Get recommended products for this funnel step
      const recommendedProducts = await getRecommendedProducts(funnelStep, 1);
      
      // Only show one strong offer at checkout
      const offers = recommendedProducts.map(product => ({
        id: product.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        price: product.price,
        description: product.description,
        cta: "Add to Order",
        message: "Last chance! Add this essential item before completing your order."
      }));
      
      res.json({
        offers
      });
    } catch (error) {
      console.error("Error generating checkout offers:", error);
      res.status(500).json({ error: "Failed to generate checkout offers" });
    }
  });

  /**
   * Order confirmation recommendations API
   */
  app.post("/api/order-confirmation-offers", async (req: Request, res: Response) => {
    try {
      const { userId, orderId, orderItems } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: "Missing required parameter: orderId" });
      }
      
      // Get order if orderItems not provided
      let items = orderItems;
      if (!items && orderId) {
        const order = await storage.getOrderById(orderId);
        if (order) {
          items = await storage.getOrderItemsByOrderId(order.id);
        }
      }
      
      if (!items || items.length === 0) {
        return res.status(404).json({ error: "Order items not found" });
      }
      
      // Get all product IDs in order
      const productIds = items.map(item => item.productId);
      
      // Determine customer segment based on purchased items
      const segment = await determineCustomerSegment(
        userId || null, 
        productIds
      );
      
      // Find the best funnel step for order confirmation position
      const funnelStep = determineFunnelStep(
        segment,
        productIds[0], 
        "order_confirmation"
      );
      
      // Format loyalty offers or next purchase recommendations
      let nextPurchaseOffer = {
        discountCode: `NEXT${orderId}`,
        discountValue: segment.discountValue,
        discountType: segment.discountStrategy,
        validDays: 30,
        message: `Thank you for your purchase! Use code NEXT${orderId} for ${segment.discountValue}% off your next order within 30 days.`
      };
      
      // Get recommended products for future purchases
      const recommendedProducts = await getPersonalizedRecommendations(
        userId || null,
        productIds,
        undefined,
        3
      );
      
      const recommendations = recommendedProducts.map(product => ({
        id: product.id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        price: product.price,
        slug: product.slug
      }));
      
      res.json({
        segmentId: segment.id,
        nextPurchaseOffer,
        recommendations
      });
    } catch (error) {
      console.error("Error generating order confirmation offers:", error);
      res.status(500).json({ error: "Failed to generate offers" });
    }
  });

  /**
   * Record revenue to ensure we don't exceed monthly limits
   */
  app.post("/api/record-order-revenue", async (req: Request, res: Response) => {
    try {
      const { orderId, amount } = req.body;
      
      if (!orderId || !amount) {
        return res.status(400).json({ 
          error: "Missing required parameters: orderId and amount" 
        });
      }
      
      // Record the revenue
      const withinLimits = revenueManager.addRevenue(parseFloat(amount));
      
      // Check if we need to slow down marketing or promotions
      const revenueStatus = revenueManager.getRevenueStatus();
      
      res.json({
        success: true,
        withinLimits,
        dailyPercentage: revenueManager.getDailyPercentage(),
        monthlyPercentage: revenueManager.getMonthlyPercentage(),
        revenueStatus: revenueStatus.status,
        shouldAdjustMarketing: revenueStatus.adSpendMultiplier < 1.0,
        shouldShowPromotions: revenueStatus.shouldOfferPromotions
      });
    } catch (error) {
      console.error("Error recording order revenue:", error);
      res.status(500).json({ error: "Failed to record order revenue" });
    }
  });
}