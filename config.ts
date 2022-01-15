export const config:any = {
    "database": {
        "url": "localhost",
        "port": 3306,
        "user": "root",
        "password": "passwd"
    },
    "sessions": {
        "url": "./sessions.db"
    },
    "port": {
        "http": 8030,
        "websocket": 8031
    },
    "regex": {
        "username": /^[A-Za-z0-9_-\p{L}]{3,15}$/g,
        "password": /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{8,40}$/g
    },
    "rsa": {
        "bits": 1024,
        "workers": 5
    },
    "pbkdf2": {
        "iterations": 25000,
        "keyLength": 128,
        "algorithm": "sha512"
        
    },
    "session": {
        "expires": 604800
    },
    "memcached": {
        "host": "localhost",
        "port": 11211
    },
    "contact": "Hoiboy19#0920 on Discord"
}