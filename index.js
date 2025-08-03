const dotenv = require('dotenv');
const mongose = require('mongoose');
const express = require('express');
const connectDB = require('./config/db'); 

dotenv.config();
const application = express();

const PORT = process.env.PORT || 5000;

connectDB();

application.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});