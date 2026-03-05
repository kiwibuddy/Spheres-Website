# Topic Search Setup

Semantic search over 416 devotion transcripts using OpenAI embeddings and pgvector.

## Prerequisites

- Supabase project with migrations applied (`003_pgvector_embeddings.sql`, `004_embeddings_index.sql`)
- OpenAI API key in `.env.local` as `OPENAI_API_KEY`

## Cost Control

### Set a $5 monthly limit (recommended)

1. Go to [platform.openai.com/settings/organization/billing/limits](https://platform.openai.com/settings/organization/billing/limits)
2. Set **Hard limit** to $5 (or your preferred amount)
3. Add a payment method if required

### Approximate costs

| Operation | Tokens | Cost |
|-----------|--------|------|
| One-time backfill (416 devotions) | ~400k | ~$0.01 |
| Per search query | ~20 | ~$0.0000004 |
| 1,000 searches | ~20k | ~$0.0004 |

At $0.02 per 1M tokens, $5 covers millions of searches. The backfill is a one-time ~$0.01.

### In-app rate limiting

The search API limits each IP to **30 requests per minute** to prevent abuse. This is plenty for normal use.

## Steps

1. **Apply pgvector migrations** (if not done). Choose one:

   - **Option A – Script (needs DB URL):**  
     Add your database connection string to `.env.local`:
     ```
     SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@...
     ```
     Get it from: **Supabase Dashboard → Project Settings → Database → Connection string (URI)**.  
     Then run:
     ```bash
     npm run db:migrate-pgvector
     ```

   - **Option B – Supabase SQL Editor:**  
     In the dashboard, open **SQL Editor**, then run the contents of:
     - `supabase/migrations/003_pgvector_embeddings.sql`
     - `supabase/migrations/004_embeddings_index.sql` (run after backfill if you prefer)

2. **Backfill embeddings**:
   ```bash
   npm run backfill-embeddings
   ```

3. **Run the app** and use Search on the home page (above “Foundational Worldview + 7 Spheres”).

## Production (Vercel) checklist

Search uses **OpenAI embeddings** and **Supabase pgvector**; it does not use Algolia or Typesense. On the live site, "No key passages found" or "Search unavailable" usually means one of the following.

### 1. `OPENAI_API_KEY` not set on Vercel

The API returns **503** with message *"Search not configured (OPENAI_API_KEY missing)"*. The app now shows this in the search area.

- In **Vercel** → your project → **Settings** → **Environment Variables**
- Add `OPENAI_API_KEY` with your OpenAI API key (same as in `.env.local`)
- Redeploy so the new variable is applied

### 2. Embeddings not backfilled in production

The search RPC only returns devotions that have a non-null `search_embedding`. If the production database was never backfilled, every search returns 0 rows and you see *"No key passages found"*.

**Fix:** Run the backfill against the **production** Supabase project:

1. Use env vars that point at production: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (and `OPENAI_API_KEY`) for production.
2. Run once: `npm run backfill-embeddings`

You can do this from your machine with a `.env.production.local` (or a one-off script that loads production env), or run the script in a CI step that has production credentials. The backfill is one-time and costs about $0.01 in OpenAI usage.

### 3. OpenAI quota or billing

If you hit rate limits or run out of credits, the API returns **500** and the app shows *"Search failed"* or *"Search failed. Please try again."*

- Check [platform.openai.com/account/usage](https://platform.openai.com/account/usage) and [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
- Embedding costs are very low (~$0.02 per 1M tokens); a $5 monthly cap is usually enough for thousands of searches

### 4. "Sign in to search" (401)

If the API returns **401**, the server could not read the user session (e.g. cookies not sent or wrong domain). The app now surfaces *"Sign in to search"* from the API. Ensure Supabase auth and cookie settings are correct for your production domain.

---

## Security

- Never commit `.env.local` (it is in `.gitignore`)
- If your API key was exposed, rotate it at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
