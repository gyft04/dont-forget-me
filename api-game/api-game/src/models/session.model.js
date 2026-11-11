import mongoose from 'mongoose'

// In einer Session wird der Zustand jedes Eintrags separat gespeichert.
const sessionItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    code: { type: String, required: true },
    checked: { type: Boolean, default: false },
  },
  { _id: false },
)

const sessionSchema = new mongoose.Schema(
  {
    checklistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist', required: true },
    checklistName: { type: String, required: true },
    items: { type: [sessionItemSchema], default: [] },
    doorOpened: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['running', 'ready', 'alert', 'success'],
      default: 'running',
    },
  },
  { timestamps: true, versionKey: false },
)

export default mongoose.models.Session || mongoose.model('Session', sessionSchema)
