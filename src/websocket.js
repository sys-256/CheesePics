// Get variables from config.json
const config = require("../config.js");

// Import packages
const db = require("better-sqlite3")(config.database.main.url);
const salt_db = require("better-sqlite3")(config.database.salt.url);
const forge = require("node-forge");
const helper = require("./helper.js");

const WebSocket = require("ws");
const ws = new WebSocket.Server({ port: config.port.websocket }, async () => {
    console.log(`Listening for WebSocket connections on port ${config.port.websocket}`);
});

ws.on("connection", async (socket) => {
    socket.on("message", async (message_buffer) => {
        const message = message_buffer.toString();
        if (message === "REGI") {
            forge.pki.rsa.generateKeyPair({
                "bits": 1024,
                "workers": -1,
                "workerScript": "https://cdnjs.cloudflare.com/ajax/libs/forge/0.10.0/prime.worker.min.js"
            }, async (err, keypair) => {
                if (err) {
                    console.error(err);
                    socket.send(`ERR;;SERVER;;An error occurred while generating a keypair.`);
                    socket.close();
                    return;
                }
                socket.send(`PUBLICKEY;;${forge.pki.publicKeyToPem(keypair.publicKey).replace(/(\r\n|\n|\r)/gm, "")}`);
                socket.on("message", async (message_buffer) => {
                    require("./websocket/register.js")(socket, message_buffer, keypair);
                });
            });
        }
        if (message === "LOGI") {
            socket.send("elo")
        }
    });
});