# Admin Panel Access

## Default Admin Credentials

The system comes with a pre-configured admin user for accessing the admin panel.

### Login Details:
- **Email**: `admin@gmail.com`
- **Password**: `123456`
- **Role**: Admin

### How to Access Admin Panel:

1. **Local Development**: 
   - Navigate to: `http://localhost:5000/admin`
   - Or directly access: `http://localhost:5000/admin-panel.html`

2. **Production (Vercel)**:
   - Navigate to: `https://your-vercel-deployment-url.vercel.app/admin`
   - Or directly access: `https://your-vercel-deployment-url.vercel.app/admin-panel.html`

### Admin Panel Features:
- **Dashboard**: Overview of users, brands, categories, and products
- **Users Management**: View all registered users
- **Brands Management**: Add, view, and delete brands
- **Categories Management**: Add, view, and delete categories (with parent-child relationships)
- **Products Management**: Add, view, and delete products with full details

### Creating Additional Admin Users:

To create additional admin users, you can either:

1. **Use the script**: Run `npm run create-admin` (modify the script first to change credentials)
2. **Manual registration**: Register a normal user and then manually update their role to "admin" in the database
3. **API endpoint**: Use the registration API and manually set the role to "admin"

### Security Notes:
- **Important**: Change the default admin password in production
- The admin panel requires authentication via JWT token
- Admin users have access to all management features

### Script to Create Admin:
You can run the admin creation script anytime:
```bash
npm run create-admin
```

This script will:
- Check if the admin user already exists
- Create the admin user if it doesn't exist
- Hash the password securely
- Set the user role to "admin"
- Mark the user as verified
