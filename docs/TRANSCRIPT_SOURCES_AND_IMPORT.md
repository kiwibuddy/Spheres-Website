# Transcript sources and getting them into the database

**Correction:** The **authoritative transcripts** are in the 8 PDFs (Foundation, Family, Economics, Government, Religion, Education, Communications, Celebration — 52 passages each). The `SphereView Videos - ENG.csv` file only contains whatever was **copied from those PDFs** into the CSV, so many rows may be empty or partial. To have full transcripts for all 416 devotions in the database, we need to either **extract from the PDFs** or **pull from YouTube** (where available). Both are possible.

---

## Option 1: Extract transcripts from the PDFs (recommended if PDFs are authoritative)

The PDFs are the curated source. We can use a **Node.js script** to extract text from each PDF and map it to the correct devotion (sphere + order 1–52), then write to `devotions-static.json` and/or Supabase.

### Is it possible?

**Yes.** Node can extract text from PDFs with libraries like:

| Library       | Notes |
|---------------|--------|
| **pdf-parse** | Simple: `getText()` returns full text. Works well for text-based PDFs (no OCR). |
| **pdf2json**  | Parses to JSON structure; good if you need per-page or positioned text. |
| **pdf.js-extract** | Mozilla pdf.js wrapper; text with coordinates. |

If the PDFs are **text-based** (you can select and copy text), no OCR is needed. If they are **scanned images**, you’d need an OCR step (e.g. Tesseract or a cloud OCR API), which is more involved.

### How it would work

1. **Map each PDF to a sphere**  
   - `Foundation 52 FINAL.pdf` → foundational (FOU), orders 1–52  
   - `Family 52 FINAL.pdf` → family (FAM), 1–52  
   - … same for Economics, Government, Religion, Education, Communications, Celebration.

2. **Extract all text** from each PDF (e.g. with `pdf-parse`).

3. **Split into 52 passages** per PDF. This depends on how the PDF is laid out. Common patterns:
   - Numbered headings: e.g. “Number 1: …”, “Number 2: …” → split on that.
   - Or match titles from `00 416 Spheres of Society Key Passages.md` (we already have title + scripture per sphere/order) and use them as anchors to split the PDF text.

4. **Merge with existing devotion data**  
   - Load `devotions-static.json` (or build from key passages MD + CSV as now).  
   - For each devotion, set `transcript` from the corresponding PDF passage.  
   - Write updated JSON and/or call Supabase to update `devotions.transcript`.

5. **Re-run seed**  
   - `node scripts/seed-supabase.mjs` (or equivalent) so the database has the new transcripts.

So: **yes, a JavaScript/Node script can extract from the PDFs and “translate” (transfer) that text into the database** — no human copy-paste needed. The only unknown is the exact layout of each PDF (one passage per page? one long flow with “Number N:”?) which we’d handle in the splitting step.

**Transcript pipeline (implemented):** See [PDF_TRANSCRIPT_LAYOUT.md](PDF_TRANSCRIPT_LAYOUT.md) for split and exclusion patterns. Run `npm run extract-transcripts`, then `npm run validate-transcripts`, then `npm run merge-transcripts`, then `npm run seed`. Or `npm run transcripts:full` then `npm run seed`.

---

## Option 2: Use YouTube auto-generated (or uploaded) transcripts

YouTube can provide **caption/transcript** data. Two ways to get it:

### A. Official YouTube Data API (captions.download)

- **Requirement:** The request must be made **as the owner of the video** (or a YouTube partner acting on their behalf). OAuth with a scope like `youtube.force-ssl` is required; a simple API key is **not** enough.
- **If you own the channel:** You can list caption tracks with `captions.list` and download with `captions.download` (formats like SRT, VTT). You’d get both manual and auto-generated captions.
- **If you don’t own the videos:** The API will return **403 Forbidden** for caption download. So we **cannot** use the official API to pull transcripts for someone else’s videos.

### B. Unofficial: fetch public captions from the video page

- For **public** videos, many tools fetch the caption track that the YouTube player uses (the same one that powers “Show transcript” on the watch page). This works **without** being the owner and **without** an API key.
- **Node:** e.g. the **`youtube-transcript`** npm package:
  - `YoutubeTranscript.fetchTranscript(videoIdOrUrl)` returns the transcript (often with timestamps).
  - You’d take each devotion’s `youtube_url`, extract the video ID, fetch transcript, concatenate the text, and store it as `transcript`.
- **Caveats:**
  - Uses YouTube’s internal/unofficial behavior; it can break if Google changes the page or endpoints.
  - You get whatever captions exist (auto-generated or manual). Auto-generated can have errors; manual may match your PDFs if the channel owner uploaded them from the same source.

So: **yes, there is a way to get transcripts from the YouTube links** — either as owner via the official API, or as anyone via an unofficial Node script for public videos. The unofficial route is viable for a one-time or occasional backfill.

---

## Recommendation

1. **Treat the PDFs as source of truth** for wording. Use **Option 1 (PDF extraction)** to:
   - Extract text from the 8 PDFs.
   - Split into 52 passages per sphere and map to devotions (using `00 416 Spheres of Society Key Passages.md` for sphere/order/title).
   - Write transcripts into your devotion data (JSON and/or Supabase).

2. **Use YouTube (Option 2B)** as a **fallback or supplement**:
   - For any devotion where the PDF has no transcript (e.g. missing page or failed extraction), run the `youtube-transcript` script for that video and fill in from YouTube.
   - Or run YouTube for all 416 and compare/merge with PDF text (e.g. prefer PDF when available, else YouTube).

3. **If you own the YouTube channel**, you can also use **Option 2A** (official API) to download captions in bulk (e.g. SRT/VTT) and then parse them into plain text for `transcript`. That’s the most “official” way to get data from YouTube.

Next step: **inspect one of the PDFs** (e.g. open “Family 52 FINAL.pdf”) and note how the 52 passages are laid out (page breaks, “Number 1:”, titles, etc.). With that, we can design the exact extraction and splitting logic for the script and then implement it.
