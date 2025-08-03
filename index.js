const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const application = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cookieParser());

// Session configuration for passport
application.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
application.use(passport.initialize());
application.use(passport.session());

// Routes
application.use('/api/auth', authRoutes);

// Test route
application.get('/', (req, res) => {
    res.json({ message: 'E-commerce API is running!' });
});

application.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});