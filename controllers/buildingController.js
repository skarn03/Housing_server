const Building = require("../models/Building");
const Floor = require("../models/Floor");
const University = require("../models/University");

// 📡 Fetch buildings for a university
const getBuildings = async (req, res) => {
    try {
        console.log("📡 Fetching buildings from university.buildings...");

        const university = req.userUniversity;

        if (!university) {
            console.log("❌ University not found in request!");
            return res.status(400).json({ error: "University not found" });
        }

        console.log(`🏛️ University: ${university.name}`);

        // Fetch buildings linked to the university
        const buildings = await Building.find({ university: university._id }).populate("floors");

        console.log(`✅ Found ${buildings.length} buildings`);

        res.status(200).json({ buildings });
    } catch (error) {
        console.error("❌ Error fetching buildings:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🏗️ Add a new building with floors
const addBuilding = async (req, res) => {
    try {
        console.log("🏗️ Adding a new building...");

        const { name, floors } = req.body;
        const university = req.userUniversity;

        if (!university) {
            console.log("❌ University not found in request!");
            return res.status(400).json({ error: "University not found" });
        }

        if (!name.trim()) {
            return res.status(400).json({ error: "Building name is required" });
        }

        console.log(`🏢 Creating new building: ${name}`);

        // Create new building
        const newBuilding = new Building({
            name,
            university: university._id
        });

        await newBuilding.save();

        console.log(`✅ Building "${newBuilding.name}" saved.`);

        // Create floors
        const floorDocs = [];
        for (let floorName of floors) {
            if (!floorName.trim()) continue;

            const floor = new Floor({
                name: floorName,
                building: newBuilding._id
            });

            await floor.save();
            floorDocs.push(floor);
        }

        // Link floors to building
        newBuilding.floors = floorDocs.map(floor => floor._id);
        await newBuilding.save();

        // Add building to university
        await University.findByIdAndUpdate(university._id, { $push: { buildings: newBuilding._id } });

        console.log(`✅ ${floorDocs.length} floors added to "${newBuilding.name}"`);
        console.log(`🏛️ Building added to university: ${university.name}`);

        res.status(201).json({ building: newBuilding, floors: floorDocs });

    } catch (error) {
        console.error("❌ Error adding building:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✏️ Update building name & add/remove floors
const updateBuilding = async (req, res) => {
    try {
        console.log("✏️ Updating building...");

        const { name, floors } = req.body;
        const { buildingId } = req.params;
        const university = req.userUniversity;

        if (!university) {
            return res.status(400).json({ error: "University not found" });
        }

        const building = await Building.findOne({ _id: buildingId, university: university._id }).populate("floors");

        if (!building) {
            return res.status(404).json({ error: "Building not found" });
        }

        console.log(`🏢 Editing building: ${building.name}`);

        if (name.trim()) {
            building.name = name;
        }

        // Add new floors
        const existingFloorNames = building.floors.map(floor => floor.name);
        const newFloors = floors.filter(floorName => !existingFloorNames.includes(floorName));

        const newFloorDocs = [];
        for (let floorName of newFloors) {
            if (!floorName.trim()) continue;

            const floor = new Floor({
                name: floorName,
                building: building._id
            });

            await floor.save();
            newFloorDocs.push(floor);
        }

        building.floors = [...building.floors, ...newFloorDocs];
        await building.save();

        console.log(`✅ Updated building "${building.name}" with ${newFloorDocs.length} new floors`);

        res.status(200).json({ building });

    } catch (error) {
        console.error("❌ Error updating building:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 🗑️ Delete a building & its floors
const deleteBuilding = async (req, res) => {
    try {
        console.log("🗑️ Deleting building...");

        const { buildingId } = req.params;
        const university = req.userUniversity;

        if (!university) {
            return res.status(400).json({ error: "University not found" });
        }

        const building = await Building.findOne({ _id: buildingId, university: university._id });

        if (!building) {
            return res.status(404).json({ error: "Building not found" });
        }

        // Remove all floors associated with this building
        await Floor.deleteMany({ building: building._id });

        // Remove building reference from university
        await University.findByIdAndUpdate(university._id, { $pull: { buildings: building._id } });

        // Delete the building
        await Building.findByIdAndDelete(building._id);

        console.log(`✅ Building "${building.name}" and its floors deleted`);

        res.status(200).json({ message: "Building deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting building:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { getBuildings, addBuilding, updateBuilding, deleteBuilding };
