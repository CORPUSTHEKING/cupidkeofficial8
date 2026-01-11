-- Telegram identity binding (authoritative)

CREATE TABLE IF NOT EXISTS telegram_users (
  id SERIAL PRIMARY KEY,

  user_id INTEGER NOT NULL UNIQUE
    REFERENCES users(id) ON DELETE CASCADE,

  telegram_id BIGINT NOT NULL UNIQUE,

  username TEXT,
  first_name TEXT,
  last_name TEXT,
  photo_url TEXT,

  auth_date BIGINT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup during auth
CREATE INDEX IF NOT EXISTS telegram_users_telegram_id_idx
  ON telegram_users (telegram_id);
