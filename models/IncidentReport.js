const mongoose = require('mongoose');

const IncidentReportSchema = new mongoose.Schema({
    reporter: {
        fullName: { type: String, required: true },
        position: { type: String },
        phoneNumber: { type: String },
        email: { type: String, required: true },
        physicalAddress: { type: String }
    },
    nature: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String },
    location: {
        type: String,
        enum: [
            "601 W Forest", "611 W Cross Lot", "611 W Cross-Psychology Clinic", "Academic Buildings",
            "Academic Dishonesty- No Building", "Administrative Buildings", "Administrative Offices",
            "Alexander Music Building", "Alexander Pay Lot", "Ann Street", "Anne Street Lot",
            "Apartments Parking", "Athletic Facilities", "Best Hall", "Best-Outside", "Boone Hall",
            "Bowen Field House", "Bowen Lot", "Bowman-Roosevelt Lot", "Briggs Hall",
            "Brown Apartments", "Brown-Outside", "Buell Hall", "Buell-Outside", "Central HRL Office",
            "Central Receiving", "Chippewa Club", "College of Business Structure", "College Place",
            "Common Ground Cafe @ Marshall Hall", "Convocation Center", "Cornell Court",
            "Cornell Courts Apartments", "Cornell Street", "Corporate Education Center",
            "Cross Street", "Department of Public Safety Office", "Dining Facilities",
            "Dining Services Office", "Downing Hall", "Downing-Outside", "E Circle Drive",
            "Eagle Crest Golf Club", "Eagles Cafe @ Alexander Music Building",
            "Eagles Cafe @ College of Business-remove", "Eagles Cafe @ Halle Library",
            "Eagles Cafe @ Mark Jefferson", "Eagles Cafe @ McKenny Hall",
            "Eagles Cafe @ Pray Harrold", "Eastbrook", "Eastern Eateries",
            "Failure to Comply-No Building", "Fletcher Lot", "Fletcher School",
            "Food for Thought @ Sill Hall", "Ford Hall", "Ford Lake", "Ford Lot A",
            "Ford Lot B", "Ford Reserved Lot", "Geddes Town Hall School House",
            "Green Lot 1", "Halle Library", "Hewitt", "Hill-Outside", "Hover Building",
            "Hoyt Hall", "Hoyt Lot", "Hoyt-Outside", "Huron River Drive",
            "Indoor Practice Facility", "Indoor Practice Facility Lot",
            "Jones Goddard", "Jones Pool", "Key Bank Lot", "King Hall", "Lake House",
            "Lakeview Hall", "Lowell", "Mark Jefferson Lot", "Mark Jefferson Science Building",
            "Market Place", "Marshall Building", "Mayhew", "Mayhew Lot 1", "Mayhew Lot 2",
            "McKenny Hall", "McKenny Staff Lot", "McKinney Pay Lot", "Munson Apartments",
            "Normal Reserved Lot", "Normal Street Lot", "North Campus Lot 1",
            "North Campus Lot 2", "Oakwood", "Oakwood Lot North", "Oakwood Lot South",
            "Oakwood Meters", "Oakwood Pay Lot", "Oestrike Stadium", "Off campus",
            "Olds-Marshall Track", "Olds-Robb Student Recreation Center",
            "Outside of a Building", "Owen Building-College of Business", "Parking Facilities",
            "Parking Structure", "Pease Auditorium", "Pease Lot", "Pease Pay Lot", "Perrin",
            "Phelps Hall", "Phelps-Outside", "Physical Plant Parking", "Pierce Hall",
            "Pittman Hall", "Pittman-Outside", "Porter Building", "Porter Park",
            "Pray-Harrold Classroom Building", "Pray-Harrold Metered Parking",
            "Putnam Hall", "Putnam-Outside", "Quirk Dramatic Arts Building/Theatre",
            "Rackham Building", "Residence Hall Metered Parking", "Return from Suspension",
            "Roosevelt Hall", "Rynearson Lot", "Rynearson Stadium", "Saint John",
            "Scicluna Field (Soccer Fields)", "Sculpture Studio", "Sellers Hall",
            "Sellers-Outside", "Sherzer Hall", "Sill Hall", "Sill Lot", "Smith Reserved Lot",
            "Snow Health Center-REMOVE, add Judy Sturgis Hill", "Snow Lot", "Softball Complex",
            "Sponberg Theatre", "Starbucks-Student Center", "Starkweather Hall",
            "Strong Physical Science Building", "Student Center", "Student Center Pay Lot",
            "Tennis Courts", "Terrestrial and Aquatics Research Facility",
            "The Commons", "The Village", "The Village-Outside", "University House",
            "University Housing Office-remove", "University Park", "Unknown",
            "Varsity Field", "via Electronic means", "W Circle Drive", "Walton Hall",
            "Walton-Outside", "Warner Gymnasium", "Washington Street Lot",
            "Washtenaw Avenue", "Welch Hall", "West Forest", "Westview", "Westview Hall",
            "Wise Hall", "Wise-Outside", "Women's Softball Field"
        ],
        required: true
    },
    specificLocation: { type: String },
    involvedParties: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        role: { 
            type: String, 
            enum: ['Respondant', 'complainant', 'Witness', 'student of concern'], 
            required: true 
        }
    }],
    description: { type: String, required: true },
    campusPoliceResponse: { type: String, enum: ['Yes', 'No', "I don't know"], required: true },
    incidentReportNumber: { type: String, unique: true }, // New unique field
    supportingDocuments: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Associated Staff
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IncidentReport', IncidentReportSchema);
