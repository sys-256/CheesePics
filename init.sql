-- Create the database
CREATE DATABASE cheesepics;

-- Create the login table
USE cheesepics_main;
CREATE TABLE `login` (
    `username` TEXT,
    `password` CHAR(128),
    `salt` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;