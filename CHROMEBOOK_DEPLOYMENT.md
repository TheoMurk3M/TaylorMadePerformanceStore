# Chromebook Deployment Guide
## Taylor Made Performance UTV Parts

This guide provides step-by-step instructions for deploying your UTV parts dropshipping business directly from a Chromebook with zero technical knowledge required.

## Option 1: Deploy Using Replit (Recommended)

Replit is the easiest platform to deploy from a Chromebook, with generous free tier limits.

### Step 1: Create a Replit Account
1. Open your Chrome browser
2. Go to [Replit.com](https://replit.com)
3. Sign up for a free account (email verification required)

### Step 2: Import the Project
1. Once logged in, click "Create Repl" button
2. Select "Import from GitHub" tab
3. Paste your GitHub repository URL 
   - If you don't have the repository on GitHub yet, select "Node.js" template and upload all files manually using the file upload feature

### Step 3: Configure Environment Variables
1. In your Repl, look for the lock icon (🔒) in the left sidebar
2. Click it to open the "Secrets" panel
3. Add the following secrets:
   - Key: `OPENAI_API_KEY`, Value: your OpenAI API key
   - Key: `STRIPE_SECRET_KEY`, Value: your Stripe secret key
   - Key: `VITE_STRIPE_PUBLIC_KEY`, Value: your Stripe public key

### Step 4: Run the Project
1. Click the "Run" button (green play button)
2. Wait for the project to build and start
3. Your website will be live at a URL like: `https://your-project-name.yourusername.repl.co`

### Step 5: Keep Your Site Running 24/7
1. Visit [UptimeRobot](https://uptimerobot.com) and create a free account
2. Add a new "HTTP(s)" monitor
3. Enter your Replit URL
4. Set check interval to 5 minutes
5. This will prevent your Repl from sleeping due to inactivity

## Option 2: Deploy Using Render

### Step 1: Prepare Your Project
1. Make sure your project is in a GitHub repository
   - If needed, create a free GitHub account first

### Step 2: Create a Render Account
1. Go to [Render.com](https://render.com)
2. Sign up for a free account

### Step 3: Deploy the Backend
1. From your Render dashboard, click "New" and select "Web Service"
2. Connect to your GitHub repository
3. Configure the service:
   - Name: `utv-parts-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm run start`
   - Add environment variables (same as above)

### Step 4: Deploy the Frontend
1. Click "New" again and select "Static Site"
2. Connect to the same GitHub repository
3. Configure:
   - Name: `utv-parts-frontend`
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

### Step 5: Connect Frontend to Backend
1. In the frontend settings, add an environment variable:
   - Key: `VITE_API_URL`
   - Value: Your backend service URL (from Step 3)

## Keeping Your Business Running on Free Tier

To ensure your business runs smoothly on free hosting tiers:

1. **Enable Browser Caching**: The application is configured to cache product data and user preferences in the browser, reducing server load.

2. **Optimize Images**: Compress product images before uploading them.

3. **Batch Process Orders**: Free tiers have CPU/memory limits, so the system processes orders in batches rather than real-time.

4. **AI Efficiency**: The AI recommendation system uses caching and fallbacks to minimize API calls and ensure recommendations work even when API limits are reached.

5. **Add Keep-Alive Pinging**: Use UptimeRobot or a similar service to keep your free tier applications from sleeping.

## Troubleshooting

### If Your Site Goes to Sleep
- Free tiers on Replit and Render automatically "sleep" applications after periods of inactivity
- Use a service like UptimeRobot to ping your site every 5 minutes to keep it awake
- If you notice delays, your site was likely sleeping and is spinning back up (30-second delay)

### If Your AI Features Stop Working
- You may have reached your free tier API limits with OpenAI
- The application will automatically fall back to rule-based recommendations
- Wait 24 hours for API limits to reset, or upgrade your OpenAI plan

### Memory Issues
- If you see "out of memory" errors, try clearing browser cache and cookies
- The application uses efficient memory management, but free tiers have strict limits

## Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Make sure your API keys are correctly set
3. Verify your environment variables are properly configured

Remember, this UTV parts dropshipping business is specifically optimized to run on free hosting tiers without any paid upgrades required!