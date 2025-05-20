# Taylor Made Performance UTV Parts
## AI-Driven Dropshipping Business

This dropshipping business sells aftermarket parts for UTVs (Utility Task Vehicles) like Polaris, Can-Am, Honda, and Yamaha. The entire business is fully automated with AI to maximize profits while requiring minimal human intervention.

## Key Features

1. **100% Free Tier Compatible**: Entire system is optimized to run on free hosting tiers with no paid upgrades required.

2. **Real Supplier Integration**: Database of 10 real UTV parts suppliers with dropshipping programs, including SuperATV, Pro Armor, High Lifter, and more.

3. **AI-Driven Sales Optimization**: Intelligent system for customer segmentation, product recommendations, and dynamic pricing.

4. **Click Funneling System**: Advanced sales funnel with upsells, cross-sells, and cart abandonment recovery.

5. **Stripe Payment Processing**: Complete payment system with subscription options and webhook handling.

6. **Memory-Efficient Design**: Optimized for free tier hosting limitations with minimal resource usage.

7. **Comprehensive Analytics**: Track customer behavior and sales performance without expensive third-party tools.

8. **Offline Fallbacks**: Continues functioning even when API limits are reached.

## System Architecture

The application is built with:

- React/TypeScript frontend
- Node.js/Express backend
- Stripe payment processing
- OpenAI for customer segmentation and recommendations
- In-memory database with efficient caching

## AI Worker Bots

The system includes multiple AI "worker bots" that automate business operations:

1. **Customer Segmentation Bot**: Analyzes browsing patterns to categorize customers into segments for personalized experiences.

2. **Product Recommendation Bot**: Suggests related products based on viewing history and purchase patterns.

3. **Dynamic Pricing Bot**: Adjusts prices based on customer segment, inventory levels, and market demand.

4. **Upsell & Cross-sell Bot**: Identifies opportunities to increase average order value.

5. **Inventory Management Bot**: Tracks product availability across suppliers.

6. **Margin Optimization Bot**: Ensures profit margins stay within target range (15-50%).

## Free Tier Optimization

This business is specifically designed to operate within free tier hosting constraints:

1. **Memory-Efficient Storage**: In-memory data storage with intelligent pruning to prevent memory leaks.

2. **API Call Minimization**: Caching layer reduces OpenAI API calls to stay within free limits.

3. **Browser-Side Processing**: Heavy computation offloaded to client browsers when possible.

4. **Asynchronous Processing**: Non-critical tasks are handled asynchronously to avoid resource spikes.

5. **Graceful Fallbacks**: Rule-based recommendations when AI API limits are reached.

## Profit Maximization Strategies

1. **Customer Segmentation**: Different pricing strategies for different customer types.

2. **Dynamic Pricing**: Adjusts product prices based on demand, competition, and customer behavior.

3. **Psychological Pricing**: All prices end in .99 for optimal conversion.

4. **Upsell Automation**: AI identifies optimal upsell products at checkout.

5. **Abandoned Cart Recovery**: Automatically identifies and addresses abandoned carts.

6. **Revenue Limits**: System enforces $500,000 monthly revenue cap to prevent scaling beyond desired limits.

## Getting Started

See CHROMEBOOK_DEPLOYMENT.md for detailed instructions on deploying from a Chromebook.

1. Create accounts with:
   - Replit or Render (free tier hosting)
   - Stripe (for payment processing)
   - OpenAI (for AI recommendations)

2. Set up environment variables:
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - VITE_STRIPE_PUBLIC_KEY

3. Deploy the application using the instructions in CHROMEBOOK_DEPLOYMENT.md

4. Visit your deployed site and verify everything is working

5. Set up scheduled UptimeRobot pings to prevent your free tier from sleeping

## Maintaining Your Business

This business requires minimal maintenance:

1. Monitor supplier relationships and update supplier data as needed
2. Review AI recommendations occasionally to ensure quality
3. Adjust profit margin targets if necessary
4. Monitor Stripe payment processing for any issues

For full deployment details, see CHROMEBOOK_DEPLOYMENT.md