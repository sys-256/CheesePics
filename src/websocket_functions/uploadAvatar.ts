// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import Database from 'better-sqlite3';
const sessionsDB = new Database(config.sessions.url);
import forge from 'node-forge';

import * as helper from "../helper.js";

export const uploadAvatar = async (socket: any, message: string[], clientPublickey: forge.pki.rsa.PublicKey, imageData: string) => {
    // Check if the user exists
    const result = await helper.checkUserExistsInDB(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;SERVER;;An error occurred while checking if the user exists.`));
        return;
    });
    if (!result) {
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;CLIENT;;The username or password is incorrect.`));
        return;
    }

    // Get salt from database
    const salt = await helper.getSaltFromDB(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;SERVER;;An error occurred while getting the salt from the database.`));
        return;
    });

    // Base64 decode the username and password
    const username = await helper.base64decode(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;SERVER;;An error occurred while decoding the username.`));
        return;
    });
    const password = await helper.base64decode(message[2]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;SERVER;;An error occurred while decoding the password.`));
        return;
    });

    // (Encode username) + (hash password + salt)
    const password_compare = await helper.pbkdf2(password, salt).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;SERVER;;An error occurred while hashing the password.`));
        return;
    });

    // Get username and password from database
    const db_password = await helper.getPasswdByUsernameFromDB(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;SERVER;;An error occurred while getting the username and password from the database.`));
        return;
    });

    // Compare the username and password
    if (password_compare !== db_password) {
        socket.send(clientPublickey.encrypt(`ICON;;ERR;;CLIENT;;The username or password is incorrect.`));
        return;
    }

    
}