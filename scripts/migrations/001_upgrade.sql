-- Schema upgrades for Phase 2 (tasks) + Phase 3 (uploads/grounding) + conversation security
-- Apply once: psql $DATABASE_URL -f scripts/migrations/001_upgrade.sql

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS course_id integer;

UPDATE conversations SET user_id = 'legacy-migration' WHERE user_id IS NULL;
ALTER TABLE conversations ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS conversations_user_idx ON conversations (user_id);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS mime_type text;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'text';

CREATE TABLE IF NOT EXISTS source_chunks (
  id serial PRIMARY KEY,
  note_id integer NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  text text NOT NULL,
  embedding jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT source_chunks_note_chunk_uniq UNIQUE (note_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS source_chunks_note_idx ON source_chunks (note_id);
