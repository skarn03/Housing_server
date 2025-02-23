const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const universityRoutes = require('./routes/universityRoutes');
const floorRoutes = require('./routes/floorRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const packageRoutes = require('./routes/packageRoutes');
const packageLogRoutes = require('./routes/packageLogRoutes');
const incidentReportRoutes = require('./routes/incidentReportRoutes');
const studentRoutes = require('./routes/studentRoutes');
const staffRoutes = require('./routes/staffRoutes');
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
app.use('/api/floor', floorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/building', buildingRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/packagelog', packageLogRoutes);
app.use('/api/incidentreport', incidentReportRoutes);
app.use('/api/staff', staffRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
