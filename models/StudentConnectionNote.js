const mongoose = require('mongoose');

const StudentConnectionNoteSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    notes: [{
        topic: { type: String, required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('StudentConnectionNote', StudentConnectionNoteSchema);
