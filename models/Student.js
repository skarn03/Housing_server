const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
    incidentReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IncidentReport' }],
    studentConnectionNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentConnectionNote' }]
});

module.exports = mongoose.model('Student', StudentSchema);
