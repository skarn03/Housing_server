const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    domain:{type:String},
    buildings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Building' }],
    studentConnectionNoteOptions: [{ type: String, default: ['Housing', 'Academics', 'Follow-Up', 'General'] }]
});

module.exports = mongoose.model('University', UniversitySchema);
