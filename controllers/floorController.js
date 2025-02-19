const Floor = require("../models/Floor");
const Building = require("../models/Building");

// Controller function to initialize buildings and floors
const initializeBuildings = async (req, res) => {
    try {
        const universityId = "67b4f23e7301122df88a7905";
        if (!universityId) {
            return res.status(400).json({ error: "University ID is required" });
        }

        const buildingsData = [
            { name: "Putnam", floors: 3 },
            { name: "Walton", floors: 3 }
        ];

        let createdBuildings = [];

        for (const buildingData of buildingsData) {
            let building = await Building.findOne({ name: buildingData.name, university: universityId });
            if (!building) {
                building = new Building({ name: buildingData.name, university: universityId, floors: [] });
                await building.save();
            }

            let floors = [];
            for (let i = 1; i <= buildingData.floors; i++) {
                const floor = new Floor({ name: `Floor ${i}`, building: building._id, residents: [], ra: [] });
                await floor.save();
                floors.push(floor._id);
            }

            building.floors = floors;
            await building.save();

            createdBuildings.push(building);
        }

        res.status(201).json({ message: "Buildings and floors initialized successfully", buildings: createdBuildings });
    } catch (error) {
        console.error("Error initializing buildings and floors:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { initializeBuildings };
