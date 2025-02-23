const express = require('express');
const { searchUniversity, getAllUniversities, getUniversityByName, createUniversity, updateUniversity, deleteUniversity } = require('../controllers/universityController');

const router = express.Router();

// Existing routes
router.get('/search/:name', searchUniversity);
// router.get('/all', getAllUniversities);

// New route to fetch a specific university by name
router.get('/university/:name', getUniversityByName);


// Create a new university
router.post('/create', createUniversity);

// Update a university by its ID
router.put('/:id', updateUniversity);

// Delete a university by its ID
router.delete('/:id', deleteUniversity);

module.exports = router;
