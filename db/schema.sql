CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secondme_user_id VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  ai_id VARCHAR(255) NOT NULL,
  ai_name VARCHAR(255),
  ai_personality TEXT,
  experience INT DEFAULT 0,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  level_id INT NOT NULL,
  messages JSONB NOT NULL,
  total_score INT,
  grade VARCHAR(1),
  score_breakdown JSONB,
  fog_analysis JSONB,
  exp_gained INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  unlocked_levels INT[] DEFAULT ARRAY[1],
  level_best_scores JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);
