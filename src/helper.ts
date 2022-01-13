// Get variables from config.json
import { config } from "../config.js";

// Import packages
import Database from 'better-sqlite3'
const db = new Database(config.database.main.url);
const salt_db = new Database(config.database.salt.url);
import forge from 'node-forge';
import Memcached from "memcached";
const memcached = new Memcached(`${config.memcached.url}:${config.memcached.port}`);

import crypto from "crypto";

/**
 * @function base64decode
 * @param {string} message
 * @returns {string}
 * @description Decodes a base64 encoded string
 */
function base64decode(message: string): string {
    return Buffer.from(message, "base64").toString("utf-8");
}

/**
 * @function base64encode
 * @param {string} message
 * @returns {string}
 * @description Encodes a string to base64
 */
function base64encode(message: string): string {
    return Buffer.from(message, "utf-8").toString("base64");
}
/**
 * @function pbkdf2
 * @param  {string} password
 * @param  {string} salt
 * @returns {string}
 * @description Generates a password hash using pbkdf2
 */
function pbkdf2(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, config.pbkdf2.iterations, config.pbkdf2.keyLength, config.pbkdf2.algorithm).toString("hex");
}
/**
 * @function generateSalt
 * @param  {number} passwordLength
 * @returns string
 * @description Generates a random salt
 */
function generateSalt(passwordLength: number): string {
    return crypto.randomBytes(passwordLength + (Math.floor((Math.random() * 30) + 10)) / 2).toString("hex");
}
/**
 * @function generateSessionID
 * @returns string
 * @description Generates a random session ID
 */
function generateSessionID(): string {
    return crypto.randomBytes(6).toString("hex");
}

export { base64decode, base64encode, pbkdf2, generateSalt, generateSessionID };