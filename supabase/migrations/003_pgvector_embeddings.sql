-- Enable pgvector for semantic search over devotion transcripts.
-- Run: apply via Supabase SQL editor or `supabase db push`

create extension if not exists vector;

alter table public.devotions
  add column if not exists search_embedding vector(1536);

-- RPC for similarity search. Call with query embedding and optional limit.
create or replace function public.match_devotions(
  query_embedding vector(1536),
  match_count int default 20
)
returns table (
  id int,
  sphere_id int,
  code text,
  title text,
  scripture_reference text,
  slug text,
  sphere_name text,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.sphere_id,
    d.code,
    d.title,
    d.scripture_reference,
    s.slug,
    s.name as sphere_name,
    1 - (d.search_embedding <=> query_embedding) as similarity
  from public.devotions d
  join public.spheres s on s.id = d.sphere_id
  where d.search_embedding is not null
  order by d.search_embedding <=> query_embedding
  limit match_count;
$$;

-- HNSW index: run migration 004_embeddings_index.sql after backfill completes.
