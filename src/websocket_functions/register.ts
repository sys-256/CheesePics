export { };
// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import Database from 'better-sqlite3';
const sessionsDB = new Database(config.sessions.url);
import forge from 'node-forge';
import Memcached from "memcached";
const memcached = new Memcached(`${config.memcached.url}:${config.memcached.port}`);

import * as helper from "../helper.js";

export const register = async (socket: any, message: string[], clientPublickey: forge.pki.rsa.PublicKey) => {
    // Check if the user already exists in the database
    const result = await helper.checkUserExistsInDB(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while checking if the user already exists.`));
        socket.close();
        return;
    });
    if (result) {
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;CLIENT;;This username is already taken.`));
        socket.close();
        return;
    }

    // Base64 decode the username and password
    const username = await helper.base64decode(message[1]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while decoding the username.`));
        socket.close();
        return;
    });
    const password = await helper.base64decode(message[2]).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while decoding the password.`));
        socket.close();
        return;
    });

    // Make sure the username and password fit the criteria
    try {
        if (!config.regex.username.test(username)) {
            socket.send(clientPublickey.encrypt(`REGI;;ERR;;CLIENT;;The username doesn't match the critera.`));
            socket.close();
            return;
        }
        if (!config.regex.password.test(password)) {
            socket.send(clientPublickey.encrypt(`REGI;;ERR;;CLIENT;;The password doesn't match the critera.`));
            socket.close();
            return;
        }
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while checking the username and password fit the criteria.`));
        socket.close();
        return;
    }

    // Generate salt
    const salt = await helper.generateSalt(password.length).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while generating the salt.`));
        socket.close();
        return;
    });

    // (Encode username) + (hash password + salt)
    const username_db = await helper.base64encode(username).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while encoding the username.`));
        socket.close();
        return;
    });
    const password_db = await helper.pbkdf2(password, salt).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while hashing the password.`));
        socket.close();
        return;
    });

    // Insert username, password hash and salt into the database
    await helper.addUserToDatabase(username_db, password_db, salt).catch((error) => {
        console.log(error);
        socket.send(clientPublickey.encrypt(`REGI;;ERR;;SERVER;;An error occurred while inserting the username, password hash and salt into the database.`));
        socket.close();
        return;
    });

    // Send success message
    socket.send(clientPublickey.encrypt(`REGI;;SUCCESS`));
}