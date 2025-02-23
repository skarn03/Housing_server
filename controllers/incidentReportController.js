const IncidentReport = require('../models/IncidentReport');
const University = require('../models/University');
const Student = require('../models/Student');

const createIncidentReport = async (req, res) => {
    try {
        console.log("📥 Incoming request to create incident report...");
        console.log("📝 Request body:", req.body);

        // Extract fields from req.body:
        const {
            reporter,
            nature,
            date,
            time,
            location,
            specificLocation,
            description,
            campusPoliceResponse,
            reportNumber,
            involvedParties,
            supportingDocuments
        } = req.body;

        console.log("✅ Extracted fields from request body.");

        // Handle reporter field (if it's a JSON string, parse it)
        let parsedReporter = reporter;
        if (typeof reporter === "string") {
            try {
                parsedReporter = JSON.parse(reporter);
                console.log("✅ Parsed reporter:", parsedReporter);
            } catch (err) {
                console.error("❌ Invalid reporter data:", err);
                return res.status(400).json({ success: false, message: 'Invalid reporter data' });
            }
        } else {
            console.log("✅ Reporter is already an object:", parsedReporter);
        }

        // Handle involvedParties - each element should contain a "student" and a "role"
        let parsedInvolvedParties = [];
        if (involvedParties) {
            if (Array.isArray(involvedParties)) {
                parsedInvolvedParties = involvedParties.map(party => {
                    if (typeof party === "string") {
                        try {
                            return JSON.parse(party);
                        } catch (err) {
                            console.error("❌ Error parsing involvedParties element:", err);
                            throw new Error('Invalid involvedParties data');
                        }
                    }
                    return party;
                });
            } else if (typeof involvedParties === "string") {
                try {
                    parsedInvolvedParties = [JSON.parse(involvedParties)];
                } catch (err) {
                    console.error("❌ Error parsing involvedParties:", err);
                    return res.status(400).json({ success: false, message: 'Invalid involvedParties data' });
                }
            } else {
                parsedInvolvedParties = [involvedParties];
            }
            console.log("✅ Parsed involvedParties:", parsedInvolvedParties);
        }

        // Process supportingDocuments to ensure it's an array
        let processedSupportingDocuments = [];
        if (supportingDocuments) {
            if (Array.isArray(supportingDocuments)) {
                processedSupportingDocuments = supportingDocuments;
            } else {
                processedSupportingDocuments = [supportingDocuments];
            }
            console.log("✅ Processed supportingDocuments:", processedSupportingDocuments);
        }

        console.log("🛠 Creating new incident report...");
        const newIncidentReport = new IncidentReport({
            reporter: parsedReporter,
            nature,
            date,
            time,
            location,
            specificLocation,
            description,
            campusPoliceResponse,
            reportNumber,
            involvedParties: parsedInvolvedParties,
            supportingDocuments: processedSupportingDocuments,
            // Use a single staff ObjectId for createdBy (set by your auth middleware)
            createdBy: req.userData && req.userData.userID ? req.userData.userID : null
        });

        console.log("📦 Saving incident report to database...");
        await newIncidentReport.save();
        console.log("✅ Incident report saved successfully!");

        // Add the incident report to the University document, if provided.
        if (req.userUniversity) {
            await University.findByIdAndUpdate(req.userUniversity, { 
                $push: { incidentReports: newIncidentReport._id } 
            });
            console.log("✅ Incident report added to University");
        } else {
            console.warn("⚠️ req.userUniversity not provided; incident report not added to University");
        }

        // Update each involved student by adding the incident report to their incidentReports array.
        if (parsedInvolvedParties && parsedInvolvedParties.length > 0) {
            await Promise.all(parsedInvolvedParties.map(async (party) => {
                // party.student is expected to be the ObjectId (string) of the student.
                await Student.findByIdAndUpdate(party.student, { 
                    $push: { incidentReports: newIncidentReport._id } 
                });
            }));
            console.log("✅ Incident report added to involved students");
        } else {
            console.warn("⚠️ No involved parties provided; incident report not added to any students");
        }

        res.status(201).json({
            success: true,
            message: 'Incident report created successfully',
            data: newIncidentReport,
        });
    } catch (error) {
        console.error("❌ Server error while creating incident report:", error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating incident report',
            error: error.message,
        });
    }

    console.log("📤 Response sent. Incident report creation process complete.");
};

module.exports = { createIncidentReport };
