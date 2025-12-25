require('dotenv').config()

const options = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gar',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    charset: 'utf8',
    client_encoding: 'UTF8'
}

module.exports = options