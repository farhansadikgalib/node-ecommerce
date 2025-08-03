# 🚀 Node E-commerce Authentication API - Postman Collection

This repository contains a complete Postman collection for testing the Node.js E-commerce Authentication API.

## 📋 Features Covered

### ✅ **Authentication Endpoints**
- ✅ User Registration with email verification
- ✅ Email/Password Login with JWT tokens
- ✅ OTP verification for email
- ✅ Resend OTP functionality

### 🔐 **Password Management**
- ✅ Forgot Password with OTP
- ✅ Verify Password Reset OTP
- ✅ Reset Password with new credentials

### 🌐 **OAuth Integration**
- ✅ Google OAuth login initiation
- ✅ Google OAuth callbacks (success/failure)

### 🏥 **Health Checks**
- ✅ Server health verification

## 📦 Installation & Setup

### **1. Import Postman Collection**

#### **Option A: Import Files**
1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Node-Ecommerce-Auth-API.postman_collection.json`
   - `E-commerce-Auth-Environment.postman_environment.json`

#### **Option B: Import via Raw JSON**
1. Copy the content from collection file
2. In Postman: Import → Raw Text → Paste content

### **2. Environment Setup**
1. Select **"E-commerce Auth Environment"** from environment dropdown
2. Update environment variables as needed:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:5000` | API server URL |
| `userEmail` | `test@example.com` | Test user email |
| `userPassword` | `password123` | Test user password |
| `otpCode` | `123456` | Email OTP (update with real OTP) |
| `resetOtpCode` | `654321` | Password reset OTP (update with real OTP) |

### **3. Update Base URL**
For deployed applications, update the `baseUrl` variable:

```
Local Development: http://localhost:5000
Railway: https://your-app.railway.app
Heroku: https://your-app.herokuapp.com
Render: https://your-app.onrender.com
```

## 🔄 **Testing Flow**

### **Complete Authentication Flow:**

1. **Health Check** _(optional)_
   ```
   GET {{baseUrl}}/
   ```

2. **Register New User**
   ```
   POST {{baseUrl}}/api/auth/register
   ```
   - Creates user account
   - Sends OTP to email
   - Auto-saves `userId` to environment

3. **Verify Email OTP**
   ```
   POST {{baseUrl}}/api/auth/verify-otp
   ```
   - ⚠️ **Update `otpCode` variable with actual OTP from email**
   - Verifies user account

4. **Login**
   ```
   POST {{baseUrl}}/api/auth/login
   ```
   - Authenticates user
   - Auto-saves `authToken` to environment

### **Password Reset Flow:**

5. **Forgot Password**
   ```
   POST {{baseUrl}}/api/auth/forgot-password
   ```
   - Sends password reset OTP

6. **Verify Reset OTP**
   ```
   POST {{baseUrl}}/api/auth/verify-forgot-password-otp
   ```
   - ⚠️ **Update `resetOtpCode` variable with actual OTP**

7. **Reset Password**
   ```
   POST {{baseUrl}}/api/auth/reset-password
   ```
   - Changes password to `newPassword`

## 🧪 **Automated Testing**

The collection includes automated tests that:

- ✅ Verify response status codes
- ✅ Check response messages
- ✅ Auto-populate environment variables
- ✅ Validate JWT tokens
- ✅ Test error scenarios

### **Run Collection Tests:**
1. Click collection name → **Run**
2. Select all requests
3. Choose environment
4. Click **Run**

## 🔧 **Environment Variables**

### **Static Variables** _(Update as needed)_
```json
{
  "baseUrl": "http://localhost:5000",
  "userEmail": "your-test-email@example.com",
  "userPassword": "your-test-password",
  "newPassword": "your-new-password"
}
```

### **Dynamic Variables** _(Auto-populated)_
```json
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "64f8b2c1d4e5f6a7b8c9d0e1",
  "otpCode": "123456",
  "resetOtpCode": "654321"
}
```

## ⚠️ **Important Notes**

### **OTP Handling:**
- 📧 Check your email for actual OTP codes
- 🔄 Update `otpCode` and `resetOtpCode` variables with real values
- ⏱️ OTPs expire in 5 minutes

### **Email Configuration:**
- 📨 Ensure email service is properly configured in `.env`
- 🔑 Use App Password for Gmail (not regular password)

### **Google OAuth:**
- 🌐 Google OAuth routes work in browser only
- 🔧 Requires valid Google Client ID/Secret in `.env`
- 🔄 Callback URLs must be configured in Google Console

## 📊 **Expected Responses**

### **Successful Registration:**
```json
{
  "message": "User registered successfully. Please verify your email with the OTP sent",
  "userId": "64f8b2c1d4e5f6a7b8c9d0e1"
}
```

### **Successful Login:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8b2c1d4e5f6a7b8c9d0e1",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer",
    "authProvider": "local"
  }
}
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Server not running:**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5000
   ```
   **Solution:** Start your Node.js server with `npm run dev`

2. **Invalid OTP:**
   ```json
   {"message": "Invalid OTP"}
   ```
   **Solution:** Update environment variable with correct OTP from email

3. **Email not verified:**
   ```json
   {"message": "Please verify your email first"}
   ```
   **Solution:** Complete OTP verification step first

4. **Expired OTP:**
   ```json
   {"message": "OTP has expired"}
   ```
   **Solution:** Request new OTP using "Resend OTP" endpoint

## 🔗 **Related Files**

- `index.js` - Main server file
- `routes/authRoutes.js` - API routes
- `controllers/authController.js` - Business logic
- `models/User.js` - Database schema
- `.env` - Environment configuration

## 📝 **Version Information**

- **Collection Version:** 1.0.0
- **Postman Schema:** v2.1.0
- **Node.js Version:** 20.x
- **Dependencies:** Express, MongoDB, Passport, Nodemailer

---

🎉 **Happy Testing!** If you encounter any issues, check the server logs and ensure all environment variables are properly configured.
