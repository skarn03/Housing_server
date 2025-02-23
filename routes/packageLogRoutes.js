const express = require("express");
const { createPackageLog ,getFilteredPackageLogs} = require("../controllers/packageLogController");

const router = express.Router();
const checkAuth = require("../middleware/checkAuth"); // Authentication Middleware
const checkRole = require("../middleware/checkRole"); // Role-Based Middleware
// ✅ Route to create a new package log
router.use(checkAuth);
router.get("/all", checkAuth, checkRole("RA"), getFilteredPackageLogs);
router.post("/create",checkRole('RA') ,createPackageLog);
// Export the router
module.exports = router;
