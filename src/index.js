// Get variables from config.json
const config = require("../config.js");

// Import packages
const db = require("better-sqlite3")(config.database.main.url);
const salt_db = require("better-sqlite3")(config.database.salt.url);
const forge = require('node-forge');
const helper = require("./helper.js");
const Memcached = require("memcached");
const memcached = new Memcached().connect(`${config.memcached.url}:${config.memcached.port}`, (error, result) => {
    if (error) {
        console.log(`index.js: Failed to connect to memcached server: ${error}`);
        process.exit(1);
        return;
    }
});

const express = require("express");
const app = express();

app.use(express.static("public", { // Make images available
    "setHeaders": (response) => {
        response.set("Access-Control-Allow-Origin", "*"); // Enable requests from all sites
        //response.set("Cache-Control", "public, max-age=604800, must-revalidate"); // Cache images for 1 week
        response.set("X-Powered-By", "ur mom lmao");
    }
}));

app.set("view engine", "ejs"); // Set the view engine renderer to ejs
app.set("views", "dynamic") // Set ejs directory

app.get("/", (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    response.status(200).render("index.ejs", {
        "ranNum": Math.floor(Math.random() * 496 + 1)
    })
});

// Start the WebSocket server
require("./websocket.js");

// Start the HTTP server
app.listen(config.port.http, () => {
    console.log(`Listening for http connections on port ${config.port.http}`);
});