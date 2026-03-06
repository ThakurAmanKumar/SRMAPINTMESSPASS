# Authentication Security Implementation - Environment Variables Guide

## Overview
This guide covers all environment variables required for the new authentication security features including OTP-based login and password reset functionality.

## Required Environment Variables

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```
- MongoDB Atlas connection string
- Used for: Admin accounts and OTP storage
- Example: `mongodb+srv://admin:password@cluster.mongodb.net/srmap?retryWrites=true&w=majority`

### 2. JWT Configuration
```
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
```
- Secret key for signing JWT tokens
- **IMPORTANT**: Use a strong, random string (minimum 32 characters)
- Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Used for: Session tokens after OTP verification

### 3. SMTP Email Configuration (Gmail)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail-email@gmail.com
SMTP_PASS=your-app-specific-password
ADMIN_EMAIL=admin-email@example.com
```

#### Setting Up Gmail SMTP:
1. **Enable 2FA on your Google Account**
   - Go to https://myaccount.google.com/security
   - Enable Two-Factor Authentication

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Click "Generate"
   - Copy the 16-character token (without spaces)

3. **Set Environment Variables**
   ```
   SMTP_USER=your-gmail-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  (remove spaces for .env)
   ADMIN_EMAIL=admin-email@example.com
   ```

#### Example .env.local
```
MONGODB_URI=mongodb+srv://admin:pass@cluster.mongodb.net/srmap_db?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=messDev@gmail.com
SMTP_PASS=abcdabcdabcdabcd
ADMIN_EMAIL=admin@srmap.edu.in
```

## Feature Details

### 1. Login with OTP Verification
**Flow:**
1. Admin enters email + password
2. System verifies credentials
3. Generates 6-digit OTP
4. Sends OTP to admin email
5. Admin enters OTP
6. JWT token issued on verification
7. Redirect to dashboard

**OTP Details:**
- **Length**: 6 digits
- **Expiration**: 5 minutes
- **Type**: `login`
- **Resend**: Available before expiration

### 2. Forgot Password with OTP
**Flow:**
1. Click "Forgot Password?" on login page
2. Enter email address
3. System generates OTP
4. Sends OTP to email
5. Admin enters OTP
6. Admin enters new password
7. Password updated in database (hashed with bcrypt)
8. Redirect to login

**OTP Details:**
- **Length**: 6 digits
- **Expiration**: 15 minutes (longer than login OTP)
- **Type**: `password-reset`
- **Password Requirements**: Minimum 6 characters

## MongoDB Collections

### 1. Admins Collection
```typescript
{
  _id: ObjectId,
  email: string (unique, lowercase),
  password: string (bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. OTP Codes Collection
```typescript
{
  _id: ObjectId,
  email: string (indexed, lowercase),
  otp: string (6 digits),
  type: "login" | "password-reset",
  expiresAt: Date (auto-deleted by TTL index),
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Authentication Routes

#### 1. Login
- **Endpoint**: `POST /api/auth/login`
- **Input**: 
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "requiresOTP": true,
    "email": "admin@example.com",
    "message": "OTP has been sent to your email"
  }
  ```
- **Status**: 200 (credentials valid), 401 (invalid), 500 (error)

#### 2. Send OTP
- **Endpoint**: `POST /api/auth/send-otp`
- **Input**:
  ```json
  {
    "email": "admin@example.com",
    "type": "login" | "password-reset"
  }
  ```
- **Response**:
  ```json
  {
    "message": "OTP sent successfully",
    "email": "admin@example.com"
  }
  ```
- **Status**: 200 (success), 404 (admin not found), 500 (error)

#### 3. Verify Login OTP
- **Endpoint**: `POST /api/auth/verify-login-otp`
- **Input**:
  ```json
  {
    "email": "admin@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "email": "admin@example.com",
    "message": "Login successful"
  }
  ```
- **Status**: 200 (success), 401 (invalid OTP), 500 (error)

#### 4. Verify OTP (Generic)
- **Endpoint**: `POST /api/auth/verify-otp`
- **Input**:
  ```json
  {
    "email": "admin@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "verified": true
  }
  ```
- **Status**: 200 (success), 401 (invalid OTP), 500 (error)

#### 5. Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Input**:
  ```json
  {
    "email": "admin@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "If this email exists, a password reset OTP has been sent",
    "email": "admin@example.com"
  }
  ```
- **Status**: 200 (always returns this for security)
- **Note**: Does not reveal if email exists

#### 6. Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Input**:
  ```json
  {
    "email": "admin@example.com",
    "otp": "123456",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successfully"
  }
  ```
- **Status**: 200 (success), 401 (invalid OTP), 500 (error)

## Security Features

### 1. Password Hashing
- **Algorithm**: bcrypt (10 salt rounds)
- **Automatic**: Applied before saving to database

### 2. OTP Security
- **Auto-expire**: TTL index on MongoDB (5 or 15 minutes)
- **One-time use**: Deleted after verification
- **Randomized**: Cryptographically secure random generation

### 3. JWT Tokens
- **Expiration**: 24 hours (configurable)
- **Payload**: `{ email, id }`
- **Signing**: HS256 algorithm

### 4. Email Security
- **SSL/TLS**: Secure SMTP connection (port 465)
- **App Password**: Uses Gmail app-specific password (not main password)
- **Email Templates**: HTML formatted with security warnings

## Testing

### Local Testing
```bash
# Test Login Flow
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"er.thakuramankumar@gmail.com","password":"Aman228"}'

# Test Send OTP
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"er.thakuramankumar@gmail.com","type":"login"}'

# Test OTP Verification
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"er.thakuramankumar@gmail.com","otp":"123456"}'
```

## Troubleshooting

### SMTP Connection Issues
- Verify app password (no spaces allowed in .env)
- Check 2FA is enabled on Google account
- Confirm SMTP_USER has correct Gmail address
- Test: `node -e "const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({...}); t.verify();"`

### OTP Not Arriving
- Check spam/promotions folder
- Verify SMTP credentials in .env
- Check MongoDB OTP collection for records
- Review console logs for email errors

### JWT Token Issues
- Ensure JWT_SECRET is strong (32+ characters)
- Check token wasn't modified
- Verify expiration time hasn't passed
- Test: `node -e "const jwt = require('jsonwebtoken'); console.log(jwt.decode(token))"`

## Vercel Deployment

### Required Environment Variables on Vercel
1. Go to Project Settings → Environment Variables
2. Add all variables from .env.local
3. Set for: Production, Preview, Development

### Exported Variables for Vercel
Each variable must be set in Vercel dashboard:
```
MONGODB_URI
JWT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
ADMIN_EMAIL
```

### Verification After Deployment
1. Navigate to your Vercel app URL
2. Test login with email + password
3. Verify OTP email arrives
4. Complete login flow
5. Test forgot password flow
6. Monitor Vercel function logs for errors

## Next Steps

1. **Install Dependencies** (already done):
   - mongoose
   - bcryptjs
   - jsonwebtoken
   - nodemailer

2. **Configure Environment Variables**:
   - Create .env.local with all variables
   - Set same variables in Vercel dashboard

3. **Test Locally**:
   - `npm run dev`
   - Navigate to http://localhost:3001/login
   - Test all authentication flows

4. **Deploy to Vercel**:
   - Push to GitHub
   - Vercel auto-deploys
   - Monitor deployment logs

5. **Monitor Production**:
   - Check Vercel function logs
   - Monitor email delivery
   - Track user login issues
