// routes/staffRoutes.js
const express = require("express");
const { getAllStaff, addStaff } = require("../controllers/staffController");
const checkAuth = require("../middleware/checkAuth"); // Authentication
const checkRole = require("../middleware/checkRole"); // Role-based
const router = express.Router();

// ✅ GET all staff for a specific university
router.get("/university", checkAuth, checkRole("CD"), getAllStaff);

// ✅ POST to add a new staff member
router.post("/add", checkAuth, checkRole("CD"), addStaff);

module.exports = router;
