SET GLOBAL local_infile = 'ON';

CREATE DATABASE IF NOT EXISTS munch;

use munch;

-- ---
-- Table 'images'
--
-- ---

DROP TABLE IF EXISTS images;

CREATE TABLE images (
  id INTEGER NOT NULL AUTO_INCREMENT,
  imageURL VARCHAR(255) NOT NULL,
  caption VARCHAR(255) NULL DEFAULT NULL,
  date VARCHAR(255) NULL,
  userID INTEGER NOT NULL,
  businessID INTEGER NOT NULL,
  helpfulScore INTEGER NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table 'users'
--
-- ---

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER NOT NULL AUTO_INCREMENT,
  profileImageURL VARCHAR(255) NULL DEFAULT NULL UNIQUE,
  username VARCHAR(255) NULL DEFAULT NULL,
  friends INTEGER NULL,
  stars INT NULL,
  elite INT,
  PRIMARY KEY (id)
);

-- ---
-- Table 'votes'
--
-- ---

DROP TABLE IF EXISTS votes;

CREATE TABLE votes (
  id INTEGER NOT NULL AUTO_INCREMENT,
  userId INTEGER NOT NULL,
  imageId INTEGER NOT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Foreign Keys
-- ---

ALTER TABLE images ADD FOREIGN KEY (userID) REFERENCES users (id);

