# Super Admin Panel Setup Guide

## Overview
The SRMAP International Mess Pass Portal now includes a comprehensive Super Admin Panel for monitoring system administrators and tracking their activities. This guide provides complete setup and usage instructions.

## System Architecture

### Three-Role System
The application now supports three distinct user roles:

1. **Student** - Submit mess pass requests
2. **Admin** - Approve/reject requests, issue passes, manage system
3. **Super Admin** - Monitor admins, manage admin accounts, view system-wide activity logs

---

## Environment Variables Setup

### Prerequisites
Ensure you have the following already configured in `.env.local`:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key for authentication
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration

See `AUTHENTICATION_SETUP_GUIDE.md` for detailed setup of these variables.

### No Additional Environment Variables Required
The Super Admin Panel uses the existing authentication and database infrastructure. No new environment variables are needed beyond those already configured.

---

## Database Collections

### 1. **superAdmins** Collection
Stores Super Admin credentials and account information.

**Fields:**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

**Example:**
```javascript
{
  email: "superadmin@srmap.edu.in",
  password: "$2a$10$...", // bcrypt hashed
  createdAt: ISODate("2026-03-09T10:00:00.000Z")
}
```

### 2. **adminHistory** Collection
Logs all administrative actions performed in the system.

**Fields:**
```javascript
{
  _id: ObjectId,
  adminEmail: String,
  actionType: String, // DELETE_PASS, DELETE_REQUEST, REVOKE_PASS, APPROVE_REQUEST, REJECT_REQUEST, CREATE_ADMIN, DELETE_ADMIN
  actionDetails: String,
  targetId: ObjectId (optional),
  targetType: String, // PASS, REQUEST, ADMIN, OTHER
  status: String, // SUCCESS or FAILED
  ipAddress: String (optional),
  createdAt: Date
}
```

**Example:**
```javascript
{
  adminEmail: "admin1@gmail.com",
  actionType: "DELETE_PASS",
  actionDetails: "Deleted pass SRMAPIM12 (Student: John Doe)",
  targetId: ObjectId("507f1f77bcf86cd799439011"),
  targetType: "PASS",
  status: "SUCCESS",
  ipAddress: "192.168.1.1",
  createdAt: ISODate("2026-03-10T15:30:00.000Z")
}
```

---

## Initial Setup

### Step 1: Create MongoDB Collections
The collections will be created automatically when the application starts. However, you can manually create them in MongoDB:

```javascript
// In MongoDB Shell
db.createCollection("superAdmins", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password"],
      properties: {
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.superAdmins.createIndex({ email: 1 }, { unique: true });

db.createCollection("adminHistory", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["adminEmail", "actionType", "actionDetails"],
      properties: {
        adminEmail: { bsonType: "string" },
        actionType: { bsonType: "string" },
        actionDetails: { bsonType: "string" },
        targetId: { bsonType: "objectId" },
        targetType: { bsonType: "string" },
        status: { bsonType: "string" },
        ipAddress: { bsonType: "string" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.adminHistory.createIndex({ createdAt: -1 });
db.adminHistory.createIndex({ adminEmail: 1, createdAt: -1 });
db.adminHistory.createIndex({ actionType: 1, createdAt: -1 });
```

### Step 2: Insert Initial Super Admin Account
Use MongoDB Compass or MongoDB Shell to insert your first Super Admin:

```javascript
// In MongoDB Shell
use srmap_db; // Replace with your database name

db.superAdmins.insertOne({
  email: "superadmin@srmap.edu.in",
  password: "$2a$10$...", // Use bcryptjs to hash the password
  createdAt: new Date(),
  updatedAt: new Date()
});
```

**To generate a bcrypt hash programmatically:**
```javascript
// Node.js script
const bcryptjs = require('bcryptjs');

const password = "your_secure_password_here";
const salt = bcryptjs.genSaltSync(10);
const hash = bcryptjs.hashSync(password, salt);

console.log("Hashed password:", hash);
// Use this hash value in the MongoDB insert command
```

Alternatively, use the API to create it (if authentication is already setup).

### Step 3: Start the Application
```bash
npm run dev
```

The application will now have both Admin and Super Admin panels available.

---

## User Access

