const mongoose = require('mongoose');

const HousingAccessSchema = new mongoose.Schema({
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    domain: { type: String },
    superAdmin: {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    }
});

module.exports = mongoose.model('HousingAccess', HousingAccessSchema);
