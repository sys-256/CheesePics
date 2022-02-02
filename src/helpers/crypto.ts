// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import forge from 'node-forge';
import crypto from "crypto";

class base64 {
    message: string;

    constructor(msg: string) {
        this.message = msg;
    }

    decode(): Promise<string> {
        return new Promise((resolve, reject) => {
            const result = Buffer.from(this.message, "base64").toString("utf-8");
            if (!result) {
                reject("Error decoding base64.");
                return;
            }
            resolve(result);
        });
    }

    encode(): Promise<string> {
        return new Promise((resolve, reject) => {
            const result = Buffer.from(this.message, "utf-8").toString("base64");
            if (!result) {
                reject("Error decoding base64.");
                return;
            }
            resolve(result);
        });
    }
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

export { base64, pbkdf2, generateSalt };