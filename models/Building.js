const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    floors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Floor' }],
    students:[{type:mongoose.Schema.Types.ObjectId,ref:'Student'}]
    // students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    //Students can be retrieved by building.floors.populate(student)
});

module.exports = mongoose.model('Building', BuildingSchema);
