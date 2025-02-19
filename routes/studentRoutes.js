const express = require("express");
const { addStudent ,getStudents} = require("../controllers/studentController");
const checkAuth = require("../middleware/checkAuth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// Only "GHD" or higher roles can add students
//checkRole goes for hierarchy , anything CD can do ,their higher ups can do that as well
router.post("/add", checkAuth, checkRole("GHD"), addStudent);
router.get("/getStudents", checkAuth, checkRole("RA"), getStudents);
module.exports = router;
