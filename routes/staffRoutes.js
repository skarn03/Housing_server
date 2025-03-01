const express = require("express");
const { getAllStaff } = require("../controllers/staffController");
const checkAuth = require("../middleware/checkAuth"); // Authentication Middleware
const checkRole = require("../middleware/checkRole"); // Role-Based Middleware
const router = express.Router();

// ✅ Route to get all staff members of a specific university
router.get("/university", checkAuth, checkRole("CD"), getAllStaff);

module.exports = router;
