// Konfiguration über Umgebungsvariablen, damit keine Zugangsdaten
// oder projektspezifischen Werte direkt im Quellcode stehen müssen.
export const PORT = Number(process.env.PORT || 12345)
export const USE_MONGODB = String(process.env.USE_MONGODB || 'false').toLowerCase() === 'true'
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dontforgetme'
