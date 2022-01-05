module.exports.base64decode = (message) => {
    return Buffer.from(message, "base64").toString("utf-8");
}

module.exports.base64encode = (message) => {
    return Buffer.from(message, "utf-8").toString("base64");
}

module.exports.sha512 = (message) => {
    return require("crypto").createHash("sha512").update(message).digest("hex");
}