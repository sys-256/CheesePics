// Get variables from config.json
import { config } from "../config.js";

// Import packages
import crypto from "crypto";

import { base64encode, base64decode, pbkdf2, generateSalt } from "./helpers/crypto.js";
import { addUserToDatabase, checkUserExistsInDB, getSaltFromDB, getPasswdByUsernameFromDB } from "./helpers/mariadb.js";

function generateSessionID(): string {
    return crypto.randomBytes(6).toString("hex");
}

function getCheeseLink(): string {
    return `https://cheesepics.xyz/images/${Math.floor(Math.random() * 496 + 1)}.jpg`;
}

export { base64decode, base64encode, pbkdf2, generateSalt, generateSessionID, addUserToDatabase, checkUserExistsInDB, getSaltFromDB, getPasswdByUsernameFromDB, getCheeseLink };