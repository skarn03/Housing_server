// models/GeneralNote.js
const GeneralNoteSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
