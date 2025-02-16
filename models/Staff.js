const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['SuperAdmin', 'CD', 'GHD', 'RA'], default: 'RA', required: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: false }
});

module.exports = mongoose.model('Staff', StaffSchema);