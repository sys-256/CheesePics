// Get variables from config.json
import { config } from "../config.js";

// Import packages
import Database from 'better-sqlite3';
const sessionsDB = new Database(config.sessions.url);
import forge from 'node-forge';
import { WebSocketServer } from 'ws'

import * as helper from "./helper";
import { login } from "./websocket_functions/login.js";
import { register } from "./websocket_functions/register.js";
import { uploadAvatar } from "./websocket_functions/uploadAvatar.js";
import { like, unlike } from "./websocket_functions/likes.js";

export const startWSServer = () => {
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
                const new_message: string = message_encrypted.slice(message_encrypted.indexOf("::") + 2);

                // Make sure it's a valid encrypted message
                let pfp_data: string | undefined;
                if (new_message.length !== 128 && new_message.includes("::")) {
                    if (new_message.includes("::")) {
                        try {
                            pfp_data = new_message.slice(new_message.indexOf("::") + 2);
                        } catch (err) {
                            socket.send(`ERR;;CLIENT;;Please send a valid encrypted message.`);
                            socket.close();
                            return;
                        }
                    } else {
                        socket.send(`ERR;;CLIENT;;Invalid message length.`);
                        socket.close();
                        return;
                    }
                }

                // Decrypt the message with the private key and split it into parts by ;;
                const message: string[] = keypair.privateKey.decrypt(new_message.split("::")[0]).split(";;");

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
                if (message[0] === "ICON" && pfp_data) {
                    // Check if the message enough info
                    if (message.length !== 3) {
                        socket.send(`ERR;;CLIENT;;Specify (only) a method, username and password.`);
                        socket.close();
                        return;
                    }

                    uploadAvatar(socket, message, clientPublickey, pfp_data);
                }
                if (message[0].split("::")[0] === "LIKE") {
                    // Check if the message enough info
                    if (message.length !== 3) {
                        socket.send(`ERR;;CLIENT;;Specify (only) a method, username and password.`);
                        socket.close();
                        return;
                    }

                    like(socket, message, clientPublickey);
                }
                if (message[0].split("::")[0] === "UNLIKE") {
                    // Check if the message enough info
                    if (message.length !== 3) {
                        socket.send(`ERR;;CLIENT;;Specify (only) a method, username and password.`);
                        socket.close();
                        return;
                    }

                    unlike(socket, message, clientPublickey);
                }
            });
        });
    });
};