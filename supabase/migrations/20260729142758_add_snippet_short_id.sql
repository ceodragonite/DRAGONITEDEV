/*
# Add short_id column to snippets table

1. Modified Tables
   - `snippets`: Add `short_id` column (text, unique) for short shareable link IDs.
   - The short_id is a 6-character alphanumeric string generated client-side on insert.

2. Security
   - No RLS policy changes needed (existing policies already cover the new column).
   - The short_id is queryable by anyone who can already SELECT the snippet.

3. Important Notes
   - short_id is nullable for backwards compatibility with existing rows.
   - Frontend generates short_id on insert using a random 6-char base62 string.
   - Unique constraint prevents collisions; frontend retries on conflict.
   - Index on short_id for fast lookups via /s/{shortId} route.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'snippets' AND column_name = 'short_id'
  ) THEN
    ALTER TABLE snippets ADD COLUMN short_id text;
  END IF;
END $$;

-- Backfill existing rows with random short_ids
UPDATE snippets
SET short_id = substring(md5(random()::text || id::text) from 1 for 8)
WHERE short_id IS NULL;

-- Add unique constraint (drop first for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'snippets_short_id_key'
  ) THEN
    ALTER TABLE snippets ADD CONSTRAINT snippets_short_id_key UNIQUE (short_id);
  END IF;
END $$;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_snippets_short_id ON snippets(short_id);
