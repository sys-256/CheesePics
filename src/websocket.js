// Get variables from config.json
const config = require("../config.js");

// Import packages
const db = require("better-sqlite3")(config.database.main.url);
const salt_db = require("better-sqlite3")(config.database.salt.url);
const forge = require("node-forge");
const helper = require("./helper.js");
const Memcached = require("memcached");
const memcached = new Memcached().connect(`${config.memcached.url}:${config.memcached.port}`, (error, result) => {
    if (error) {
        console.log(`websocket.js: Failed to connect to memcached server: ${error}`);
        process.exit(1);
        return;
    }
});

const WebSocket = require("ws");
const ws = new WebSocket.Server({ port: config.port.websocket }, async () => {
    console.log(`Listening for WebSocket connections on port ${config.port.websocket}`);
});

ws.on("connection", async (socket) => {
    forge.pki.rsa.generateKeyPair({
        "bits": config.rsa.bits,
        "workers": config.rsa.workers
    }, async (err, keypair) => {
        if (err) {
            console.error(err);
            socket.send(`ERR;;SERVER;;An error occurred while generating a keypair.`);
            socket.close();
            return;
        }
        socket.send(`PUBLICKEY;;${forge.pki.publicKeyToPem(keypair.publicKey).replace(/(\r\n|\n|\r)/gm, "")}`);

        socket.on("message", async (message_buffer) => {
            const message_encrypted = message_buffer.toString();

            const clientPublickey = forge.pki.publicKeyFromPem(message_encrypted.split("::")[0]);
            const new_message = message_encrypted.slice(message_encrypted.indexOf("::") + 2);

            // Make sure it's a valid encrypted message
            if (new_message.length !== 128) {
                socket.send(`ERR;;CLIENT;;Invalid message length.`);
                socket.close();
                return;
            }

            // Decrypt the message with the private key and split it into parts by ;;
            const message = keypair.privateKey.decrypt(new_message).split(";;");

            // Check if the message contains at least 2 parts
            if (message.length < 1) {
                socket.send(`ERR;;CLIENT;;Specify at least a public key and method.`);
                socket.close();
                return;
            }

            if (message[0] === "REGI") {
                // Check if the message enough info
                if (message.length !== 3) {
                    socket.send(`ERR;;CLIENT;;Specify (only) a method, username and password.`);
                    socket.close();
                    return;
                }

                require("./websocket/register.js")(socket, message, clientPublickey);
            }
            if (message[0] === "LOGI") {
                // Check if the message enough info
                if (message.length !== 3) {
                    socket.send(`ERR;;CLIENT;;Specify (only) a method, username and password.`);
                    socket.close();
                    return;
                }

                require("./websocket/login.js")(socket, message, clientPublickey);
            }
        });
    });
});