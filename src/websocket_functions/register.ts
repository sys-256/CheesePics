// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import Database from "better-sqlite3";
const sessionsDB = new Database(config.sessions.url);
import forge from "node-forge";

import * as helper from "../helper.js";

export const register = async (
    socket: any,
    message: string[],
    clientPublickey: forge.pki.rsa.PublicKey,
) => {
    // Check if the user already exists in the database
    const result = await helper.mariadb
        .checkUserExistsInDB(message[1])
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;SERVER;;An error occurred while checking if the user already exists.`,
                ),
            );
            return true;
        });
    if (result) {
        socket.send(
            clientPublickey.encrypt(
                `REGI;;ERR;;CLIENT;;This username is already taken.`,
            ),
        );
        return;
    }

    // Base64 decode the username and password
    const username = await new helper.crypto.base64(message[1])
        .decode()
        .catch((error) => {
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;SERVER;;An error occurred while decoding the username.`,
                ),
            );
            return "";
        });
    const password = await new helper.crypto.base64(message[2])
        .decode()
        .catch((error) => {
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;SERVER;;An error occurred while decoding the password.`,
                ),
            );
            return "";
        });

    username.replace(/(\r\n|\n|\r)/gm, "");
    password.replace(/(\r\n|\n|\r)/gm, "");

    // Make sure the username and password fit the criteria
    try {
        if (!config.regex.username.test(username)) {
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;CLIENT;;The username doesn't match the critera.`,
                ),
            );
            return;
        }
        if (!config.regex.password.test(password)) {
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;CLIENT;;The password doesn't match the critera.`,
                ),
            );
            return;
        }
    } catch (err) {
        console.log(err);
        socket.send(
            clientPublickey.encrypt(
                `REGI;;ERR;;SERVER;;An error occurred while checking the username and password fit the criteria.`,
            ),
        );
        return;
    }

    // Generate salt
    const salt = await helper.crypto
        .generateSalt(password.length)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;SERVER;;An error occurred while generating the salt.`,
                ),
            );
            return "";
        });

    // (Encode username) + (hash password + salt)
    const username_db = await new helper.crypto.base64(username)
        .encode()
        .catch((error) => {
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;SERVER;;An error occurred while encoding the username.`,
                ),
            );
            return "";
        });
    const password_db = await helper.crypto
        .pbkdf2(password, salt)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;SERVER;;An error occurred while hashing the password.`,
                ),
            );
            return "";
        });

    // Insert username, password hash and salt into the database
    await helper.mariadb
        .addUserToDatabase(username_db, password_db, salt)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `REGI;;ERR;;SERVER;;An error occurred while inserting the username, password hash and salt into the database.`,
                ),
            );
            return;
        });

    // Send success message
    socket.send(clientPublickey.encrypt(`REGI;;SUCCESS`));
    socket.close();
    return;
};
