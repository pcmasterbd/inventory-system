---
description: How to deploy the Inventory System to Vercel
---

# Deploying to Vercel

## Prerequisites
- A GitHub account.
- A Vercel account (free tier is fine).
- Your Supabase Project URL and Anon Key.

## Steps

1.  **Push Code to GitHub**
    - Create a new repository on GitHub.
    - Run the following in your terminal:
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      git branch -M main
      git remote add origin <your-github-repo-url>
      git push -u origin main
      ```

2.  **Import to Vercel**
    - Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **"Add New..."** -> **"Project"**.
    - Select your GitHub repository.

3.  **Configure Project**
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: `./` (default).
    - **Environment Variables**:
      - Add `NEXT_PUBLIC_SUPABASE_URL`
      - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - (Copy these values from your local `.env.local` or Supabase Settings).

4.  **Deploy**
    - Click **"Deploy"**.
    - Wait for the build to finish.
    - Once complete, you will get a live URL (e.g., `inventory-system.vercel.app`).

5.  **Final Check**
    - Visit the live URL.
    - Log in with your admin credentials.
    - Verify that data loads correctly.
