const express = require("express");
const { addStudent, getStudents, getStudentById } = require("../controllers/studentController");
const checkAuth = require("../middleware/checkAuth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// ✅ Only "GHD" or higher roles can add students
router.post("/add", checkAuth, checkRole("GHD"), addStudent);

// ✅ "RA" or higher roles can retrieve students list
router.get("/getStudents", checkAuth, checkRole("RA"), getStudents);

// ✅ "RA" or higher roles can fetch a single student profile
router.get("/:studentID", checkAuth, checkRole("RA"), getStudentById);

module.exports = router;
