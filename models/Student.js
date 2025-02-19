const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    // Personal Information
    preferredName: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    picture: { type: String, default: "https://example.com/default-profile.png" }, // Profile picture URL

    // University Details
    studentNumber: { type: String, required: true, unique: true },
    entryID: { type: Number, unique: true }, // Auto-incremented
    classification: { type: String, enum: ['New', 'Returning', 'Transfer'] },
    entryStatus: { type: String, enum: ['In Room', 'Pending', 'Withdrawn','Moved Out'] },
    email: { type: String, required: true, unique: true },

    // Room & Housing Info
    building: { type: String, required: true },
    floor: { type: String },
    room: { type: String },
    typeLocation: { type: String }, // Example: Staff Room / Walton
    contractDates: { 
        start: { type: Date },
        end: { type: Date }
    },
    roomRate: { type: Number },
    
    // Associations
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
    incidentReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IncidentReport' }],
    studentConnectionNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentConnectionNote' }],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-increment entryID before saving a new student
StudentSchema.pre('save', async function (next) {
    if (!this.entryID) {
        const lastStudent = await mongoose.model('Student').findOne({}, {}, { sort: { entryID: -1 } });
        this.entryID = lastStudent && lastStudent.entryID ? lastStudent.entryID + 1 : 1; // Start from 1 if none exist
    }
    next();
});

module.exports = mongoose.model('Student', StudentSchema);
