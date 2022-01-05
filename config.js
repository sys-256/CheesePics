module.exports = {
    "database": {
        "main": {
            "url": "./app.db"
        },
        "salt": {
            "url": "./salt.db"
        }
    },
    "port": {
        "http": 8070,
        "websocket": 8071
    },
    "regex": {
        "username": /^[A-Za-z0-9_-\p{L}]{3,15}$/g,
        "password": /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{8,40}$/g
    }
}