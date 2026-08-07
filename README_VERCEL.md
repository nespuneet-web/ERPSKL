# Deploying School ERP to Vercel (vercel.app)

Follow these simple steps to deploy your School ERP application live on **vercel.app**:

---

## Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub / GitLab / Bitbucket**.
2. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
3. Import your School ERP repository.
4. **Build & Development Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   Add your Supabase credentials (optional if connecting to live database):
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
6. Click **Deploy**. Vercel will build and provide your live URL (e.g. `https://school-erp.vercel.app`).

---

## Method 2: Deploy via Vercel CLI (Command Line)

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Run the deployment command in the project root:
   ```bash
   vercel
   ```
3. Follow the quick prompts. For production deployment:
   ```bash
   vercel --prod
   ```

---

## Included Configuration (`vercel.json`)
The included `vercel.json` ensures that single-page client routing (SPA) works smoothly without 404 errors on refresh:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
