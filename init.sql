-- Create the database
CREATE DATABASE cheesepics;

-- Create the login table
USE cheesepics;
CREATE TABLE `login` (
    `username` TEXT NOT NULL,
    `password` CHAR(128) NOT NULL,
    `salt` TEXT NOT NULL,
    `liked` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;