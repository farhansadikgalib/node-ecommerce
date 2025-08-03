const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const passport = require('./config/passport');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const brandRoutes = require('./routes/brandRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config();
const application = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cookieParser());

// Serve static files
application.use(express.static(path.join(__dirname)));

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
application.use('/api/products', productRoutes);
application.use('/api/brands', brandRoutes);
application.use('/api/categories', categoryRoutes);

// Admin panel route
application.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel.html'));
});

// Test route
application.get('/', (req, res) => {
    res.json({ 
        message: 'E-commerce API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            brands: '/api/brands',
            categories: '/api/categories'
        }
    });
});

application.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});