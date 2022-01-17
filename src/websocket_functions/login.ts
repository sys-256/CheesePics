export { };
// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import Database from 'better-sqlite3';
const sessionsDB = new Database(config.sessions.url);
import forge from 'node-forge';
import Memcached from "memcached";
const memcached: Memcached = new Memcached(`${config.memcached.url}:${config.memcached.port}`);

import * as helper from "../helper.js";

export const login = async (socket: any, message: string[], clientPublickey: forge.pki.rsa.PublicKey, serverKeypair: forge.pki.rsa.KeyPair) => {
    // Check if the user exists
    const result = await helper.checkUserExistsInDB(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while checking if the user exists.`));
        return;
    });
    if (!result) {
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;CLIENT;;The username or password is incorrect.`));
        return;
    }

    // Get salt from database
    const salt = await helper.getSaltFromDB(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while getting the salt from the database.`));
        return;
    });

    // Base64 decode the username and password
    const username = await helper.base64decode(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while decoding the username.`));
        return;
    });
    const password = await helper.base64decode(message[2]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while decoding the password.`));
        return;
    });

    // (Encode username) + (hash password + salt)
    const password_compare = await helper.pbkdf2(password, salt).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while hashing the password.`));
        return;
    });

    // Get username and password from database
    const db_password = await helper.getPasswdByUsernameFromDB(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while getting the username and password from the database.`));
        return;
    });

    // Compare the username and password
    if (password_compare !== db_password) {
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;CLIENT;;The username or password is incorrect.`));
        return;
    }

    // Delete previous sessions
    try {
        sessionsDB.prepare(`DELETE FROM sessions WHERE username='${message[1]}';`).run();
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while deleted previous sessions.`));
        return;
    }

    // Generate a random session key and when it expires
    const session_key = helper.generateSessionID();
    const expires = Date.now() + config.cookies.maxAge;

    // Insert the session key into the database
    try {
        sessionsDB.prepare("INSERT INTO sessions (ID, username, expires, privkey) VALUES (?, ?, ?, ?)").run(session_key, message[1], expires, forge.pki.privateKeyToPem(serverKeypair.privateKey).replace(/(\r\n|\n|\r)/gm, ""));
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while inserting the session key into the database.`));
        return;
    }

    // Send the session key to the client
    socket.send(clientPublickey.encrypt(`LOGI;;SUCCESS;;${session_key}`))
    return;
};