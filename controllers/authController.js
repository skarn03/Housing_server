const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const HousingAccess = mongoose.model('HousingAccess', new mongoose.Schema({}, { strict: false }), 'housingaccesses');
const Staff = mongoose.model('Staff', new mongoose.Schema({}, { strict: false }), 'staff');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Request Body:", req.body);

        // First, check Staff collection
        let user = await Staff.findOne({ email: email });
        let role;

        if (!user) {
            // If not found in Staff, check HousingAccess for SuperAdmin login
            let housingAccess = await HousingAccess.findOne({ "superAdmin.email": email });
            if (!housingAccess) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Compare password before creating a Staff user
            const isMatch = await bcrypt.compare(password, housingAccess.superAdmin.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            role = "SuperAdmin";

            // Create a corresponding Staff user
            user = new Staff({
                name: housingAccess.superAdmin.name,
                email: housingAccess.superAdmin.email,
                password: housingAccess.superAdmin.password, // Use existing password
                role: role
            });
            await user.save();
            console.log("✅ SuperAdmin added to Staff collection!");
        } else {
            role = user.role;
        }

        console.log("Found User:", user);

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: email, role: role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, role, message: 'Login successful' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};
