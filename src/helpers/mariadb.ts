// Get variables from config.json
import { config } from "../../config.js";
// Import packages
import * as mariadb from "mysql";

const database: mariadb.Pool = mariadb.createPool({
    host: config.database.url,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: `cheesepics`,
});

const addUserToDatabase = async (
    username: string,
    password: string,
    salt: string,
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        database.query(
            `INSERT INTO login (username, password, salt, liked) VALUES ('${username}', '${password}', '${salt}', '0');`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            },
        );
    });
};

const checkUserExistsInDB = async (username: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        database.query(
            `SELECT username FROM login WHERE username='${username}';`,
            (error, results) => {
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
            },
        );
    });
};

const getSaltFromDB = async (username: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        database.query(
            `SELECT salt FROM login WHERE username='${username}';`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (results.length === 0) {
                    reject(`No salt found for username.`);
                    return;
                }
                if (results.length > 1) {
                    reject(`Multiple salts found for username.`);
                    return;
                }
                resolve(results[0].salt);
            },
        );
    });
};

const getPasswdByUsernameFromDB = async (username: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        database.query(
            `SELECT password FROM login WHERE username='${username}';`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (results.length === 0) {
                    reject(`No password found for username.`);
                    return;
                }
                if (results.length > 1) {
                    reject(`Multiple passwords found for username.`);
                    return;
                }
                resolve(results[0].password);
            },
        );
    });
};

const getRandomImage = async (): Promise<{
    ID: string;
    license: string;
    author: string;
}> => {
    return new Promise((resolve, reject) => {
        database.query(
            `SELECT ID, license, author FROM images ORDER BY RAND() LIMIT 1;`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results[0]);
            },
        );
    });
};

const checkImageExists = async (image: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        database.query(
            `SELECT ID FROM images WHERE ID='${image}';`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (results.length === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
                return;
            },
        );
    });
};

const checkLikeExists = async (
    username: string,
    image: string,
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        database.query(
            `SELECT liked FROM login WHERE username='${username}';`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (results.length === 0) {
                    reject(`This user doesn't exist.`);
                    return;
                }
                if (results.length > 1) {
                    reject(`Multiple users found for username.`);
                    return;
                }
                const result = results[0].liked.split(`,`);
                if (result.includes(image)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                return;
            },
        );
    });
};

const addLikeToDatabase = async (
    username: string,
    image: string,
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        database.query(
            `UPDATE login SET liked=CONCAT(liked, ',${image}') WHERE username='${username}';`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(true);
            },
        );
    });
};

const removeLikeFromDatabase = async (
    username: string,
    image: string,
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        database.query(
            `SELECT liked from login WHERE username='${username}';`,
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (results.length === 0) {
                    reject(`This user doesn't exist.`);
                    return;
                }
                if (results.length > 1) {
                    reject(`Multiple users found for username.`);
                    return;
                }
                const result = results[0].liked.split(`,`);
                const newResult = result.filter(
                    (item: string) => item !== image,
                );
                database.query(
                    `UPDATE login SET liked='${newResult}' WHERE username='${username}';`,
                    (error, results) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(true);
                    },
                );
            },
        );
    });
};

export {
    addUserToDatabase,
    checkUserExistsInDB,
    getSaltFromDB,
    getPasswdByUsernameFromDB,
    getRandomImage,
    checkImageExists,
    checkLikeExists,
    addLikeToDatabase,
    removeLikeFromDatabase,
};
