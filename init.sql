-- Create the database
CREATE DATABASE cheesepics;

-- Create the login table
USE cheesepics;
CREATE TABLE `login` (
    `username` TEXT NOT NULL,
    `password` CHAR(128) NOT NULL,
    `salt` TEXT NOT NULL,
    `liked` TEXT DEFAULT NULL,
    `pfp` CHAR(68) DEFAULT NULL, -- 64 for sha256 hash + 4 for .png
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;