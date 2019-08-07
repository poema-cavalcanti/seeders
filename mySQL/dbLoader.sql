SET GLOBAL local_infile = 'ON';

CREATE DATABASE IF NOT EXISTS munch;
use munch;


-- ---
-- Table 'votes'
--
---- ---
DROP TABLE IF EXISTS votes;
CREATE TABLE votes (
  id INTEGER NOT NULL AUTO_INCREMENT,
  value INTEGER NULL,
  userId INTEGER NOT NULL,
  imageId INTEGER NOT NULL,
  PRIMARY KEY (id)
);


-- ---
-- Table 'images'
--
-- ---
DROP TABLE IF EXISTS images;
CREATE TABLE images (
  id INTEGER NOT NULL AUTO_INCREMENT,
  imageURL VARCHAR(255) NOT NULL,
  caption TEXT NULL DEFAULT NULL,
  date VARCHAR(255) NULL,
  businessID INTEGER NOT NULL,
  helpfulScore INTEGER NULL,
  userID INTEGER NOT NULL,
  PRIMARY KEY (id)
);


-- ---
-- Table 'users'
--
-- ---
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER NOT NULL AUTO_INCREMENT,
  profileImageURL VARCHAR(255) NULL DEFAULT NULL,
  username VARCHAR(255) NULL DEFAULT NULL,
  friends INTEGER NULL,
  stars INT NULL,
  elite BOOLEAN NOT NULL,
  PRIMARY KEY (id)
);


-- ---
-- Foreign Keys and Indexes
-- ---
ALTER TABLE images ADD FOREIGN KEY (userID) REFERENCES users (id);
ALTER TABLE votes ADD FOREIGN KEY (userID) REFERENCES users (id);
ALTER TABLE votes ADD FOREIGN KEY (imageID) REFERENCES images (id);

ALTER TABLE images ADD INDEX (businessID);
ALTER TABLE images ADD INDEX (userID);
ALTER TABLE votes ADD INDEX (imageID);


-- ---
-- Load Data from files
-- ---
LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/usersTable.csv'
    INTO TABLE users
    FIELDS TERMINATED BY ','
    LINES TERMINATED BY '\n';
LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/imagesTable.csv'
    INTO TABLE images
    FIELDS TERMINATED BY ','
    OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n';
LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/votesTable.csv'
    INTO TABLE votes
    FIELDS TERMINATED BY ','
    LINES TERMINATED BY '\n';


-- ---
-- Tables Optimization
-- ---
OPTIMIZE TABLE images, votes, users;
