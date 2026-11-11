import mongoose from 'mongoose'

// Ein Checklisteneintrag besitzt einen Anzeigenamen und einen kurzen Code,
// der auch für die Kommunikation mit dem Hardware-Teil genutzt werden kann.
const checklistItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, maxlength: 4, trim: true },
  },
  { _id: false },
)

// Pro Checkliste kann festgelegt werden, ob sie aktuell aktiv ist.
const checklistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    items: { type: [checklistItemSchema], default: [] },
    active: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
)

export default mongoose.models.Checklist || mongoose.model('Checklist', checklistSchema)
