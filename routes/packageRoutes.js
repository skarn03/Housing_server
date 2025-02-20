const express = require("express");
const { addPackage, getPackages, getPackageById, deletePackage } = require("../controllers/packageController");
const checkAuth = require("../middleware/checkAuth"); // Authentication Middleware
const checkRole = require("../middleware/checkRole"); // Role-Based Middleware

const router = express.Router();

// ✅ Add a package (Requires Staff or Higher Role)
router.post("/add", checkAuth, checkRole("Staff"), addPackage);

// ✅ Get all packages (Requires RA or Higher Role)
router.get("/all", checkAuth, checkRole("RA"), getPackages);

// ✅ Get a specific package by ID (Requires RA or Higher Role)
router.get("/:packageId", checkAuth, checkRole("RA"), getPackageById);

// ✅ Delete a package (Requires GHD or Higher Role)
router.delete("/:packageId", checkAuth, checkRole("GHD"), deletePackage);

module.exports = router;
