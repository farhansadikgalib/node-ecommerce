# Node.js E-commerce API - Complete Documentation

## Overview
This is a comprehensive e-commerce backend API built with Node.js, Express, and MongoDB. It includes authentication, user management, product management, brand management, category management, and review systems.

## 🚀 Live API Base URL
```
https://ecommerce-8agyy9516-farhans-projects-2af87f6e.vercel.app
```

## 📦 Postman Collection
Import the following files into Postman:
- `Node-Ecommerce-Complete-API.postman_collection.json` - Complete API collection
- `E-commerce-Complete-Environment.postman_environment.json` - Environment variables

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Postman (for testing)

### Environment Variables
Create a `.env` file with the following variables:
```env
# Database
MONGO_URI_LIVE=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twilio (for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd node-ecommerce

# Install dependencies
npm install

# Start the server
npm start
```

## 📚 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/verify-otp` | Verify OTP for account activation |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/google` | Google OAuth login |

### 🏷️ Brands
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/brands` | Get all brands | No |
| GET | `/api/brands/:id` | Get brand by ID | No |
| POST | `/api/brands` | Create new brand | Yes |
| PUT | `/api/brands/:id` | Update brand | Yes |
| DELETE | `/api/brands/:id` | Delete brand | Yes |

### 📂 Categories
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | No |
| GET | `/api/categories/tree` | Get category tree structure | No |
| GET | `/api/categories/:id` | Get category by ID | No |
| POST | `/api/categories` | Create new category | Yes |
| PUT | `/api/categories/:id` | Update category | Yes |
| DELETE | `/api/categories/:id` | Delete category | Yes |

### 🛍️ Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products (with filters) | No |
| GET | `/api/products/:id` | Get product by ID | No |
| POST | `/api/products` | Create new product | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| DELETE | `/api/products/:id` | Delete product | Yes |

### ⭐ Product Reviews
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products/:id/reviews` | Get product reviews | No |
| POST | `/api/products/:id/reviews` | Add product review | Yes |

## 📋 Data Models

### User Model
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "isVerified": "boolean",
  "otp": "string",
  "otpExpiry": "date",
  "googleId": "string"
}
```

### Brand Model
```json
{
  "name": "string",
  "description": "string",
  "logo": "string",
  "website": "string",
  "isActive": "boolean"
}
```

### Category Model
```json
{
  "name": "string",
  "description": "string",
  "image": "string",
  "parentCategory": "ObjectId",
  "isActive": "boolean"
}
```

### Product Model
```json
{
  "title": "string",
  "description": "string",
  "brand": {
    "brandId": "ObjectId",
    "name": "string"
  },
  "category": {
    "categoryId": "ObjectId",
    "name": "string"
  },
  "seller": {
    "sellerId": "ObjectId",
    "name": "string"
  },
  "price": {
    "basePrice": "number",
    "salePrice": "number",
    "currency": "string"
  },
  "stock": {
    "total": "number",
    "available": "number",
    "reserved": "number"
  },
  "images": ["string"],
  "specifications": "object",
  "features": ["string"],
  "tags": ["string"],
  "reviews": [{
    "userId": "ObjectId",
    "userName": "string",
    "rating": "number",
    "title": "string",
    "comment": "string",
    "pros": ["string"],
    "cons": ["string"],
    "date": "date"
  }],
  "status": {
    "isActive": "boolean",
    "isApproved": "boolean",
    "isFeatured": "boolean"
  },
  "seo": {
    "metaTitle": "string",
    "metaDescription": "string",
    "slug": "string"
  },
  "shipping": {
    "weight": "number",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number"
    },
    "freeShipping": "boolean",
    "shippingCost": "number"
  }
}
```

## 🔍 Query Parameters

### Products Filtering
```
GET /api/products?brand=brandId&category=categoryId&minPrice=100&maxPrice=1000&inStock=true&page=1&limit=10&sort=price&order=asc
```

### Pagination
All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Sorting
Products can be sorted by:
- `createdAt` - Creation date
- `price` - Base price
- `rating` - Average rating
- `title` - Product title

## 🔒 Authentication
Most write operations require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## 📱 Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Response data
  "error": "Error message (if any)",
  "pagination": { // For paginated responses
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🚨 Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing with Postman

1. Import the collection and environment files
2. Set the `baseUrl` in environment to your API URL
3. Register a new user and login to get auth token
4. Create brands and categories first
5. Create products using the brand and category IDs
6. Test reviews and other features

## 📞 Support
For support or questions, please contact the development team.

## 🔄 Updates
- v1.0.0 - Initial release with authentication and basic CRUD
- v1.1.0 - Added product management with advanced features
- v1.2.0 - Added brand and category management
- v1.3.0 - Added review system and enhanced filtering
