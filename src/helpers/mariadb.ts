// Get variables from config.json
import { config } from "../../config.js";
// Import packages
import * as mariadb from "mysql";

const login_db: mariadb.Connection = mariadb.createConnection({
    "host": config.database.host,
    "port": config.database.port,
    "user": config.database.user,
    "password": config.database.password,
    "database": "cheesepics"
});

const addUserToDatabase = async (username: string, password: string, salt: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        login_db.connect((error) => {
            if (error) {
                reject(`Error connecting to database: ${error}`);
            }
        })
        login_db.query(`INSERT INTO login (username, password, salt) VALUES ('${username}', '${password}', '${salt}');`, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
            login_db.end();
        });
    });
}

const checkUserExistsInDB = async (username: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        login_db.connect((error) => {
            if (error) {
                reject(`Error connecting to database: ${error}`);
            }
        })
        login_db.query(`SELECT username FROM login WHERE username='${username}';`, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            if (results.length === 0) {
                resolve(false);
                return;
            }
            if (results.length > 1) {
                reject("Multiple results found for username.");
                return;
            }
            resolve(true);
            login_db.end();
        });
    });
}


export { addUserToDatabase, checkUserExistsInDB };