### Super Admin Panel Routes
- **Login**: `http://localhost:3000/SupAdm/login`
- **Dashboard**: `http://localhost:3000/SupAdm/dashboard` (after login)
- **Admin Management**: `http://localhost:3000/SupAdm/admins`
- **Activity History**: `http://localhost:3000/SupAdm/history`

### Super Admin Dashboard Features

#### 1. Dashboard (`/SupAdm/dashboard`)
- **Total Admins** - Count of all active admins
- **Total Passes** - Count of all issued passes
- **Total Requests** - Count of all pass requests
- **Revoked Passes** - Count of deleted/revoked passes
- **Activity Stats** - Summary of admin actions
- **Actions by Type** - Breakdown of action types

#### 2. Admin Management (`/SupAdm/admins`)
**View:**
- List of all admins with email and creation date
- Total admin count

**Create:**
- Add new admin account
- Email and password required
- Password automatically hashed with bcrypt

**Delete:**
- Remove admin accounts
- Delete action is logged in adminHistory

#### 3. Activity History (`/SupAdm/history`)
**View:**
- All admin actions with timestamps
- Action type color-coded for quick identification
- Admin email performing the action
- Detailed action descriptions

**Filter:**
- Filter by admin email
- Filter by action type
- Combination filtering supported

**Pagination:**
- 20 records per page
- Previous/Next navigation

---

## API Endpoints

### Authentication Endpoints
All requests require a valid Bearer token in the Authorization header after initial login.

#### 1. Login
```
POST /api/superadmin/auth/login
Content-Type: application/json

{
  "email": "superadmin@srmap.edu.in",
  "password": "password123"
}

Response:
{
  "requiresOTP": true,
  "email": "superadmin@srmap.edu.in",
  "message": "OTP has been sent to your email"
}
```

#### 2. Verify OTP
```
POST /api/superadmin/auth/verify-login-otp
Content-Type: application/json

{
  "email": "superadmin@srmap.edu.in",
  "otp": "123456"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "superadmin@srmap.edu.in"
}
```

#### 3. Send/Resend OTP
```
POST /api/superadmin/auth/send-otp
Content-Type: application/json

{
  "email": "superadmin@srmap.edu.in"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Admin Management Endpoints
All endpoints require authorization header with Super Admin token.

#### 1. Get All Admins
```
GET /api/superadmin/admins
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "admins": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin1@srmap.edu.in",
      "createdAt": "2026-03-01T10:00:00.000Z"
    },
    ...
  ]
}
```

#### 2. Create Admin
```
POST /api/superadmin/admins
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "new.admin@srmap.edu.in",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "new.admin@srmap.edu.in",
    "createdAt": "2026-03-10T15:30:00.000Z"
  }
}
```

#### 3. Delete Admin
```
DELETE /api/superadmin/admins?id=<adminId>
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

### Activity & Statistics Endpoints

#### 1. Get Admin History
```
GET /api/superadmin/admin-history?page=1&limit=50&adminEmail=admin1@srmap.edu.in&actionType=DELETE_PASS
Authorization: Bearer <token>

Response:
{
  "success": true,
  "page": 1,
  "limit": 50,
  "count": 25,
  "history": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "adminEmail": "admin1@srmap.edu.in",
      "actionType": "DELETE_PASS",
      "actionDetails": "Deleted pass SRMAPIM12",
      "targetId": "507f1f77bcf86cd799439011",
      "status": "SUCCESS",
      "createdAt": "2026-03-10T15:30:00.000Z"
    },
    ...
  ]
}
```

#### 2. Get System Statistics
```
GET /api/superadmin/statistics
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statistics": {
    "totalAdmins": 5,
    "totalPasses": 150,
    "totalRequests": 200,
    "revokedPasses": 15,
    "activityStats": {
      "total": 450,
      "last24h": 32,
      "byType": [
        { "_id": "APPROVE_REQUEST", "count": 120 },
        { "_id": "DELETE_PASS", "count": 45 },
        ...
      ]
    }
  }
}
```

---

## Activity Logging

### Automatic Action Tracking
The following admin actions are automatically logged to the `adminHistory` collection:

1. **DELETE_PASS** - Admin deletes a pass
2. **DELETE_REQUEST** - Admin deletes a pass request
3. **APPROVE_REQUEST** - Admin approves a pass request
4. **REJECT_REQUEST** - Admin rejects a pass request
5. **CREATE_ADMIN** - Super Admin creates new admin account
6. **DELETE_ADMIN** - Super Admin deletes admin account

