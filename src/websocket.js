// Get variables from config.json
const config = require("../config.js");

// Import packages
const db = require("better-sqlite3")(config.database.main.url);
const salt_db = require("better-sqlite3")(config.database.salt.url);
const forge = require("node-forge");
const helper = require("./helper.js");

const WebSocket = require("ws");
const ws = new WebSocket.Server({ port: config.port.websocket }, () => {
    console.log(`Listening for WebSocket connections on port ${config.port.websocket}`);
});

// Declare variables to avoid try/catch hell
let decrypted;
let decrypted_split;
let username;
let password;
let username_db;
let password_db;
let salt;

ws.on("connection", (socket) => {
    socket.on("message", (message_buffer) => {
        const message = message_buffer.toString();
        if (message === "REGI") {
            forge.pki.rsa.generateKeyPair({
                "bits": 1024,
                "workers": -1,
                "workerScript": "https://cdnjs.cloudflare.com/ajax/libs/forge/0.10.0/prime.worker.min.js"
            }, (err, keypair) => {
                if (err) {
                    console.error(err);
                    socket.send(`ERR;;SERVER;;An error occurred while generating a keypair.`);
                    socket.close();
                    return;
                }
                socket.send(`PUBLICKEY;;${forge.pki.publicKeyToPem(keypair.publicKey).replace(/(\r\n|\n|\r)/gm, "")}`);
                socket.on("message", (message_buffer) => {
                    const message = message_buffer.toString();
                    if (message.length !== 128) {
                        socket.send(`ERR;;CLIENT;;Invalid message length.`);
                        socket.close();
                        return;
                    }

                    try {
                        // Decrypt the message with the private key
                        decrypted = keypair.privateKey.decrypt(message);
                    } catch (err) {
                        socket.send(`ERR;;CLIENT;;Invalid message.`);
                        socket.close();
                        return;
                    }

                    try {
                        // Make sure the message only contains 2 parts
                        decrypted_split = decrypted.split(";;");
                        if (decrypted_split.length > 2) {
                            socket.send(`ERR;;CLIENT;;Please specify only a username and password.`);
                            socket.close();
                            return;
                        }
                        if (decrypted_split.length < 2) {
                            socket.send(`ERR;;CLIENT;;Please specify both a username and password.`);
                            socket.close();
                            return;
                        }
                    } catch (err) {
                        socket.send(`ERR;;SERVER;;An error occurred while splitting the decrypted message.`);
                        socket.close();
                        return;
                    }
            
                    // Check if the user already exists in the database
                    try {
                        const result = db.prepare("SELECT * FROM login WHERE username=?").get(decrypted_split[0]);
                        if (result) {
                            socket.send(`ERR;;CLIENT;;The username already exists.`);
                            socket.close();
                            return;
                        }
                    } catch (err) {
                        socket.send(`ERR;;SERVER;;An error occurred while checking if the user already exists.`);
                        socket.close();
                        return;
                    }

                    try {
                        // Base64 decode the username and password
                        username = helper.base64decode(decrypted_split[0]);
                        password = helper.base64decode(decrypted_split[1]);
                    } catch (err) {
                        socket.send(`ERR;;SERVER;;An error occurred while decoding the username and password.`);
                        socket.close();
                        return;
                    }

                    // Make sure the username and password fit the criteria
                    if (!config.regex.username.test(username)) {
                        socket.send(`ERR;;CLIENT;;The username doesn't match the critera of ${config.regex.username}.`);
                        socket.close();
                        return;
                    }
                    if (!config.regex.password.test(password)) {
                        socket.send(`ERR;;CLIENT;;The password doesn't match the critera of ${config.regex.password}.`);
                        socket.close();
                        return;
                    }

                    salt = helper.generateSalt(password.length);

                    // (Encode username) + (hash password + salt)
                    try {
                        username_db = helper.base64encode(username);
                        password_db = helper.sha512(password + salt);
                    } catch (err) {
                        socket.send(`ERR;;SERVER;;An error occurred while encoding the username or hashing/salting the password.`);
                        socket.close();
                        return;
                    }

                    // Insert username, password and salt hash into the database
                    try {
                        db.prepare("INSERT INTO login (username, password) VALUES (?, ?);").run(username_db, password_db);
                        salt_db.prepare("INSERT INTO main (username, salt) VALUES (?, ?);").run(username_db, salt);
                    } catch (err) {
                        socket.send(`ERR;;SERVER;;An error occurred while inserting the username, password and salt into the database.`);
                        socket.close();
                        return;
                    }

                    // Send success message
                    socket.send(`SUCCESS`);
                });
            });
        }
    });
});