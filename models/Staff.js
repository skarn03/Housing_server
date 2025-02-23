const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    firstName:{type:String},
    middleName:{type:String},
    lastName:{type:String},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['SuperAdmin', 'CD', 'GHD', 'RA'], default: 'RA', required: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: false },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true }, // Ensure this exists
    incidentReports:{type:mongoose.Schema.Types.ObjectId,ref:'incidentReport'}
});

module.exports = mongoose.model('Staff', StaffSchema);
