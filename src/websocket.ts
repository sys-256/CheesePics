export { }
// Get variables from config.json
import { config } from "../config.js";

// Import packages
import Database from 'better-sqlite3'
const db = new Database(config.database.main.url);
const salt_db = new Database(config.database.salt.url);
import forge from 'node-forge';
import Memcached from "memcached";
const memcached = new Memcached(`${config.memcached.url}:${config.memcached.port}`);
import { WebSocketServer } from 'ws'

import * as helper from "./helper";
import { login } from "./websocket_functions/login.js";
import { register } from "./websocket_functions/register.js";

const startWSServer = () => {
    const ws = new WebSocketServer({ port: config.port.websocket }, async () => {
        console.log(`Listening for WebSocket connections on port ${config.port.websocket}`);
    });

    ws.on("connection", async (socket) => {
        forge.pki.rsa.generateKeyPair({
            "bits": config.rsa.bits,
            "workers": config.rsa.workers
        }, async (error: Error, keypair: forge.pki.rsa.KeyPair) => {
            if (error) {
                console.error(error);
                socket.send(`ERR;;SERVER;;An error occurred while generating a keypair.`);
                socket.close();
                return;
            }
            socket.send(`PUBLICKEY;;${forge.pki.publicKeyToPem(keypair.publicKey).replace(/(\r\n|\n|\r)/gm, "")}`);

            socket.on("message", async (message_buffer) => {
                const message_encrypted = message_buffer.toString();

                let clientPublickey;
                try {
                    clientPublickey = forge.pki.publicKeyFromPem(message_encrypted.split("::")[0]);
                } catch (error) {
                    socket.send(`ERR;;CLIENT;;Please send a valid public key.`);
                    socket.close();
                    return;
                }
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

                    register(socket, message, clientPublickey);
                }
                if (message[0] === "LOGI") {
                    // Check if the message enough info
                    if (message.length !== 3) {
                        socket.send(`ERR;;CLIENT;;Specify (only) a method, username and password.`);
                        socket.close();
                        return;
                    }

                    login(socket, message, clientPublickey);
                }
            });
        });
    });
};

export { startWSServer as default };