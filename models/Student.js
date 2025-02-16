const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    floor: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
    complaints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }],
    generalNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GeneralNote' }]
});