-- Create the database
CREATE DATABASE cheesepics;
USE cheesepics;

-- Create the login table
CREATE TABLE `login` (
    `username` TEXT NOT NULL,
    `password` CHAR(128) NOT NULL,
    `salt` TEXT NOT NULL,
    `liked` TEXT DEFAULT NULL,
    `pfp` CHAR(68) DEFAULT NULL, -- 64 for sha256 hash + 4 for extension
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the images table
CREATE TABLE `images` (
    `ID`	    CHAR(36), -- 32 for the hex UUID + 4 for .jpg
	`license`	TEXT,
	`author`	TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;