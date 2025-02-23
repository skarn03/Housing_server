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



// Create a new University
const createUniversity = async (req, res) => {
    try {
        const { name, domain, logo, buildings, staff, students, studentConnectionNoteOptions, incidentReports, packages } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        // Check if a university with the same name already exists
        const existingUniversity = await University.findOne({ name: name.trim() });
        if (existingUniversity) {
            return res.status(400).json({ message: "University with this name already exists." });
        }
        const newUniversity = new University({
            name: name.trim(),
            domain,
            logo,
            buildings,
            staff,
            students,
            studentConnectionNoteOptions,
            incidentReports,
            packages
        });
        await newUniversity.save();
        res.status(201).json({ message: "University created successfully", university: newUniversity });
    } catch (error) {
        console.error("Error creating university:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update an existing University
const updateUniversity = async (req, res) => {
    try {
        const universityId = req.params.id;
        const updateData = req.body;
        const updatedUniversity = await University.findByIdAndUpdate(universityId, updateData, { new: true });
        if (!updatedUniversity) {
            return res.status(404).json({ message: "University not found" });
        }
        res.status(200).json({ message: "University updated successfully", university: updatedUniversity });
    } catch (error) {
        console.error("Error updating university:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a University
const deleteUniversity = async (req, res) => {
    try {
        const universityId = req.params.id;
        const deletedUniversity = await University.findByIdAndDelete(universityId);
        if (!deletedUniversity) {
            return res.status(404).json({ message: "University not found" });
        }
        res.status(200).json({ message: "University deleted successfully", university: deletedUniversity });
    } catch (error) {
        console.error("Error deleting university:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    searchUniversity,
    getUniversityByName,
    createUniversity,
    updateUniversity,
    deleteUniversity
};
