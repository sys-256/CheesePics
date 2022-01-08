const config = require("../config.js");

module.exports.base64decode = (message) => {
    return Buffer.from(message, "base64").toString("utf-8");
}

module.exports.base64encode = (message) => {
    return Buffer.from(message, "utf-8").toString("base64");
}

module.exports.sha512 = (message) => {
    return require("crypto").createHash("sha512").update(message).digest("hex");
}

module.exports.pbkdf2 = (password, salt) => {
    return require("crypto").pbkdf2Sync(password, salt, config.pbkdf2.iterations, config.pbkdf2.keyLength, config.pbkdf2.algorithm).toString("hex");
}

module.exports.generateSalt = (passwordLength) => {
    return require("crypto").randomBytes(passwordLength + (Math.floor((Math.random() * 30) + 10)) / 2).toString("hex");
}