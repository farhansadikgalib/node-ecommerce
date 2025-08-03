const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ["seller", "admin", "customer"],
      default: "customer",
    },
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
    passwordResetOTPVerified: { type: Boolean, default: false },
    googleId: String,
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
