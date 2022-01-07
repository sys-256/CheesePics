// Get variables from config.json
const config = require("../../config.js");

// Import packages
const db = require("better-sqlite3")(config.database.main.url);
const salt_db = require("better-sqlite3")(config.database.salt.url);
const forge = require("node-forge");
const helper = require("../helper.js");

// Declare variables to avoid try/catch hell
let username;
let password;
let username_db;
let password_db;
let salt;

module.exports = (socket, message, keypair, clientPublickey) => {
    // Check if the user already exists in the database
    try {
        const result = db.prepare("SELECT * FROM login WHERE username=?").get(message[1]);
        if (result) {
            socket.send(clientPublickey.encrypt(`ERR;;CLIENT;;The username already exists.`));
            socket.close();
            return;
        }
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`ERR;;SERVER;;An error occurred while checking if the user already exists.`));
        socket.close();
        return;
    }

    // Base64 decode the username and password
    try {
        username = helper.base64decode(message[1]);
        password = helper.base64decode(message[2]);
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`ERR;;SERVER;;An error occurred while decoding the username and password.`));
        socket.close();
        return;
    }

    // Make sure the username and password fit the criteria
    try {
        if (!config.regex.username.test(username)) {
            socket.send(clientPublickey.encrypt(`ERR;;CLIENT;;The username doesn't match the critera of ${config.regex.username}.`));
            socket.close();
            return;
        }
        if (!config.regex.password.test(password)) {
            socket.send(clientPublickey.encrypt(`ERR;;CLIENT;;The password doesn't match the critera of ${config.regex.password}.`));
            socket.close();
            return;
        }
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`ERR;;SERVER;;An error occurred while checking the username and password fit the criteria.`));
        socket.close();
        return;
    }

    // Generate salt
    salt = helper.generateSalt(password.length);

    // (Encode username) + (hash password + salt)
    try {
        username_db = helper.base64encode(username);
        password_db = helper.sha512(password + salt);
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`ERR;;SERVER;;An error occurred while encoding the username or hashing/salting the password.`));
        socket.close();
        return;
    }

    // Insert username, password and salt hash into the database
    try {
        db.prepare("INSERT INTO login (username, password) VALUES (?, ?);").run(username_db, password_db);
        salt_db.prepare("INSERT INTO main (username, salt) VALUES (?, ?);").run(username_db, salt);
    } catch (err) {
        console.log(err);
        socket.send(clientPublickey.encrypt(`ERR;;SERVER;;An error occurred while inserting the username, password and salt into the database.`));
        socket.close();
        return;
    }

    // Send success message
    socket.send(clientPublickey.encrypt(`SUCCESS`));
}