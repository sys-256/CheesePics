// Get variables from config.json
const config = require("../config.json");

// Import packages
const db = require("better-sqlite3")(config.database.url);
const forge = require("node-forge");

const WebSocket = require("ws");
const ws = new WebSocket.Server({ port: config.ws_port }, () => {
    console.log(`Listening for WebSocket connections on port ${config.ws_port}`);
});

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
                        const decrypted = keypair.privateKey.decrypt(message);
                        socket.send(`${decrypted}`);
                    }
                    catch (err) {
                        socket.send(`ERR;;CLIENT;;Invalid message.`);
                        socket.close();
                        return;
                    }
                });
            });
        }
    });
});