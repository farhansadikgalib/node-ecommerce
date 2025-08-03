const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // User exists, return user
                return done(null, user);
            }

            // Check if user exists with same email
            const existingUser = await User.findOne({ email: profile.emails[0].value });
            
            if (existingUser) {
                // Link Google account to existing user
                existingUser.googleId = profile.id;
                existingUser.isVerified = true; // Google accounts are pre-verified
                await existingUser.save();
                return done(null, existingUser);
            }

            // Create new user
            const newUser = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                password: 'google-oauth', // Placeholder password for Google users
                isVerified: true, // Google accounts are pre-verified
                authProvider: 'google'
            });

            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            return done(error, null);
        }
    }));
}

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
