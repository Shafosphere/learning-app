CREATE TABLE word (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL
);
CREATE TABLE translation (
  id SERIAL PRIMARY KEY,
  word_id INT NOT NULL,
  language VARCHAR(2) NOT NULL, -- 'en' for English, 'pl' for Polish
  translation VARCHAR(100) NOT NULL,
  description VARCHAR(100) NOT NULL,
  FOREIGN KEY (word_id) REFERENCES Word(id)
);
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data utworzenia konta
  last_login TIMESTAMP                             -- Data ostatniego logowania
);
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  report_type VARCHAR(20) NOT NULL, -- 'normal' or 'word_issue'
  word_id INT, -- This will be NULL for 'normal' reports
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (word_id) REFERENCES Word(id) -- Only relevant for 'word_issue' reports
);
CREATE TABLE word_patches (
  patch_id SERIAL PRIMARY KEY,  -- SERIAL automatycznie inkrementuje wartość
  word_ids JSON                 -- Możesz użyć również JSONB dla lepszej wydajności
);
-- CREATE TABLE user_activity_log (
--     id SERIAL PRIMARY KEY,
--     user_id INT NOT NULL,
--     activity_type VARCHAR(50) NOT NULL,
--     activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );3