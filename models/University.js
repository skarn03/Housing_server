const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    domain: { type: String },
    logo: { type: String },
    buildings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Building' }],
    staffs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }], // Added staff list
    students:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    studentConnectionNoteOptions: [{ type: String, default: ['Housing', 'Academics', 'Follow-Up', 'General'] }],
    incidentReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IncidentReport' }], // Reference to incident reports
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }] // Reference to packages
});

module.exports = mongoose.model('University', UniversitySchema);
