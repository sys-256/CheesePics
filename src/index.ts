// Get variables from config.json
import { config } from "../config.js";

// Import packages
import Database from 'better-sqlite3';
const sessionsDB = new Database(config.sessions.url);
import forge from 'node-forge';
import cookie_parser from "cookie-parser";

import * as helper from "./helper.js";
import { startWSServer } from "./websocket.js";

import express from "express";
const app = express();

// Parse cookies
app.use(cookie_parser());

app.use(express.static("public", { // Make images available
    "setHeaders": (response) => {
        response.set("Access-Control-Allow-Origin", "*"); // Enable requests from all sites
        response.set("Cache-Control", "public, max-age=604800, must-revalidate"); // Cache images for 1 week
        response.set("X-Powered-By", "ur mom lmao");
    }
}));

app.set("view engine", "ejs"); // Set the view engine renderer to ejs
app.set("views", "dynamic") // Set ejs directory

app.get("/", async (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    // Get a image entry from the database
    const image = await helper.mariadb.getRandomImage();

    if (request.cookies.sessionID && request.cookies.sessionID.length === 24) {
        // Check if the sessionID is valid
        const sessionID: string = request.cookies.sessionID;
        const dbResult: any[] = sessionsDB.prepare(`SELECT username, expires FROM sessions WHERE ID='${sessionID}'`).all();
        if (dbResult.length === 0 || dbResult.length > 1 || dbResult[0].expires < Date.now()) {
            response.clearCookie("sessionID");
        } else {
            response.status(200).render("loggedIn/index.ejs", {
                "imageID": image.ID,
                "license": image.license,
                "author": image.author,
            });
            return;
        }
    }

    response.status(200).render("loggedOut/index.ejs", {
        "imageID": image.ID,
        "license": image.license,
        "author": image.author,
    });

});

app.get("/api", async (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    response.status(200).send((await helper.mariadb.getRandomImage()));
});

app.get("/account", async (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    if (request.cookies.sessionID && request.cookies.sessionID.length === 24) {
        // Check if the sessionID is valid
        const sessionID: string = request.cookies.sessionID;
        const dbResult: any[] = sessionsDB.prepare(`SELECT username, expires FROM sessions WHERE ID='${sessionID}'`).all();
        if (dbResult.length === 0 || dbResult.length > 1 || dbResult[0].expires < Date.now()) {
            response.clearCookie("sessionID");
        } else {
            response.status(200).render("loggedIn/account.ejs", {
                "username": await new helper.crypto.base64(dbResult[0].username).decode().catch()
            });
            return;
        }
    }

    response.status(200).render("logInToView.ejs", {});
});

app.get("/register", (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    if (request.cookies.sessionID && request.cookies.sessionID.length === 24) {
        // Check if the sessionID is valid
        const sessionID: string = request.cookies.sessionID;
        const dbResult: any[] = sessionsDB.prepare(`SELECT username, expires FROM sessions WHERE ID='${sessionID}'`).all();
        if (dbResult.length === 0 || dbResult.length > 1 || dbResult[0].expires < Date.now()) {
            response.clearCookie("sessionID");
        } else {
            response.status(200).render("logOutToView.ejs", {
                "ranNum": Math.floor(Math.random() * 496 + 1)
            });

            return;
        }
    }

    response.status(200).render("loggedOut/register.ejs", {
        "contact": config.contact
    });
});

app.get("/login", (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    if (request.cookies.sessionID && request.cookies.sessionID.length === 24) {
        // Check if the sessionID is valid
        const sessionID: string = request.cookies.sessionID;
        const dbResult: any[] = sessionsDB.prepare(`SELECT username, expires FROM sessions WHERE ID='${sessionID}'`).all();
        if (dbResult.length === 0 || dbResult.length > 1 || dbResult[0].expires < Date.now()) {
            response.clearCookie("sessionID");
        } else {
            response.status(200).render("logOutToView.ejs", {
                "ranNum": Math.floor(Math.random() * 496 + 1)
            });

            return;
        }
    }

    response.status(200).render("loggedOut/login.ejs", {
        "contact": config.contact,
        "cookieMaxAge": config.cookies.maxAge
    });
});

app.get("/setCookie", (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    // Check if enough data was specified
    if (!request.query.value) {
        response.status(400).send({
            "success": false,
            "error": "Not enough data specified"
        });
        return;
    }

    response.cookie("sessionID", request.query.value, {
        "maxAge": config.cookies.maxAge, // 1 day
        "path": config.cookies.path, // Use the cookie on all paths
        "secure": true, // Only use the cookie over HTTPS
        "httpOnly": true, // Don't allowed to be messed with by client side JavaScript
        "sameSite": "strict", // Don't send the cookie to other sites
    });

    response.status(200).send({
        "success": true,
        "error": undefined
    });
});

app.get("/setTempCookie", (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    // Check if enough data was specified
    if (!request.query.value) {
        response.status(400).send({
            "success": false,
            "error": "Not enough data specified"
        });
        return;
    }

    response.cookie("sessionID", request.query.value, {
        "path": config.cookies.path, // Use the cookie on all paths
        "secure": true, // Only use the cookie over HTTPS
        "httpOnly": true, // Don't allowed to be messed with by client side JavaScript
        "sameSite": "strict", // Don't send the cookie to other sites
    });

    response.status(200).send({
        "success": true,
        "error": undefined
    });
});

app.get("/logout", (request, response) => {
    response.header({
        "Access-Control-Allow-Origin": "*", // Enable requests from all sites
        "Cache-Control": "no-cache, no-store, must-revalidate", // Disable caching
        "X-Powered-By": "ur mom lmao"
    });

    response.clearCookie("sessionID");

    response.status(302).redirect("/");
});

// Start the WebSocket server
startWSServer();

// Start the HTTP server
app.listen(config.port.http, () => {
    console.log(`Listening for http connections on port ${config.port.http}`);
});