module.exports = {
    "database": {
        "url": "./app.db"
    },
    "port": {
        "http": 8070,
        "websocket": 8071
    },
    "regex": {
        "username": /^[A-Za-z0-9_-]{3,15}$/g,
    }
}