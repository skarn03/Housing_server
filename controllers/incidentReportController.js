const IncidentReport = require('../models/IncidentReport');

const createIncidentReport = async (req, res) => {
    // try {
    //     // Extract and parse fields from req.body:
    //     const {
    //         reporter,
    //         nature,
    //         date,
    //         time,
    //         location,
    //         specificLocation,
    //         description,
    //         campusPoliceResponse,
    //         reportNumber
    //     } = req.body;

    //     // Parse the reporter field (sent as a JSON string)
    //     let parsedReporter;
    //     try {
    //         parsedReporter = JSON.parse(reporter);
    //     } catch (err) {
    //         return res.status(400).json({ success: false, message: 'Invalid reporter data' });
    //     }

    //     // Parse involvedParties, which may be sent as multiple fields.
    //     let parsedInvolvedParties = [];
    //     if (req.body.involvedParties) {
    //         // req.body.involvedParties might be a single string or an array of strings
    //         if (Array.isArray(req.body.involvedParties)) {
    //             parsedInvolvedParties = req.body.involvedParties.map(partyStr => JSON.parse(partyStr));
    //         } else {
    //             parsedInvolvedParties = [JSON.parse(req.body.involvedParties)];
    //         }
    //     }

    //     // supportingDocuments should already be URLs (or an array of URLs)
    //     let supportingDocuments = [];
    //     if (req.body.supportingDocuments) {
    //         if (Array.isArray(req.body.supportingDocuments)) {
    //             supportingDocuments = req.body.supportingDocuments;
    //         } else {
    //             supportingDocuments = [req.body.supportingDocuments];
    //         }
    //     }

    //     // Create a new IncidentReport document
    //     const newIncidentReport = new IncidentReport({
    //         reporter: parsedReporter,
    //         nature,
    //         date,
    //         time,
    //         location,
    //         specificLocation,
    //         description,
    //         campusPoliceResponse,
    //         reportNumber,
    //         involvedParties: parsedInvolvedParties,
    //         supportingDocuments
    //     });

    //     await newIncidentReport.save();

    //     res.status(201).json({
    //         success: true,
    //         message: 'Incident report created successfully',
    //         data: newIncidentReport,
    //     });
    // } catch (error) {
    //     console.error('Error creating incident report:', error);
    //     res.status(500).json({
    //         success: false,
    //         message: 'Server error while creating incident report',
    //         error: error.message,
    //     });
    // }
    console.log("here");
};

module.exports={createIncidentReport};