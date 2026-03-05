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

## Security

- Never commit `.env.local` (it is in `.gitignore`)
- If your API key was exposed, rotate it at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
