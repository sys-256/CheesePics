export {};
// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import Database from 'better-sqlite3'
const db = new Database(config.database.main.url);
const salt_db = new Database(config.database.salt.url);
import forge from 'node-forge';
import Memcached from "memcached";
const memcached:Memcached = new Memcached(`${config.memcached.url}:${config.memcached.port}`);

import * as helper from "../helper.js";

// Declare variables to avoid try/catch hell
let username;
let password;
let salt;
let username_compare;
let password_compare;
let db_result;

export const login = (socket: any, message: string[], clientPublickey: any) => {
    // Check if the user exists
    try {
        const result = db.prepare("SELECT * FROM login WHERE username=?").get(message[1]);
        if (!result) {
            socket.send(clientPublickey.encrypt(`LOGI;;ERR;;CLIENT;;This user doesn't exist.`));
            socket.close();
            return;
        }
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while checking if the user exists.`));
        socket.close();
        return;
    }

    // Get salt from database
    try {
        const result = salt_db.prepare("SELECT * FROM main WHERE username=?").get(message[1]);
        if (!result) {
            socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while getting the salt from the database.`));
            socket.close();
            return;
        }
        console.log(result);
        salt = result.salt;
    }
    catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while getting the salt from the database.`));
        socket.close();
        return;
    }

    // Base64 decode the username and password
    try {
        username = helper.base64decode(message[1]);
        password = helper.base64decode(message[2]);
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while decoding the username and password.`));
        socket.close();
        return;
    }

    // (Encode username) + (hash password + salt)
    try {
        username_compare = helper.base64encode(username);
        password_compare = helper.pbkdf2(password, salt);
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while encoding the username or hashing/salting the password.`));
        socket.close();
        return;
    }

    // Get username and password from database
    try {
        db_result = db.prepare("SELECT * FROM login WHERE username=?").get(message[1]);
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while getting the username and password from the database.`));
        socket.close();
        return;
    }

    // Compare the username and password
    if (username_compare !== db_result.username || password_compare !== db_result.password) {
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;CLIENT;;The username or password is incorrect.`));
        socket.close();
        return;
    }

    // Check if there is a session with the same username
    try {
        const result = db.prepare("SELECT * FROM sessions WHERE username=?").get(message[1]);
        if (result) {
            // Check if the session is valid
            if (result.expires > Date.now()) {
                socket.send(clientPublickey.encrypt(`LOGI;;SUCCESS;;${result.id}`));
                socket.close();
                return;
            }
            // If the session is not valid, delete it
            else {
                db.prepare("DELETE FROM sessions WHERE username=?").run(message[1]);
            }
        }
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while checking if there is a session with the same username.`));
        socket.close();
        return;
    }

    // Generate a random session key and when it expires
    const session_key = helper.generateSessionID();
    const expires = Date.now() + config.session.expires;

    // Insert the session key into the database
    try {
        db.prepare("INSERT INTO sessions (id, username, expires) VALUES (?, ?, ?)").run(session_key, message[1], expires);
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`LOGI;;ERR;;SERVER;;An error occurred while inserting the session key into the database.`));
        socket.close();
        return;
    }

    // Send the session key to the client
    socket.send(clientPublickey.encrypt(`LOGI;;SUCCESS;;${session_key}`));
    socket.close();
    return;
};