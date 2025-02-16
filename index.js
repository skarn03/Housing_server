const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Basic Route
app.get('/', (req, res) => {
    res.send('Welcome to the Express.js Backend!');
});

// Sample Routes (Modify as needed)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
