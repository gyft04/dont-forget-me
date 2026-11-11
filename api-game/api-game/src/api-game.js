import mongoose from 'mongoose'
import app from './app.js'
import { PORT, USE_MONGODB, MONGODB_URI } from './commons/config.js'

// Im normalen Projektbetrieb kann MongoDB verwendet werden.
// Für die lokale Demo ist alternativ ein In-Memory-Modus vorgesehen.
if (USE_MONGODB) {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log(`MongoDB connected: ${MONGODB_URI}`)
  } catch (error) {
    console.error('MongoDB connection failed. Set USE_MONGODB=false to use demo mode.')
    console.error(error.message)
    process.exit(1)
  }
} else {
  console.log('Running in demo mode (in-memory data, no MongoDB required).')
}

// Der Server ist im lokalen Netzwerk erreichbar, damit auch der ESP32
// auf die REST-Schnittstelle zugreifen kann.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Don't Forget Me API listening on http://localhost:${PORT}`)
})
