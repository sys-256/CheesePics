// Get variables from config.json
import { config } from "../../config.js";
// Import packages
import * as mariadb from "mysql";

const login_db: mariadb.Pool = mariadb.createPool({
    "host": config.database.host,
    "port": config.database.port,
    "user": config.database.user,
    "password": config.database.password,
    "database": "cheesepics"
});

const addUserToDatabase = async (username: string, password: string, salt: string): Promise<any> => {
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

const checkUserExistsInDB = async (username: string): Promise<any> => {
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
                reject("Multiple results found for username.");
                return;
            }
            resolve(true);
        });
    });
}

const getSaltFromDB = async (username: string): Promise<any> => {
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

const getPasswdByUsernameFromDB = async (username: string): Promise<any> => {
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

export { addUserToDatabase, checkUserExistsInDB, getSaltFromDB, getPasswdByUsernameFromDB };