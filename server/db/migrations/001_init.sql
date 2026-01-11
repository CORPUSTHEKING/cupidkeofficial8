DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_yesno'
  ) THEN
    CREATE TYPE enum_yesno AS ENUM ('YES', 'NO');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(user_id),
  notification_text TEXT NOT NULL,
  redirect_path TEXT,
  read enum_yesno NOT NULL DEFAULT 'NO',
  time_stamp TIMESTAMPTZ DEFAULT now()
);
