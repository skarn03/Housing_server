const IncidentReport = require('../models/IncidentReport');
const University = require('../models/University');
const Student = require('../models/Student');
const mongoose = require("mongoose");
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

        // Determine the new incidentReportNumber (last number + 1, or 1 if none exists)
        console.log("🔎 Fetching last incidentReportNumber...");
        const lastReport = await IncidentReport.findOne().sort({ incidentReportNumber: -1 });
        let newNumber = 1;
        if (lastReport && lastReport.incidentReportNumber) {
            newNumber = parseInt(lastReport.incidentReportNumber) + 1;
        }
        console.log("✅ New incidentReportNumber determined:", newNumber);

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
            incidentReportNumber: newNumber.toString(),
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

const getFilteredIncidentReports = async (req, res) => {
    try {
        console.log("📡 [START] Fetching filtered incident reports...");
        console.log("🔍 Request Query Parameters:", req.query);

        // Extract query parameters, including reportNumber
        const { staff, location, student, reportNumber, page = 1, limit = 20 } = req.query;
        console.log("📋 Extracted Parameters:", { staff, location, student, reportNumber, page, limit });

        // Build the filter object
        let filter = {};
        console.log("🛠 Initial filter object:", filter);

        // Filter by location if provided
        if (location && location.trim() !== "") {
            filter.location = location;
            console.log("✅ Added location filter:", location);
        } else {
            console.log("ℹ️ No location filter applied");
        }

        // Filter by reporter full name (staff filter)
        if (staff && staff.trim() !== "") {
            filter["reporter.fullName"] = { $regex: staff, $options: "i" };
            console.log("✅ Added staff filter on reporter.fullName:", staff);
        } else {
            console.log("ℹ️ No staff filter applied");
        }

        // Filter by incidentReportNumber if provided (instead of reportNumber)
        if (reportNumber && reportNumber.trim() !== "") {
            filter.incidentReportNumber = { $regex: reportNumber, $options: "i" };
            console.log("✅ Added incidentReportNumber filter:", reportNumber);
        } else {
            console.log("ℹ️ No incidentReportNumber filter applied");
        }

        // Filter by student:
        if (student && student.trim() !== "") {
            if (/^[0-9a-fA-F]{24}$/.test(student)) {
                filter["involvedParties.student"] = new mongoose.Types.ObjectId(student);
                console.log("✅ Added student filter on involvedParties.student as ObjectId:", student);
            } else {
                filter.involvedParties = {
                    $elemMatch: { studentName: { $regex: student, $options: "i" } }
                };
                console.log("✅ Added student filter on involvedParties.studentName via $elemMatch:", student);
            }
        } else {
            console.log("ℹ️ No student filter applied");
        }

        // Calculate pagination variables
        const skip = (page - 1) * limit;
        console.log("📊 Pagination: page =", page, "limit =", limit, "skip =", skip);

        // Count total documents matching filter
        console.log("⏱ Counting total incident reports matching filter...");
        const totalLogs = await IncidentReport.countDocuments(filter);
        console.log("✅ Total Logs Found:", totalLogs);

        const totalPages = Math.ceil(totalLogs / limit);
        console.log("📊 Total Pages Calculated:", totalPages);

        // Query the database with filters, pagination, and populate required fields
        console.log("⏳ Querying IncidentReport collection with filters:", filter);
        const logs = await IncidentReport.find(filter)
            .populate("createdBy", "firstName lastName email")
            .populate({
                path: "involvedParties.student",
                select: "firstName lastName studentNumber picture building room",
            })
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        console.log("✅ Retrieved Logs:", logs);

        console.log(`✅ Found ${logs.length} incident reports on page ${page} of ${totalPages}`);
        res.status(200).json({
            logs,
            totalPages,
            currentPage: parseInt(page),
            totalLogs,
        });
        console.log("📤 Response sent successfully.");
    } catch (error) {
        console.error("❌ Error fetching incident reports:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching incident reports",
            error: error.message,
        });
    }
};

module.exports = { getFilteredIncidentReports };


module.exports = { getFilteredIncidentReports };


module.exports = { createIncidentReport, getFilteredIncidentReports };
