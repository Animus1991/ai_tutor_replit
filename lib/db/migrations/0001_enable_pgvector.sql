-- pgvector setup for source_chunks embeddings.
-- Requires PostgreSQL 11+ and the pgvector extension.
-- On managed Postgres (Supabase, Neon, RDS): pgvector is preinstalled.
-- Local Postgres: install pgvector first (https://github.com/pgvector/pgvector#installation).

CREATE EXTENSION IF NOT EXISTS vector;

-- Convert legacy JSONB embedding column to pgvector if it exists.
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'source_chunks' AND column_name = 'embedding';

  IF col_type = 'jsonb' THEN
    ALTER TABLE source_chunks DROP COLUMN embedding;
    ALTER TABLE source_chunks ADD COLUMN embedding vector(1536);
  ELSIF col_type IS NULL THEN
    -- table doesn't exist yet; schema push will create with vector type
    NULL;
  END IF;
END
$$;

-- IVFFlat index for fast cosine similarity search (build after data exists).
CREATE INDEX IF NOT EXISTS source_chunks_embedding_idx
  ON source_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
