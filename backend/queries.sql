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
  patch_id SERIAL PRIMARY KEY,  
  word_ids JSON                
);

ALTER TABLE word ADD COLUMN level VARCHAR(2) NOT NULL DEFAULT 'B2';
UPDATE word SET level = 'C1' WHERE id >= '3265';

-- new patch system
CREATE TABLE b2_patches(
  patch_id SERIAL PRIMARY KEY,  
  word_ids JSON    
);
CREATE TABLE c1_patches(
  patch_id SERIAL PRIMARY KEY,  
  word_ids JSON    
);
CREATE TABLE page_visit_stats (
  id SERIAL PRIMARY KEY,
  page_name VARCHAR(100) NOT NULL,
  stat_date DATE NOT NULL,
  visit_count INT NOT NULL DEFAULT 0,
  UNIQUE (page_name, stat_date)
);
CREATE TABLE user_activity_stats (
  id SERIAL PRIMARY KEY,
  activity_date DATE NOT NULL,
  activity_type VARCHAR(50) NOT NULL,  -- 'registration' lub 'login'
  activity_count INT NOT NULL DEFAULT 0,
  UNIQUE (activity_date, activity_type)
);
CREATE TABLE user_word_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  word_id INT NOT NULL,
  learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (word_id) REFERENCES word(id)
);
CREATE TABLE ranking (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  weekly_points INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE UNIQUE INDEX idx_user_word_unique ON user_word_progress (user_id, word_id);


ALTER TABLE ranking
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

CREATE TABLE ranking (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  weekly_points INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE users ADD COLUMN avatar INT NOT NULL DEFAULT 1;
ALTER TABLE ranking ADD COLUMN ban BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE user_autosave (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE, -- Dodaj UNIQUE CONSTRAINT tutaj
  level VARCHAR(2) NOT NULL,
  words JSONB NOT NULL,
  device_identifier VARCHAR(255),
  last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);