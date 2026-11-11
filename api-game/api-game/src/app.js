import express from 'express'
import cors from 'cors'
import apiRouter from './routes/api.route.js'

const app = express()

// Middleware für JSON-Anfragen und Zugriffe vom getrennt gestarteten Frontend.
app.use(cors())
app.use(express.json())
app.use('/api', apiRouter)

// Zentrale Fehlerbehandlung, damit Controller Fehler einheitlich zurückgeben.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 1, data: err.message || 'Internal server error' })
})

export default app
