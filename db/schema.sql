-- Emotional Mist Breaker schema (Supabase / PostgreSQL)
-- This script is idempotent and safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secondme_user_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  ai_id VARCHAR(255) NOT NULL,
  ai_name VARCHAR(255) NOT NULL,
  ai_personality TEXT NOT NULL DEFAULT '',
  ai_avatar TEXT NOT NULL DEFAULT '',
  experience INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  unlocked_levels INT[] NOT NULL DEFAULT ARRAY[1],
  level_best_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id INT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_round INT NOT NULL DEFAULT 0,
  max_rounds INT NOT NULL DEFAULT 3,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  total_score INT,
  grade VARCHAR(1),
  score_breakdown JSONB,
  fog_analysis JSONB,
  exp_gained INT,
  key_moments JSONB,
  learning_sheet JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compatibility upgrades for early schema versions
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_avatar TEXT NOT NULL DEFAULT '';
ALTER TABLE users ALTER COLUMN ai_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN ai_personality SET DEFAULT '';

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS current_round INT NOT NULL DEFAULT 0;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS max_rounds INT NOT NULL DEFAULT 3;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS key_moments JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS learning_sheet JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'conversations_status_check'
  ) THEN
    ALTER TABLE conversations
      ADD CONSTRAINT conversations_status_check
      CHECK (status IN ('active', 'completed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_secondme_user_id ON users(secondme_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_created_at ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_status ON conversations(user_id, status);
