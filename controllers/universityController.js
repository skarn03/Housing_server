const University = require('../models/University'); // Assuming you're using a MongoDB model

// Search for universities by name (returns an array)
const searchUniversity = async (req, res) => {
    const { name } = req.params;
    
    if (!name) {
        return res.status(400).json({ error: "University name is required" });
    }

    try {
        // Searching for universities in MongoDB
        const universities = await University.find({ name: { $regex: name, $options: 'i' } });
        
        if (universities.length === 0) {
            return res.status(404).json({ message: "No universities found" });
        }
        
        return res.json(universities);
    } catch (error) {
        console.error("Error fetching university data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get a single university by exact name (returns an object)
const getUniversityByName = async (req, res) => {
    const { name } = req.params;

    if (!name) {
        return res.status(400).json({ error: "University name is required" });
    }

    try {
        // Fetching a single university by name and populating buildings and their floors
        const university = await University.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })
            .populate({
                path: 'buildings',
                populate: {
                    path: 'floors',
                    model: 'Floor'
                }
            });

        if (!university) {
            return res.status(404).json({ message: "University not found" });
        }

        return res.json(university);
    } catch (error) {
        console.error("Error fetching university data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { searchUniversity, getUniversityByName };
