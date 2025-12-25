const dbConfig = require('../db/config')
const { Pool } = require('pg')

const pool = new Pool(dbConfig)

process.on('exit', () => {
    pool.end()
})

class Model {
    constructor() {
        this.pool = pool
        this.schema = process.env.DB_SCHEMA || 'public'
    }

    async query(text, params) {
        const client = await this.pool.connect()
        try {
            return await client.query(text, params)
        } catch (error) {
            console.error(error)
            throw error
        }        
        finally {
            client.release()
        }
    }
}

module.exports = Model
