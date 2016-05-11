var databases = {
    lytics: {
        development:{
            connectionLimit: 50,
            host: "localhost",
            user: "root",
            password: "302108",
            database: "hermeslytics"
        },
        production: {
            connectionLimit: 50,
            host: "localhost",
            user: "root",
            password: "hermes2015",
            database: "hermeslytics"
        }
    },
    hermes: {
        development: {
            connectionLimit: 50,
            host: "192.168.115.2",
            user: "hermes",
            password: "h3rm3s01!",
            database: "hermes5"
        },
        production: {
            connectionLimit: 50,
            host: "192.168.115.2",
            user: "hermes",
            password: "h3rm3s01!",
            database: "hermes5"
        }
    }
}

module.exports = databases;