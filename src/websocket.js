// Get variables from config.json
const config = require("../config.js");

// Import packages
const db = require("better-sqlite3")(config.database.url);
const forge = require("node-forge");
const sha512 = require("js-sha512");
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

                    socket.send(`REGISTRATION;;${username};;${password}`);
                });
            });
        }
    });
});