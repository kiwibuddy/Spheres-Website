# Topic & Concept Search for 416 Key Passages — 3 Approaches

You want users to search by **topic** and see **key passages** that speak to that topic, using more than plain keyword match—**context or concept search**. All 416 devotions can use their **transcripts** (where available) as the searchable content. This doc recommends three ways to build that in the app and how “concept-like” each is.

---

## Current state

- **Database:** Supabase (PostgreSQL). `devotions` has `title`, `scripture_reference`, `transcript`, sphere, etc.
- **Transcripts:** Stored in `devotions.transcript`; populated from `SphereView Videos - ENG.csv` via `scripts/generate-devotions.mjs`. Some devotions have transcripts, others are `null` until more data is added.
- **PDFs:** The 8 “52 FINAL” PDFs (Foundation, Family, Economics, Government, Religion, Education, Communications, Celebration) are reference; they could be used later to derive topic lists or categories, but the **primary searchable content is transcript + title + scripture_reference** in the DB.

---

## Approach 1: **Topics table + PostgreSQL full-text search (hybrid)**

**Idea:** Add a **tagging layer** (topics) and use **PostgreSQL full-text search (FTS)** on title, scripture reference, and transcript.

- **Topics:** New table `topics` (id, name, slug, optional description) and `devotion_topics` (devotion_id, topic_id). You curate a list of topics (e.g. “God as Father”, “Marriage”, “Justice”) and assign them to devotions (manually, or with a script that matches keywords in transcript/title).
- **Full-text search:** Add a generated column (or trigger) that builds a `tsvector` from `title`, `scripture_reference`, and `transcript`. Search uses `to_tsquery()` so users can type “father family” and get passages containing those words (with stemming: “father” matches “fathers”, “fatherhood”).
- **Concept behavior:** **Medium.** Topics are explicit concepts; FTS gives word-stem and phrase search, not true “meaning”. You can improve “concept” feel by:
  - Defining topics that group related ideas.
  - Optionally using a **thesaurus** (e.g. “father” → “fatherhood, fatherless, paternal”) so one query expands to related terms.

**Pros:** No new services; everything stays in Supabase; simple to reason about; good for “browse by topic” + “search within transcript”.  
**Cons:** Concept search is limited to stems + synonyms; topic list needs curation and tagging (one-time or ongoing).

**Best for:** Strong taxonomy + “search by topic” with reliable keyword/stem search inside transcripts.

---

## Approach 2: **Semantic search with embeddings (pgvector)**

**Idea:** Turn each devotion (e.g. `title + transcript`) into a **vector embedding**, store it in Postgres with **pgvector**, and do **similarity search** on the query’s embedding.

- **Flow:** For each devotion, concatenate `title` and `transcript` (or title only when transcript is null), run through an **embedding model**, store the vector in a column (e.g. `devotions.search_embedding vector(1536)` for OpenAI, or 384 for smaller models). At search time, embed the user’s query and run a pgvector similarity search (e.g. cosine or inner product); return ranked devotions.
- **Concept behavior:** **High.** “God as father” can retrieve passages about fatherhood, fatherless, God’s care, etc., even without those exact words—because the model encodes meaning.
- **Embedding options:**
  - **OpenAI Embeddings** (e.g. `text-embedding-3-small`): Good quality; pay per token; run once to backfill, then only for new/updated devotions.
  - **Self-hosted / one-time script:** e.g. **sentence-transformers** (e.g. `all-MiniLM-L6-v2`) in a Node or Python script; generate embeddings for all 416, write to CSV/JSON, then seed Supabase. No ongoing API cost; quality slightly lower than OpenAI but often sufficient for 416 passages.
  - **Supabase Edge Function + embedding API:** Optional: expose an “embed this text” endpoint used by an admin flow when adding/editing devotions.

**Pros:** Real concept/semantic search; fits existing Supabase stack (pgvector); no extra product to learn if you stay in Postgres.  
**Cons:** Need to backfill embeddings (and handle null transcripts); if using an API, small ongoing cost or rate limits; vector index and storage.

**Best for:** “Search by concept” as the main experience, with minimal manual tagging.

---

## Approach 3: **External search (Algolia or Typesense) with synonyms + optional vectors**

**Idea:** Index devotions in **Algolia** or **Typesense** (your rules already mention both). Use **synonyms** (and optionally typo tolerance) to broaden queries; optionally add **vector search** later for concept-like behavior.

- **Index:** One record per devotion: title, scripture_reference, transcript (or a truncated version if length-limited), sphere id/name, devotion id, url.
- **Concept behavior:** **Medium to high.**  
  - **Without vectors:** Configure synonyms (e.g. “father” → “fatherhood, fatherless, paternal”) so one word expands to related terms; good “concept-like” coverage.  
  - **With vectors:** Algolia and Typesense both support vector search; you can add an embedding field and blend keyword + vector ranking for a stronger concept search.
- **UX:** Instant search, highlighting, facets (e.g. filter by sphere), which fits a “topic → key passages” explorer.

**Pros:** Great search UX out of the box; synonyms give a lot of concept expansion without ML; optional vector layer.  
**Cons:** External service (cost, dependency); you still need to sync devotions to the engine (e.g. on seed or via webhook when content changes).

**Best for:** Polished, instant search and “browse by topic” with strong control over synonyms and facets; can add semantics later.

---

## Comparison summary

| Criteria              | Approach 1: Tags + FTS   | Approach 2: Embeddings (pgvector) | Approach 3: Algolia/Typesense   |
|----------------------|---------------------------|-----------------------------------|----------------------------------|
| **Concept search**   | Medium (stems + synonyms) | High (semantic similarity)        | Medium–High (synonyms ± vectors) |
| **New services**     | None                      | None (or optional embedding API)  | Algolia or Typesense             |
| **Ongoing cost**     | None                      | Low (if API) or none (self-host)  | Subscription / usage             |
| **Curation**         | Topic list + tagging      | Optional (no tags required)       | Optional; synonym list           |
| **Transcript-heavy** | Yes (FTS on transcript)   | Yes (embed title + transcript)   | Yes (index transcript)           |
| **Fits current stack** | Yes (Supabase only)     | Yes (Supabase + pgvector)         | Yes (already in rules)            |

---

## Recommendation summary

- **Approach 1** — Best if you want to keep everything in Supabase, are happy to define and assign topics, and want predictable keyword/stem + topic filtering.
- **Approach 2** — Best if “concept search” is the priority and you’re fine with a one-time (or occasional) embedding backfill and optional small API cost.
- **Approach 3** — Best if you want the fastest path to a polished, instant search UI and are okay with an external search service; synonyms get you most of the way to “concept” and you can add vectors later.

Once you pick one (or a combination, e.g. 1 + 2: tags for browsing, embeddings for search), the next step is a **concrete build plan** (schema changes, scripts, API routes, and UI) and then implementation. The 8 PDFs can be used to derive an initial topic list (Approach 1) or left for later enrichment.
