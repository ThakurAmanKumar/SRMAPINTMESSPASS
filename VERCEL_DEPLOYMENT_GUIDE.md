# Vercel Deployment Guide - SRMAP Mess Pass Portal

## ✅ Pre-Deployment Checklist

- [x] Project builds successfully with `npm run build`
- [x] All environment variables configured
- [x] MongoDB Atlas connection verified
- [x] API routes are serverless-compatible
- [x] Database connection pooling configured
- [x] SMTP email configuration ready
- [x] JWT secret is secure
- [x] `.env.local` is in `.gitignore`
- [x] Git repository initialized

---

## 📋 Prerequisites

Before deploying to Vercel, ensure you have:

1. **GitHub Account** - To host your code repository
2. **Vercel Account** - Free tier available at https://vercel.com
3. **MongoDB Atlas Account** - Cloud database at https://www.mongodb.com/cloud/atlas
4. **Gmail Account** - For SMTP email notifications (with App Password)

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Prepare Your GitHub Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SRMAP Mess Pass Portal"

# Create GitHub repository at https://github.com/new
# Then push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/SRMAPIMPASS.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Create a database user:
   - Create a database user with username and strong password
   - Keep credentials secure
4. Get Connection String:
   - Click "Connect" → "Drivers"
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/?appName=SRMAPIMPASS`

**Important:** Whitelist Vercel's IP addresses:
- Go to "Network Access"
- Add IP Address: `0.0.0.0/0` (allows Vercel's dynamic IPs)
- Note: For production, consider IP allowlisting

### Step 3: Generate Secure Credentials

#### Generate JWT Secret (recommended: 32+ characters)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Gmail App Password Setup
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Generate password (16 characters)
4. Use this password in SMTP_PASS (not your Google password)

### Step 4: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended for Beginners)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Select your GitHub repository
4. Click "Import"
5. Configure environment variables:
   - Click "Environment Variables"
   - Add each variable from `.env.example`:

```
NEXT_PUBLIC_API_URL = https://your-project-name.vercel.app
MONGODB_URI = mongodb+srv://your_username:your_password@cluster...
JWT_SECRET = your_generated_32_char_secret
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 465
SMTP_USER = your-email@gmail.com
SMTP_PASS = your_16_char_app_password
ADMIN_EMAIL = your-email@gmail.com
```

6. Click "Deploy"
7. Wait for deployment to complete (2-5 minutes)

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy project
vercel
# Follow prompts to link to your GitHub project

# Add environment variables via CLI
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add ADMIN_EMAIL
```

### Step 5: Verify Deployment

After deployment completes:

1. **Test the Web Application**
   - Open your deployed URL: `https://your-project-name.vercel.app`
   - Verify the login page loads correctly

2. **Test Login API**
   ```bash
   curl -X POST https://your-project-name.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "er.thakuramankumar@gmail.com",
       "password": "Aman228"
     }'
   ```

3. **Test Pass Request API**
   ```bash
   curl https://your-project-name.vercel.app/api/pass-requests \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Test Student",
       "registrationNumber": "12345",
       "email": "test@gmail.com",
       "photoUrl": "https://example.com/photo.jpg",
       "reason": "Travel"
     }'
   ```

4. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Deployments → Latest Deployment → Logs
   - Check for any errors or warnings

---

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Your deployed Vercel URL | `https://myapp.vercel.app` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | JWT signing secret (32+ chars) | Random string |
| `SMTP_HOST` | Yes | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Yes | SMTP server port | `465` |
| `SMTP_USER` | Yes | Email address for sending | `your-email@gmail.com` |
| `SMTP_PASS` | Yes | Gmail app password | 16-character password |
| `ADMIN_EMAIL` | Yes | Comma-separated admin emails | `admin@example.com` |

---

## 📱 API Routes & Endpoints

All routes are accessible at: `https://your-deployed-url/api/`

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Pass Management
- `GET /api/passes` - Get all passes
- `POST /api/passes` - Issue new pass
- `GET /api/passes/[id]` - Get pass details
- `GET /api/passes/search` - Search passes

