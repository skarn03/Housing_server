const mongoose = require('mongoose');

const FloorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    residents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    ra: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }]
});

module.exports = mongoose.model('Floor', FloorSchema);
