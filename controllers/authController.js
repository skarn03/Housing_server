const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');

const Staff = require('../models/Staff'); // Import Staff model
const University = require('../models/University'); // Import University model

// 🟢 LOGIN FUNCTION
exports.login = async (req, res) => {
    try {
        console.log("🔹 Received Login Request");
        
        const { email, password } = req.body;
        console.log("📩 Request Body:", req.body);

        // Find the user first
        console.log("🔍 Searching for user in Staff collection...");
        console.log("📧 email is", email);
        const user = await Staff.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            console.log("❌ User not found");
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log("✅ Found User:", user);

        // Compare password
        console.log("🔑 Comparing password...");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("❌ Password mismatch");
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log("✅ Password matched");

        // Fetch university name separately
        console.log("🏫 Fetching university information...");
        const university = await University.findById(user.university).select('name');
        
        if (university) {
            console.log("✅ University Found:", university.name);
        } else {
            console.log("❓ No university found for this user");
        }

        // Generate JWT Token
        console.log("🔐 Generating JWT Token...");
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log("✅ Token Generated:", token);

        console.log("🚀 Sending Success Response...");
        res.json({ 
            id: user._id, 
            token, 
            role: user.role, 
            university: university ? university.name : null, 
            message: 'Login successful' 
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};
