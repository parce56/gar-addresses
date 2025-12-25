const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const basicAuth = require('basic-auth')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors({
  origin: '*',
  methods: ['GET']
}))
app.use(helmet())

if (process.env.AUTH_BASIC === 'true') {
  app.use((req, res, next) => {
    const user = basicAuth(req)
    if (!user || user.name !== process.env.BASIC_LOGIN || user.pass !== process.env.BASIC_PASSWORD) {
      res.set('WWW-Authenticate', 'Basic realm="Authorization Required"')
      return res.status(401).send('Authorization Required')
    }    
    next()
  })
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', require('./routes/addresses'))


app.use((error, req, res, next) => {
  console.error(error.stack)
  res.status(500).json({ error: 'Что-то пошло не так.' })
})

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}.`)
})