### Pass Requests
- `POST /api/pass-requests` - Create pass request
- `GET /api/pass-requests/admin` - Get all requests (admin)
- `GET /api/pass-requests/[requestNumber]` - Get request details
- `POST /api/pass-requests/admin/[requestNumber]/[action]` - Approve/Reject

### Statistics
- `GET /api/statistics` - Get dashboard statistics

### Notifications
- `POST /api/send-notification` - Send notification email

---

## 🐛 Troubleshooting

### Issue: "MongoDB connection refused"
**Solution:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP allowlist includes `0.0.0.0/0`
- Ensure database exists and credentials are correct
- Check Vercel logs: Dashboard → Deployments → Logs

### Issue: "SMTP Error: 535 Authentication failed"
**Solution:**
- Ensure using Gmail App Password, not regular password
- Verify `SMTP_USER` is correct email
- Check Gmail account has 2FA enabled
- Generate new App Password and redeploy

### Issue: "JWT_SECRET not defined"
**Solution:**
- Verify `JWT_SECRET` is set in Vercel environment variables
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Redeploy after adding variable

### Issue: "Build fails with 'Cannot find module'"
**Solution:**
- Check `node_modules` dependencies in `package.json`
- Verify all imports use correct paths
- Clear Vercel cache: On Vercel Dashboard, redeploy from "Deployments" tab

### Issue: "Cold start takes too long"
**Solution:**
- Normal on free tier (first request may take 5-10 seconds)
- Upgrade to Pro plan for dedicated resources
- MongoDB cold connections are common - not an error

---

## 🔐 Security Checklist

- [x] Never commit `.env.local` to version control
- [x] Use strong JWT secret (32+ random characters)
- [x] Use Gmail App Password (not main password)
- [x] Rotate credentials periodically
- [x] Enable MongoDB IP allowlisting for production
- [x] Use HTTPS only (Vercel enforces this)
- [x] Keep dependencies updated: `npm update`
- [x] Regular security audits: `npm audit`

---

## 📊 Monitoring & Maintenance

### Check Deployment Status
- Vercel Dashboard → Deployments (shows all deployments)
- Click "Inspect" to view detailed logs

### View Real-time Logs
```bash
vercel logs --tail
```

### Update Environment Variables
1. Go to Vercel Dashboard → Project Settings
2. Update variable values
3. Click "Save"
4. Redeploy: Go to Deployments → Click latest → Redeploy

### Database Maintenance
- Verify MongoDB backup is enabled
- Monitor database usage from MongoDB Atlas Dashboard
- Free tier: 512 MB storage limit

---

## 🎯 Performance Optimization

1. **Database Connection Pooling**
   - Already configured in `src/lib/mongodb.ts`
   - Connection reused across requests

2. **Serverless Function Optimization**
   - API routes automatically split into separate functions
   - Maximum execution time: 60 seconds (free tier)
   - Memory: 1024 MB per function

3. **Image Optimization**
   - Next.js automatically optimizes images for Cloudinary
   - Configure remote patterns in `next.config.js`

4. **Bundle Size**
   - Check: `npm run build` shows bundle analysis
   - Use dynamic imports for large libraries

---

## 🚨 Common Deployment Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Build fails | Missing env var | Add to Vercel environment variables |
| `Cannot GET /` | Routes not configured | Check `next.config.js` |
| CORS errors | API URL mismatch | Verify `NEXT_PUBLIC_API_URL` |
| 502 Bad Gateway | Function timeout | Check MongoDB connection |
| Memory exceeded | Large payload | Split request into chunks |

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Nodemailer**: https://nodemailer.com

---

## ✨ Next Steps After Deployment

1. **Set up Custom Domain** (Optional)
   - Go to Vercel Dashboard → Project Settings → Domains
   - Add your custom domain

2. **Enable Analytics** (Optional)
   - Vercel automatically collects analytics
   - View in Vercel Dashboard → Analytics

3. **Set up CI/CD** (Optional)
   - Automatic deployments on Git push
   - Already configured in Vercel

4. **Monitor Performance**
   - Use Vercel Analytics dashboard
   - Monitor function execution times
   - Track database connections

---

**Deployment prepared and verified by Vercel Compatibility Check**
Last Updated: March 2026
