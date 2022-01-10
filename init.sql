-- Create the databases
CREATE DATABASE cheesepics_main;
CREATE DATABASE cheesepics_salt;

-- Create the main table
USE cheesepics_main;
CREATE TABLE `main` (
    `username` TEXT,
    `password` CHAR(128)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create the salt table
USE cheesepics_salt;
CREATE TABLE `salt` (
    `username` TEXT,
    `salt` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;