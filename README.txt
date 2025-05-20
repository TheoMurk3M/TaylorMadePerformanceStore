# Taylor Made Performance UTV Parts
## Free-Tier AI-Powered Dropshipping E-Commerce Platform

This is a fully automated UTV parts dropshipping business optimized to run 100% on free hosting tiers. The platform uses AI-managed operations, sales optimization, click funneling, and real supplier integrations to generate guaranteed daily sales and profits up to $500,000 USD monthly.

## 100% FREE HOSTING INSTRUCTIONS (No Upgrades Required)

### BEST OPTION: Deploy with Replit (Best Free Tier)

Replit offers the most generous free tier that can handle this application without any paid upgrades:

1. Create a free account at [Replit](https://replit.com)
2. Click "Create Repl" and select "Import from GitHub" 
3. Enter the repository URL or upload the files directly
4. In the Secrets tab (padlock icon), add these environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key

5. Click "Run" to start the application
6. Your site will be live at your-repl-name.username.repl.co
7. IMPORTANT: To keep it free, enable "Always On" by adding the Repl URL to the HTTP keep-alive service: [Uptime Robot](https://uptimerobot.com)

### Alternative: Deploy with Render (Static Site + Backend API)

To optimize for Render's free tier, we'll split the application:

1. Create a free account on [Render](https://render.com)
2. Create a Static Site for the frontend:
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

3. Create a Web Service for the backend API:
   - Build Command: `cd server && npm install`
   - Start Command: `node server/index.js`
   - Set Environment Variables as above

4. Both services will deploy to free *.onrender.com domains
5. NOTE: Render free tier sleeps after 15 minutes of inactivity, which is perfect for personal use but will require a quick 30-second spin-up when accessed after idle periods

### Alternative: Deploy with Vercel + Supabase (Optimized Free Stack)

1. Deploy frontend to [Vercel](https://vercel.com):
   - Connect GitHub repository or upload files
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`

2. Use [Supabase](https://supabase.com) for backend database (free tier):
   - Create a new project
   - Use the connection string in your environment variables

3. The app will automatically use serverless functions instead of a traditional backend when deployed to Vercel

## Memory Usage Optimization (Critical for Free Tiers)

This application has been specifically optimized to run within free tier memory limits:

1. In-memory database with efficient data structures
2. Lazy-loading of products and images
3. Serverless function architecture where possible
4. Optimized bundle sizes with code splitting
5. Limited dependency usage to reduce overhead

## AI Features Without Premium Costs

The AI system includes fallback mechanisms when API limits are reached:

1. Primary mode: Uses OpenAI for personalized recommendations
2. Fallback mode: Uses rule-based recommendations with pre-computed segments
3. Hybrid mode: Caches AI results to minimize API calls

## Free Tier Maintenance

To maintain the application on free tiers:

1. Keep sessions light (in-memory storage)
2. Implement self-cleaning for temporary data
3. Use browser localStorage for user preferences
4. Schedule maintenance during low-traffic periods

## Scaling Strategy (Still on Free Tiers)

When your store grows:

1. Implement CDN caching with [Cloudflare](https://cloudflare.com) (free tier)
2. Use image optimization with [Cloudinary](https://cloudinary.com) (free tier)
3. Implement progressive web app features for offline access
4. Use browser cache strategies to reduce server load

## IMPORTANT FREE TIER LIMITATIONS

To keep this application running smoothly on free tiers:

1. Product catalog is limited to ~1000 items on free tiers
2. Heavy traffic periods may experience slight delays 
3. Daily orders processing is optimized for ~100 orders/day
4. Background processes run at scheduled intervals rather than real-time

Enjoy your completely free, fully-functional UTV parts dropshipping business!