-- HNSW index for fast similarity search. Run AFTER backfill-embeddings.mjs completes.

create index if not exists devotions_search_embedding_idx
  on public.devotions using hnsw (search_embedding vector_cosine_ops);
