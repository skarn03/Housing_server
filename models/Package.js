const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    trackingNumber: { type: String, unique: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    parcelType: { 
        type: String, 
        required: true,
        enum: [
            "Box/Bag - Large and Up",
            "Box/Bag - Medium",
            "Box/Bag - Small",
            "Care Package",
            "Conduct Letter",
            "Envelope-Financial Doc/Cards",
            "Envelope-IRS Document",
            "Envelope-Large",
            "Other-add type to comments",
            "Perishable-Flowers",
            "Perishable-Food",
            "Perishable-Other"
        ] 
    },
    shippingType: { 
        type: String, 
        required: true,
        enum: [
            "DHL",
            "FedEx",
            "Metro Delivery",
            "Other",
            "UPS",
            "USPS"
        ] 
    },
    receiptDate: { type: Date, required: true, default: Date.now }, // Default to today's date
    receiptTime: { type: String, required: true, default: () => new Date().toLocaleTimeString() }, // Default to current time
    status: { 
        type: String, 
        enum: ["Logged In", "Logged Out", "Lost"], 
        default: "Logged In" 
    }, // New Status Field
    comments: { type: String },
    building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', PackageSchema);
