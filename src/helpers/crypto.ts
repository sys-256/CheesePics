// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import forge from 'node-forge';

import crypto from "crypto";

function base64decode(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const result = Buffer.from(message, "base64").toString("utf-8");
        if (!result || result === "") {
            reject("Error decoding base64.");
            return;
        }
        resolve(result);
    });
}

function base64encode(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const result = Buffer.from(message, "utf-8").toString("base64");
        if (!result || result === "") {
            reject("Error decoding base64.");
            return;
        }
        resolve(result);
    });
}

function pbkdf2(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, config.pbkdf2.iterations, config.pbkdf2.keyLength, config.pbkdf2.algorithm, (error, key) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(key.toString("hex"));
        });
    });
}

function generateSalt(passwordLength: number): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(passwordLength + (Math.floor((Math.random() * 30) + 10)) / 2, (error, salt) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(salt.toString("hex"));
        });
    });
}

export { base64decode, base64encode, pbkdf2, generateSalt };