# Setup prompt: New landing page (Next.js + Cursor + Vercel)

Use this when creating a **new product landing page** with Next.js. Goal: edit in Cursor and share via a Vercel link (`*.vercel.app`) until you add a custom domain.

---

## Copy this into Cursor when starting the new project

```
Create a new product landing page project with:

1. Next.js (Option B – minimal Next.js)
   - Run: npx create-next-app@latest
   - Use: TypeScript, ESLint, Tailwind CSS, App Router, src/ directory. No Turbopack required.
   - Project name = the folder name (e.g. my-product-landing).

2. Cursor setup
   - .gitignore: node_modules, .env, .env.local, .vercel, .DS_Store, .idea, .vscode
   - Optional: .cursor/rules/landing-page.mdc with: "Single-page landing, Tailwind, keep it simple."

3. Landing content
   - I have a draft .html file. Put the visible content into src/app/page.tsx (convert HTML to JSX). Keep layout and global styles in src/app/layout.tsx and src/app/globals.css. Put images in public/ and use Next.js Image or <img src="/...">.

4. Deploy and share
   - Git init, commit, create GitHub repo, push.
   - Vercel → New Project → Import this repo → Deploy.
   - Share the URL: https://<project-name>.vercel.app (no custom domain needed yet).
```

---

## What gives you the shareable link

1. **Git + GitHub** – Project is a Git repo; Vercel connects to it.
2. **Vercel project** – On [vercel.com](https://vercel.com): New Project → Import your GitHub repo.
3. **Automatic URL** – Vercel gives you `https://<project-name>.vercel.app`. Every push to the main branch redeploys and updates that link.
4. **No config needed** – Vercel detects Next.js and runs `next build` / `next start`. No `vercel.json` required.

So: **GitHub repo + Vercel project linked to repo = shareable `*.vercel.app` link.**

---

## Option B: Minimal Next.js (step-by-step)

1. **Scaffold**
   ```bash
   npx create-next-app@latest
   ```
   - Project name: e.g. `my-product-landing`
   - TypeScript: Yes  
   - ESLint: Yes  
   - Tailwind CSS: Yes  
   - `src/` directory: Yes  
   - App Router: Yes  
   - Turbopack: optional (No is fine)

2. **Add Cursor basics**
   - Ensure `.gitignore` includes: `node_modules`, `.env`, `.env.local`, `.vercel`, `.DS_Store`, `.idea`, `.vscode`.
   - Optional: create `.cursor/rules/landing-page.mdc` with your preferences (e.g. single-page, Tailwind, simple).

3. **Landing content from your draft HTML**
   - Open your draft `.html` and `src/app/page.tsx`.
   - Copy the main content (hero, sections, footer) into `page.tsx`; convert tags to JSX (`class` → `className`, etc.).
   - Global styles → `src/app/globals.css`. Fonts and layout → `src/app/layout.tsx`.
   - Images: place in `public/` and reference as `/image.png` or use the Next.js `Image` component.

4. **Run locally**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and tweak until it looks right.

5. **Deploy to Vercel**
   - Commit and push to GitHub.
   - [vercel.com](https://vercel.com) → Add New → Project → Import your repo → Deploy.
   - Use the generated `https://<project-name>.vercel.app` as your shareable link.

6. **Later**
   - Add a custom domain in Vercel (Settings → Domains) when you’re ready.

---

## Scripts (from package.json)

| Script        | Use                    |
|---------------|------------------------|
| `npm run dev` | Local dev (hot reload) |
| `npm run build` | Production build      |
| `npm run start` | Run production build locally |
| `npm run lint` | Lint                  |

---

## Checklist

- [ ] Run `npx create-next-app@latest` with TypeScript, Tailwind, App Router, `src/`.
- [ ] Add or confirm `.gitignore` (see above).
- [ ] Optional: add `.cursor/rules/landing-page.mdc`.
- [ ] Move draft HTML content into `src/app/page.tsx` (as JSX) and styles into `globals.css` / `layout.tsx`.
- [ ] `git init`, commit, create GitHub repo, push.
- [ ] Vercel → New Project → Import repo → Deploy.
- [ ] Share `https://<project-name>.vercel.app`. Add custom domain later if needed.

---

## Reference: this Spheres project

- Next.js 14, App Router, TypeScript, Tailwind.
- No `vercel.json`; Vercel auto-detects Next.js.
- Live URL: `https://spheres-website.vercel.app`.
- `docs/VERCEL_DEPLOY.md` covers env vars and Supabase only (not needed for a simple landing page).
