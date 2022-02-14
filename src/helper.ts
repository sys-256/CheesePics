// Get variables from config.json
import { config } from "../config.js";

// Import packages
import crypto from "crypto";

import { base64, pbkdf2, generateSalt } from "./helpers/crypto.js";
import { addUserToDatabase, checkUserExistsInDB, getSaltFromDB, getPasswdByUsernameFromDB, getRandomImage, checkImageExists } from "./helpers/mariadb.js";

function generateSessionID(): string {
    return crypto.randomBytes(6).toString("hex");
}

export { base64, pbkdf2, generateSalt, addUserToDatabase, checkUserExistsInDB, getSaltFromDB, getPasswdByUsernameFromDB, getRandomImage, checkImageExists, generateSessionID };