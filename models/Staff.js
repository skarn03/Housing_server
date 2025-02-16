// models/Staff.js
const StaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['SuperAdmin', 'CD', 'GHD', 'RA'], required: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: function() { return this.role === 'RA'; } }
});

module.exports = mongoose.model('Staff', StaffSchema);