const express = require('express');
const passport = require('../config/passport');
const router = express.Router();
const { 
    register, 
    verifyOTP, 
    resendOTP, 
    forgotPassword, 
    verifyForgotPasswordOTP, 
    resetPassword,
    login,
    googleAuthSuccess,
    googleAuthFailure
} = require('../controllers/authController');

// Regular Authentication Routes
router.post('/register', register);
router.post('/login', login);

// OTP Routes
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Forgot Password routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);

// Google OAuth Routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/api/auth/google/failure' 
    }),
    googleAuthSuccess
);

router.get('/google/success', googleAuthSuccess);
router.get('/google/failure', googleAuthFailure);

module.exports = router;