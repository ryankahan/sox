# SOX Erosion Solutions — Bank Estimator

AI-powered shoreline measurement and simulation tool.

## Deploy to Vercel (3 minutes)

### 1. Install Vercel CLI
```
npm install -g vercel
```

### 2. Deploy
From inside this folder, run:
```
vercel
```
Follow the prompts — accept all defaults. Vercel will give you a live URL.

### 3. Add your Replicate API key
After deploy, go to:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add:
- Name: `REPLICATE_TOKEN`
- Value: your Replicate API token (get one at replicate.com/account/api-tokens)

Then redeploy:
```
vercel --prod
```

Your app is live. Share the URL with clients directly.

## Project structure
```
/api/replicate.js   — serverless proxy (keeps API key secret)
/public/index.html  — the full app
vercel.json         — routing config
package.json        — node config
```
 
