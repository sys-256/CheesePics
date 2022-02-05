// Get variables from config.json
import { config } from "../../config.js";
// Import packages
import * as mariadb from "mysql";

const login_db: mariadb.Pool = mariadb.createPool({
    "host": config.database.url,
    "port": config.database.port,
    "user": config.database.user,
    "password": config.database.password,
    "database": "cheesepics"
});

const addUserToDatabase = async (username: string, password: string, salt: string): Promise<string[] | string> => {
    return new Promise((resolve, reject) => {
        login_db.query(`INSERT INTO login (username, password, salt) VALUES ('${username}', '${password}', '${salt}');`, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}

const checkUserExistsInDB = async (username: string): Promise<boolean | string> => {
    return new Promise((resolve, reject) => {
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
                reject(false);
                return;
            }
            resolve(true);
        });
    });
}

const getSaltFromDB = async (username: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        login_db.query(`SELECT salt FROM login WHERE username='${username}';`, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            if (results.length === 0) {
                reject("No salt found for username.");
                return;
            }
            if (results.length > 1) {
                reject("Multiple salts found for username.");
                return;
            }
            resolve(results[0].salt);
        });
    });
};

const getPasswdByUsernameFromDB = async (username: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        login_db.query(`SELECT password FROM login WHERE username='${username}';`, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            if (results.length === 0) {
                reject("No password found for username.");
                return;
            }
            if (results.length > 1) {
                reject("Multiple passwords found for username.");
                return;
            }
            resolve(results[0].password);
        });
    });
};

const getRandomImage = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        login_db.query(`SELECT ID, license, author FROM images ORDER BY RAND() LIMIT 1;`, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            if (results.length === 0) {
                reject("No images found.");
                return;
            }
            if (results.length > 1) {
                reject("Multiple images found.");
                return;
            }
            resolve([results[0].ID, results[0].license, results[0].author]);
        });
    });
};

export { addUserToDatabase, checkUserExistsInDB, getSaltFromDB, getPasswdByUsernameFromDB, getRandomImage };