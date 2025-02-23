const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');

const Staff = require('../models/Staff'); // Import Staff model
const University = require('../models/University'); // Import University model

// Controller to create a new staff member
exports.createStaff = async (req, res) => {
    try {
        // Extract fields from request body
        const {
            name,
            firstName,
            middleName,
            lastName,
            email,
            password,
            role,
            floor,
            university,
            incidentReports
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !university) {
            return res.status(400).json({ message: 'Name, email, password, and university are required.' });
        }

        // Check if a staff member with the same email already exists
        const existingStaff = await Staff.findOne({ email: email.toLowerCase().trim() });
        if (existingStaff) {
            return res.status(400).json({ message: 'A staff member with this email already exists.' });
        }

        // Verify that the provided university exists
        const uniExists = await University.findById(university);
        if (!uniExists) {
            return res.status(400).json({ message: 'University not found.' });
        }

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new staff document
        const newStaff = new Staff({
            name,
            firstName,
            middleName,
            lastName,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role,
            floor,
            university,
            incidentReports
        });

        // Save the new staff member to the database
        await newStaff.save();
        if (newStaff) {
            console.log(`[+] Sending email to :`, { email, password });
        }
        // Send a success response with the created staff data
        res.status(201).json({
            message: 'Staff created successfully',
            staff: newStaff
        });
    } catch (error) {
        console.error("Error creating staff:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Get a single staff member by ID
exports.getStaffById = async (req, res) => {
    try {
        const staffId = req.params.id;
        const staff = await Staff.findById(staffId).populate('university', 'name');
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({ staff });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all staff members
exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await Staff.find().populate('university', 'name');
        res.status(200).json({ staff: staffList });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a staff member by ID
exports.updateStaff = async (req, res) => {
    try {
        const staffId = req.params.id;
        const updateData = req.body;

        // If updating password, hash it first
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updatedStaff = await Staff.findByIdAndUpdate(staffId, updateData, { new: true });
        if (!updatedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({
            message: 'Staff updated successfully',
            staff: updatedStaff
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a staff member by ID
exports.deleteStaff = async (req, res) => {
    try {
        const staffId = req.params.id;
        const deletedStaff = await Staff.findByIdAndDelete(staffId);
        if (!deletedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({
            message: 'Staff deleted successfully',
            staff: deletedStaff
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};