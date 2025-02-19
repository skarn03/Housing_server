const express = require('express');
const { searchUniversity, getAllUniversities, getUniversityByName } = require('../controllers/universityController');

const router = express.Router();

// Existing routes
router.get('/search/:name', searchUniversity);
// router.get('/all', getAllUniversities);

// New route to fetch a specific university by name
router.get('/university/:name', getUniversityByName);

module.exports = router;
