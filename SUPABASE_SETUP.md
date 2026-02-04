# Supabase setup (after you have a Supabase account)

Do these steps in order once you’re logged in at [supabase.com](https://supabase.com).

---

## 1. Create a project

1. In the dashboard, click **New project**.
2. Choose an **organization** (or create one).
3. Set **Name** (e.g. `sphere-devotions`), **Database password** (save it somewhere safe), and **Region**.
4. Click **Create new project** and wait until the project is ready.

---

## 2. Get your API keys and URL

1. In the left sidebar, go to **Settings** (gear) → **API**.
2. Copy these three values (you’ll use them in step 3):

   | What to copy | Used for |
   |--------------|----------|
   | **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
   | **anon public** (under “Project API keys”) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **service_role** (under “Project API keys”) | `SUPABASE_SERVICE_ROLE_KEY` (seed script only) |

---

## 3. Add env vars to your app

1. In your project root, create a file named **`.env.local`** (or open it if it exists).
2. Add these lines, pasting your real values from step 2:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file.  
   **Important:** Don’t commit `.env.local` to git (it should already be in `.gitignore`). Never share your `service_role` key.

---

## 4. Run the database schema

1. In the Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open the file **`supabase/schema.sql`** in your repo and copy its **entire** contents.
4. Paste into the SQL Editor.
5. Click **Run** (or press Cmd/Ctrl + Enter).
6. Confirm you see “Success” and no red errors.

This creates the `profiles`, `spheres`, `devotions`, `user_progress` tables, RLS policies, and the trigger that creates a profile when someone signs up.

**Optional (reflection responses):** To enable saving answers to reflection questions and two-level completion (watched + reflections), run the second migration. In SQL Editor, open **`supabase/migrations/002_reflection_responses.sql`**, copy its contents, and run it. This adds the `user_devotion_responses` table and the `responses_completed_at` column on `user_progress`.

---

## 5. Seed spheres and devotions

From your project root in a terminal:

```bash
npm run seed
```

If `package.json` doesn’t have a `seed` script yet, run:

```bash
node scripts/seed-supabase.mjs
```

You should see something like: `Upserting spheres...` then `Upserting devotions...` and `Seeded 416 devotions.`

---

## 6. (Optional) Turn on Email auth

If you want sign-up with email/password:

1. In Supabase: **Authentication** → **Providers**.
2. **Email** should be enabled by default.
3. Under **Authentication** → **URL Configuration**, set **Site URL** to your app URL when you deploy (e.g. `https://yourdomain.com`). For local dev you can leave it or set `http://localhost:3000`.

For local testing, sign-up and login work without changing anything else.

---

## 7. Run the app and test

1. From the project root:

   ```bash
   npm run dev
   ```

2. In the browser:
   - Open **Get Started** (or go to `/signup`) and create an account.
   - Log in, open a devotion, watch a bit of the video — progress should save.
   - Check **Progress** / dashboard to see completed count.

If sign-up fails, check the Supabase **Authentication** → **Users** tab to see if the user was created and if any error is shown in the browser console or terminal.

---

## Quick checklist

- [ ] Supabase project created  
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`  
- [ ] `supabase/schema.sql` run in SQL Editor  
- [ ] `npm run seed` completed without errors  
- [ ] `npm run dev` — sign up, log in, and progress saving work  

That’s it. Once these are done, the app is using Supabase for auth and progress.
