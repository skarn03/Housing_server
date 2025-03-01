const Staff = require("../models/Staff");

// ✅ Get all staff members by university (using req.userUniversity)
const getAllStaff = async (req, res) => {
    try {
        const universityId = req.userUniversity; // Retrieve university ID from middleware

        if (!universityId) {
            return res.status(400).json({ message: "University ID is required" });
        }

        console.log("📋 Fetching staff for university:", universityId);
        
        const staffMembers = await Staff.find({ university: universityId })
            .populate("building", "name") // Populate floor name if available
            .select("-password"); // Exclude password from response

        res.status(200).json(staffMembers);
    } catch (error) {
        console.error("❌ Error fetching staff:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getAllStaff };
