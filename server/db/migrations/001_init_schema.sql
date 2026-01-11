-- CupidKE canonical schema

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_yesno') THEN
    CREATE TYPE enum_yesno AS ENUM ('YES','NO');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  verified enum_yesno DEFAULT 'NO',
  last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL,
  notification_text VARCHAR(255) NOT NULL,
  redirect_path VARCHAR(255),
  read enum_yesno DEFAULT 'NO',
  time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