### Action Log Structure
Each logged action includes:
- **Admin Email** - Email of the admin who performed the action
- **Action Type** - Type of action performed
- **Action Details** - Human-readable description
- **Target ID** - ID of the affected record (pass/request/admin)
- **Target Type** - Type of affected record
- **Status** - SUCCESS or FAILED
- **IP Address** - Client IP (if available)
- **Timestamp** - When the action occurred

### Adding New Action Types
To log additional actions, use the `logAdminAction` utility in your API route:

```typescript
import { logAdminAction } from '@/lib/admin-action-logger';
import { getClientIP } from '@/lib/superadmin-middleware';

// In your API route
await logAdminAction({
  adminEmail: auth.payload.email,
  actionType: 'YOUR_ACTION_TYPE',
  actionDetails: 'Description of what was done',
  targetId: recordId,
  targetType: 'PASS' | 'REQUEST' | 'ADMIN' | 'OTHER',
  status: 'SUCCESS' | 'FAILED',
  ipAddress: getClientIP(request),
});
```

---

## Security Considerations

### 1. JWT Token Security
- Tokens expire after 24 hours
- Stored in secure httpOnly cookies and localStorage
- Always sent through HTTPS in production
- Tokens are validated on every protected API request

### 2. Password Security
- All passwords are hashed using bcryptjs (10 salt rounds)
- Passwords are never logged or displayed
- Never send passwords through API responses
- Passwords are only used at creation time

### 3. OTP Security
- OTPs are 6-digit random numbers
- Valid for 10 minutes only
- Auto-deleted from database after expiration
- Can only be used once

### 4. Admin Permissions
- Only Super Admins can access `/SupAdm/*` routes
- Non-Super-Admin admins cannot access Super Admin panel
- All protected routes verify JWT authentication
- Strong middleware protects against unauthorized access

### 5. Data Privacy
- Admin actions include details about what was done but not sensitive data
- IP addresses are logged for audit purposes
- All sensitive operations require authentication
- Deletion of records is logged but recoverable only by direct database access

---

## Troubleshooting

### Issue: "Admin not found" on login
**Solution:**
- Verify the Super Admin email exists in the `superAdmins` collection
- Check email is correct (case-insensitive matching)
- Ensure password is correct

### Issue: "Invalid or expired token"
**Solution:**
- Token may have expired (24-hour expiration)
- Re-login to get a new token
- Clear browser cache and localStorage
- Verify system time is synchronized

### Issue: OTP not arriving
**Solution:**
- Check SMTP configuration in environment variables
- Verify Gmail App Password is set correctly (remove spaces)
- Check your email spam folder
- Ensure two-factor authentication is enabled on Gmail account

### Issue: "Admin access required" error
**Solution:**
- Verify the logged-in user is an admin in the `Admin` collection
- Use admin credentials to login, not Super Admin credentials for regular operations
- For Super Admin operations, use `/SupAdm/*` routes

### Issue: History not showing actions
**Solution:**
- Verify `adminHistory` collection exists in MongoDB
- Check that actions were performed after the collection was created
- Verify admin email matches exactly (case-sensitive in queries)
- Clear browser cache if UI doesn't update

---

## Production Deployment

### Vercel Compatibility
The Super Admin Panel is fully compatible with Vercel deployment:

1. **API Routes** - All routes are in `/api/superadmin/*` format
2. **MongoDB** - Uses existing MongoDB connection
3. **Environment Variables** - All secrets in `.env.local` (not committed to git)
4. **Middleware** - Built with Next.js best practices
5. **Static Assets** - Uses Next.js static optimization

### Deployment Steps
1. Push code to GitHub/GitLab
2. Connect to Vercel project
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
4. Deploy - Vercel will automatically build and deploy
5. Verify API routes are accessible
6. Test login flow with production Super Admin account

### Maintenance Tasks
- **Daily**: Monitor activity logs for unusual patterns
- **Weekly**: Review admin actions for audit purposes
- **Monthly**: Backup `superAdmins` and `adminHistory` collections
- **Quarterly**: Review and update admin access based on current needs

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review API documentation in the relevant route files
3. Check MongoDB logs for connection issues
4. Verify environment variables are set correctly
5. Test email configuration using the send-otp endpoint

Last Updated: March 2026
