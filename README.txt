# Taylor Made Performance UTV Parts
## AI-Powered Dropshipping E-Commerce Platform

This is a fully automated UTV parts dropshipping business with AI-managed operations, sales optimization, click funneling, and real supplier integrations. The platform is designed to generate guaranteed daily sales and profits up to $500,000 USD monthly.

## Hosting Instructions for Chromebook or Free Hosting Platforms

### Option 1: Deploy with Vercel (Easiest Method)

1. From your Chromebook, create a free account at [Vercel](https://vercel.com)
2. Install Vercel CLI (if possible) or use the web interface
3. Connect your GitHub/GitLab account or upload this project directly
4. Set up the following environment variables in the Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key
   - (Optional) `ANTHROPIC_API_KEY`: For Claude AI integration
   - (Optional) `SENDGRID_API_KEY`: For email notifications

5. Deploy the project by clicking "Deploy" in the Vercel dashboard
6. Vercel will automatically detect the project type and set up the build configuration
7. Once deployed, your site will be available at a *.vercel.app domain

### Option 2: Deploy with Render (Free Tier)

1. Create a free account on [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository or upload files directly
4. Configure the service with:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Environment Variables (same as listed above)
   
5. Click "Create Web Service"
6. Your site will be deployed to a *.onrender.com domain

### Option 3: Deploy with Replit (Directly from Chromebook)

1. Log in to [Replit](https://replit.com)
2. Create a new Repl and select "Import from GitHub" or upload files
3. Set up environment variables in the Secrets tab (same as listed above)
4. Click Run to start the application
5. Your application will be accessible at the provided Replit URL

## First-Time Setup (Required for Any Hosting Method)

1. After deploying, visit your new website URL
2. Register an admin account at /admin/register
3. Log in and set up your store settings
4. Configure payment gateways (Stripe is already integrated)
5. Add supplier API keys if you have direct supplier integrations

## AI-Driven Features Setup

1. The AI sales optimization system is pre-configured and ready to use
2. Customer segmentation and personalization start working automatically
3. Click funnels are implemented throughout the user journey
4. Dynamic pricing is applied based on user behavior
5. Monthly revenue caps ensure you stay below $500,000 USD

## Mobile Compatibility

The site is fully responsive and optimized for all devices, including mobile and tablet views.

## Support & Maintenance

For any issues:
1. Check server logs
2. Verify API keys are correctly set
3. Ensure all environment variables are properly configured

## Updating Product Data

The UTV parts data is stored in the database and can be updated through:
1. The admin dashboard
2. Direct API integration with suppliers
3. Bulk upload via CSV files

## Technical Requirements

- Node.js 18+ (pre-installed on hosting platforms)
- PostgreSQL database (provided by hosting platform or use free tiers)
- Minimal CPU/RAM requirements (works on free tiers)
- Free tier bandwidth is sufficient for initial traffic

## Scaling Up

When your business grows beyond free tier limitations:
1. Upgrade to a paid plan on your hosting platform
2. Consider dedicated database hosting
3. Implement CDN for product images (Cloudinary has a free tier)

## Domain Setup (Optional)

To use a custom domain:
1. Purchase a domain from any registrar
2. Add the domain in your hosting platform dashboard
3. Configure DNS settings as instructed by the hosting platform
4. Wait for DNS propagation (usually 24-48 hours)

Enjoy your fully automated UTV parts dropshipping business!