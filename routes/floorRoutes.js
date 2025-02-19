const express = require("express");
const router = express.Router();
const { initializeBuildings } = require("../controllers/floorController");

// Route to initialize buildings and floors
router.post("/initializeBuildings", initializeBuildings);

module.exports = router;
