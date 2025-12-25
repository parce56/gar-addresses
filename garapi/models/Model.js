const dbConfig = require('../db/config')
const { Pool } = require('pg')

const pool = new Pool(dbConfig)

pool.on('error', (error) => {
  console.error('Ошибка соединения с базой данных:', error)
})

process.on('exit', () => {
  pool.end()
  console.log('Соединение с базой данных закрыто.')
})

class Model {
  constructor() {
    this.pool = pool
    this.schema = process.env.DB_SCHEMA || 'public'
  }

  async query(text, params = []) {
    const client = await this.pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } catch (error) {
      console.error('Ошибка выполнения запроса к базе данных:', error)
      throw error
    } finally {
      client.release()
    }
  }

}

module.exports = Model