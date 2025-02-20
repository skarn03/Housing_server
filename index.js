const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const floorRoutes = require('./routes/floorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const buildingRoutes= require('./routes/buildingRoutes');
const packageRoutes= require('./routes/packageRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Connect Database
connectDB();

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/floor',floorRoutes );
app.use('/api/student',studentRoutes );
app.use('/api/building',buildingRoutes );


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
