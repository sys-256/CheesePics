// Get variables from config.json
import { config } from "../config.js";

// Import packages
import { randomBytes } from "crypto";

import * as crypto from "./helpers/crypto.js";
import * as mariadb from "./helpers/mariadb.js";

function generateSessionID(): string {
    return randomBytes(12).toString("hex");
}

export { crypto, mariadb, generateSessionID };
