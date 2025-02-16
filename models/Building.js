const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    floors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Floor' }]
});

module.exports = mongoose.model('Building', BuildingSchema);
