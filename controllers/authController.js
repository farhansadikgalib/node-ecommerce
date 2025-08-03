const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateOTP } = require("../utils/generateOTP");
const { sendOTP, sendPasswordResetOTP } = require("../services/emailServices");

exports.register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists and is already verified
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists and is verified",
        });
      }

      // If user exists but is not verified, resend OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      // Update existing user with new OTP
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();

      // Send OTP
      await sendOTP(email, otp);

      return res.status(200).json({
        success: true,
        message: "User exists but not verified. New OTP sent to your email",
        userId: existingUser._id,
      });
    }

    // Generate OTP for new user
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();

    // Send OTP
    await sendOTP(email, otp);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your email with the OTP sent",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update user with new OTP
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first before resetting password",
      });
    }

    // Generate new OTP for password reset
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update user with password reset OTP
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = otpExpires;
    await user.save();

    // Send OTP for password reset
    await sendPasswordResetOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error sending forgot password OTP:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify Forgot Password OTP
exports.verifyForgotPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if password reset OTP matches and is not expired
    if (user.passwordResetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.passwordResetOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Mark OTP as verified for password reset (but don't clear it yet)
    user.passwordResetOTPVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error verifying forgot password OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify OTP again for security
    if (user.passwordResetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.passwordResetOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (!user.passwordResetOTPVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear password reset fields
    user.password = hashedPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    user.passwordResetOTPVerified = undefined;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// Google OAuth Success Callback
exports.googleAuthSuccess = async (req, res) => {
  try {
    if (req.user) {
      // Generate JWT token
      const token = generateToken(req.user._id);

      // Set token in cookie or send in response
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Redirect to frontend with success
      res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/auth/success?token=${token}`
      );
    } else {
      res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:3000"}/auth/failure`
      );
    }
  } catch (error) {
    console.error("Error in Google auth success:", error);
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:3000"}/auth/failure`
    );
  }
};

// Google OAuth Failure Callback
exports.googleAuthFailure = (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
};

// Regular Email/Password Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is verified (skip for Google users)
    if (!user.isVerified && user.authProvider === "local") {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
        userId: user._id,
      });
    }

    // For Google users, they can't login with password
    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please use Google to login.",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
