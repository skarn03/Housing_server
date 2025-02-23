const express = require('express');
const { createStaff, getAllStaff, updateStaff, deleteStaff, getStaffById } = require('../controllers/staffController');
const checkRole = require('../middleware/checkRole');
const checkAuth = require('../middleware/checkAuth');
const router = express.Router();

router.use(checkAuth);
router.use( checkRole("SuperAdmin"));

// Create new staff member
router.post('/createStaff', createStaff);
// Get one staff member
router.get('/:id', getStaffById);

// Get all staff members
router.get('/', getAllStaff);

// Update a staff member
router.put('/:id', updateStaff);

// Delete a staff member
router.delete('/:id', deleteStaff);

module.exports = router;
