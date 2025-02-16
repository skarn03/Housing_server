// models/Floor.js
const FloorSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    residents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    ra: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
});

module.exports = mongoose.model('Floor', FloorSchema);