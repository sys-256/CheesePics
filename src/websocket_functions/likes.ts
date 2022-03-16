// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import forge from "node-forge";

import * as helper from "../helper.js";

export const like = async (
    socket: any,
    message: string[],
    clientPublickey: forge.pki.rsa.PublicKey,
) => {
    // Check if the user exists
    const result = await helper.mariadb
        .checkUserExistsInDB(message[1])
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while checking if the user exists.`,
                ),
            );
            return false;
        });
    if (!result) {
        socket.send(
            clientPublickey.encrypt(
                `LIKE;;ERR;;CLIENT;;The username or password is incorrect.`,
            ),
        );
        return;
    }

    // Get salt from database
    const salt = await helper.mariadb
        .getSaltFromDB(message[1])
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while getting the salt from the database.`,
                ),
            );
            return undefined;
        });

    // Base64 decode the username and password
    const username = await new helper.crypto.base64(message[1])
        .decode()
        .catch((error) => {
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while decoding the username.`,
                ),
            );
            return undefined;
        });
    const password = await new helper.crypto.base64(message[2])
        .decode()
        .catch((error) => {
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while decoding the password.`,
                ),
            );
            return undefined;
        });

    if (salt === undefined || username === undefined || password === undefined)
        return;

    // (Encode username) + (hash password + salt)
    const password_compare = await helper.crypto
        .pbkdf2(password, salt)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while hashing the password.`,
                ),
            );
            return;
        });

    // Get username and password from database
    const db_password = await helper.mariadb
        .getPasswdByUsernameFromDB(message[1])
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while getting the username and password from the database.`,
                ),
            );
            return;
        });

    // Compare the username and password
    if (password_compare !== db_password) {
        socket.send(
            clientPublickey.encrypt(
                `LIKE;;ERR;;CLIENT;;The username or password is incorrect.`,
            ),
        );
        return;
    }

    // Check if the image exists
    const image = message[0].split("::")[1];
    if ((await helper.mariadb.checkImageExists(image)) === false) {
        socket.send(
            clientPublickey.encrypt(
                `LIKE;;ERR;;CLIENT;;The image does not exist.`,
            ),
        );
        return;
    }

    // Check if the user has already liked the image
    const check_like = await helper.mariadb
        .checkLikeExists(message[1], image)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while checking if the user has already liked the image.`,
                ),
            );
            return undefined;
        });

    if (check_like === undefined) return;

    if (check_like === true) {
        socket.send(
            clientPublickey.encrypt(
                `LIKE;;ERR;;CLIENT;;You have already liked this image.`,
            ),
        );
        return;
    }

    // Insert like into database
    const insert_like = await helper.mariadb
        .addLikeToDatabase(message[1], image)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `LIKE;;ERR;;SERVER;;An error occurred while inserting the like into the database.`,
                ),
            );
            return undefined;
        });

    if (insert_like === undefined) return;

    // Send success message to client
    socket.send(clientPublickey.encrypt(`LIKE;;SUCCESS`));
    return;
};

export const unlike = async (
    socket: any,
    message: string[],
    clientPublickey: forge.pki.rsa.PublicKey,
) => {
    // Check if the user exists
    const result = await helper.mariadb
        .checkUserExistsInDB(message[1])
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while checking if the user exists.`,
                ),
            );
            return false;
        });
    if (!result) {
        socket.send(
            clientPublickey.encrypt(
                `UNLIKE;;ERR;;CLIENT;;The username or password is incorrect.`,
            ),
        );
        return;
    }

    // Get salt from database
    const salt = await helper.mariadb
        .getSaltFromDB(message[1])
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while getting the salt from the database.`,
                ),
            );
            return undefined;
        });

    // Base64 decode the username and password
    const username = await new helper.crypto.base64(message[1])
        .decode()
        .catch((error) => {
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while decoding the username.`,
                ),
            );
            return undefined;
        });
    const password = await new helper.crypto.base64(message[2])
        .decode()
        .catch((error) => {
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while decoding the password.`,
                ),
            );
            return undefined;
        });

    if (salt === undefined || username === undefined || password === undefined)
        return;

    // (Encode username) + (hash password + salt)
    const password_compare = await helper.crypto
        .pbkdf2(password, salt)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while hashing the password.`,
                ),
            );
            return;
        });

    // Get username and password from database
    const db_password = await helper.mariadb
        .getPasswdByUsernameFromDB(message[1])
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while getting the username and password from the database.`,
                ),
            );
            return;
        });

    // Compare the username and password
    if (password_compare !== db_password) {
        socket.send(
            clientPublickey.encrypt(
                `UNLIKE;;ERR;;CLIENT;;The username or password is incorrect.`,
            ),
        );
        return;
    }

    // Check if the image exists
    const image = message[0].split("::")[1];
    if ((await helper.mariadb.checkImageExists(image)) === false) {
        socket.send(
            clientPublickey.encrypt(
                `UNLIKE;;ERR;;CLIENT;;The image does not exist.`,
            ),
        );
        return;
    }

    // Check if the user has liked the image
    const check_like = await helper.mariadb
        .checkLikeExists(message[1], image)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while checking if the user has already liked the image.`,
                ),
            );
            return undefined;
        });

    if (check_like === undefined) return;

    if (check_like === false) {
        socket.send(
            clientPublickey.encrypt(
                `UNLIKE;;ERR;;CLIENT;;You haven't liked this image.`,
            ),
        );
        return;
    }

    // Remove like from database
    const remove_like = await helper.mariadb
        .removeLikeFromDatabase(message[1], image)
        .catch((error) => {
            console.log(error);
            socket.send(
                clientPublickey.encrypt(
                    `UNLIKE;;ERR;;SERVER;;An error occurred while inserting the like into the database.`,
                ),
            );
            return undefined;
        });

    if (remove_like === undefined) return;

    // Send success message to client
    socket.send(clientPublickey.encrypt(`UNLIKE;;SUCCESS`));
    return;
};
