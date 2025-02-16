const mongoose = require('mongoose');

const IncidentReportSchema = new mongoose.Schema({
    reporter: {
        fullName: { type: String, required: true },
        position: { type: String },
        phoneNumber: { type: String },
        email: { type: String, required: true },
        physicalAddress: { type: String }
    },
    nature: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String, required: true },
    specificLocation: { type: String },
    involvedParties: [{
        studentName: { type: String, required: true },
        role: { type: String, required: true },
        idNumber: { type: String }
    }],
    description: { type: String, required: true },
    campusPoliceResponse: { type: String, enum: ['Yes', 'No', "I don't know"], required: true },
    reportNumber: { type: String },
    supportingDocuments: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncidentReport', IncidentReportSchema);