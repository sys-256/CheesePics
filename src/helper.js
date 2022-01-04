module.exports.base64decode = (message) => {
    return Buffer.from(message, "base64").toString("utf-8");
}

module.exports.base64encode = (message) => {
    return Buffer.from(message, "utf-8").toString("base64");
}