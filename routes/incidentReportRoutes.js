const express = require('express');
const router = express.Router();
const checkAuth = require("../middleware/checkAuth"); // Authentication Middleware
const checkRole = require("../middleware/checkRole"); // Role-Based Middleware
const { createIncidentReport,getFilteredIncidentReports  } = require("../controllers/incidentReportController");

// GET /api/incidentreport/all
router.get('/all', checkAuth,checkRole("CD"), getFilteredIncidentReports);
// POST /add - Create a new incident report
router.post("/add",checkAuth, checkRole("RA"), createIncidentReport);

module.exports = router;
