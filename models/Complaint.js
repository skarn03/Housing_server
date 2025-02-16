const ComplaintSchema = new mongoose.Schema({
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);