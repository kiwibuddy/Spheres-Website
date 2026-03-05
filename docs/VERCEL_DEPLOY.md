# Vercel deployment

## Production URL

- **Live site:** https://spheres-website.vercel.app

## Environment variables (required for sign-up/sign-in)

If you see "Sign-up is not configured" or "Sign-in is not configured", add these in Vercel:

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project (e.g. **spheres-website**).
2. Go to **Settings** → **Environment Variables**.
3. Add (for **Production**, and optionally Preview/Development):
   - `NEXT_PUBLIC_SUPABASE_URL` — from [Supabase](https://supabase.com/dashboard) → Project Settings → API.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same place (anon public key).
   - `OPENAI_API_KEY` — required for search (if you use topic search).
4. **Redeploy:** Deployments → … on latest → **Redeploy**.

Without these, auth and search will not work on the live URL.

## Supabase auth redirect (required for login/signup on the live site)

Add the Vercel URL to Supabase so redirects work:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Under **Redirect URLs**, add:
   - `https://spheres-website.vercel.app/**`
4. Save.

After this, login and signup will redirect correctly on the deployed site.
