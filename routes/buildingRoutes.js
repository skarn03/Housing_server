const express = require("express");
const router = express.Router();
const { getBuildings, addBuilding, updateBuilding, deleteBuilding } = require("../controllers/buildingController");
const checkAuth = require("../middleware/checkAuth");
const checkRole = require("../middleware/checkRole");

 router.use(checkAuth);

// ✅ GET all buildings for university
router.get("/getBuildings", checkRole("SuperAdmin"), getBuildings);

// ✅ ADD a new building with floors
router.post("/add", checkRole("SuperAdmin"), addBuilding);

// ✅ UPDATE building name & add/remove floors
router.put("/update/:buildingId", checkRole("SuperAdmin"), updateBuilding);

// ✅ DELETE a building & its floors
router.delete("/delete/:buildingId", checkRole("SuperAdmin"), deleteBuilding);

module.exports = router;
