const mongoose = require('mongoose');

const packageLog = new mongoose.Schema({
    packages: [
        {
            package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
            present: { type: Boolean, default: true } // Indicates if the package is present or logged out
        }
    ],
    buildings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Building' }], // Associated buildings
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }, // Staff who created the log
    createdAt: { type: Date, default: Date.now }, // Timestamp when log was created
    updatedAt: { type: Date, default: Date.now },  // Timestamp for last update
    createdTime: { type: String, default: () => new Date().toLocaleTimeString() } // Defaults to current time
});

// Middleware to update `updatedAt` field before each save
packageLog.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('PackageLog', packageLog);
