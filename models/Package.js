const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    trackingNumber: { type: String, required: true, unique: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    parcelType: { type: String, required: true },
    shippingType: { type: String, required: true },
    emailReceiptFrom: { type: String, required: true },
    mailRoom: { type: String, required: true },
    receiptDate: { type: Date, required: true },
    description: { type: String },
    comments: { type: String },
    storageLocation: { type: String },
    receivedLocation: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Package', PackageSchema);
