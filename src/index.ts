// Get variables from config.json
import { config } from "../config.js";

// Import packages
import Database from 'better-sqlite3'
const db = new Database(config.database.main.url);
const salt_db = new Database(config.database.salt.url);
import forge from 'node-forge';
import Memcached from "memcached";
const memcached = new Memcached(`${config.memcached.url}:${config.memcached.port}`);

import * as helper from "./helper.js";
import startWSServer from "./websocket.js";

import express from "express";
const app = express();

app.use(express.static("public", { // Make images available
    "setHeaders": (response: any) => {
        response.set("Access-Control-Allow-Origin", "*"); // Enable requests from all sites
        //response.set("Cache-Control", "public, max-age=604800, must-revalidate"); // Cache images for 1 week
        response.set("X-Powered-By", "ur mom lmao");
    }
}));

app.set("view engine", "ejs"); // Set the view engine renderer to ejs
app.set("views", "dynamic") // Set ejs directory

app.get("/", (request: any, response: any) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    response.status(200).render("index.ejs", {
        "ranNum": Math.floor(Math.random() * 496 + 1)
    })
});

app.get("/register", (request: any, response: any) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    response.status(200).render("register.ejs", {
        "ranNum": Math.floor(Math.random() * 496 + 1)
    })
});

// Start the WebSocket server
startWSServer();

// Start the HTTP server
app.listen(config.port.http, () => {
    console.log(`Listening for http connections on port ${config.port.http}`);
});