# Vercel Deployment Guide

Complete step-by-step guide to deploy SRMAP Mess Pass Portal to Vercel.

## Prerequisites

- [ ] GitHub account (free at github.com)
- [ ] Vercel account (free at vercel.com)
- [ ] MongoDB Atlas database URL
- [ ] Cloudinary credentials
- [ ] All `.env` variables ready

## Step 1: Prepare Your Code

### 1.1 Create Git Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: SRMAP Mess Pass Portal"

# Create repository (if not already)
# Go to https://github.com/new and create 'srmap-mess-pass-portal'

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/srmap-mess-pass-portal.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.2 Verify .gitignore

Ensure `.gitignore` includes:
```
node_modules/
.next/
.env
.env.local
```

### 1.3 Update next.config.js

Ensure MongoDB external package is configured:
```javascript
experimental: {
  serverComponentsExternalPackages: ['mongoose'],
}
```

## Step 2: Deploy to Vercel

### 2.1 Via Vercel Dashboard (Easiest)

1. **Visit Vercel**
   - Go to https://vercel.com/login
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework: `Next.js`
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - (These auto-detect, no action needed)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable from `.env.local`:

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://username:password@cluster.mongodb.net/srmap-mess-pass
   Environments: Production, Preview, Development
   ```

   Repeat for:
   - `JWT_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_API_URL` (set to your domain)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live!

### 2.2 Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? Yes (if you have one)
# - Build settings OK? Yes
# - Add environment variables? (paste .env.local values)
```

## Step 3: Configure Environment Variables

### 3.1 MongoDB Atlas IP Whitelist

Since Vercel runs on dynamic IPs, whitelist 0.0.0.0/0:

1. Go to MongoDB Atlas Dashboard
2. Network Access > IP Access List
3. Click "Add IP Address"
4. Enter: `0.0.0.0/0` (allows all IPs)
5. Add description: "Vercel deployment"
6. Click "Confirm"

⚠️ **Note:** This is acceptable for development. For production, use:
- Vercel's static IPs list (check documentation)
- Or use API key authentication

### 3.2 Cloudinary Unsigned Upload

Ensure you've created unsigned upload preset:
1. Cloudinary Dashboard > Settings > Upload
2. Add Upload Preset
3. Name: `srmap_mess_pass`
4. Unsigned: `ON`
5. Save

### 3.3 Update API URL

For production, update environment variable:
```
NEXT_PUBLIC_API_URL=https://your-project-name.vercel.app
```

## Step 4: Testing Deployment

### 4.1 Test Application

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. You should see login page
3. Test login with: 
   - Email: `er.thakuramankumar@gmail.com`
   - Password: `Aman228`

### 4.2 Test Features

- [ ] Login works
- [ ] Can access dashboard
- [ ] Statistics load correctly
- [ ] Can issue a pass
- [ ] Photo upload works
- [ ] Can view all passes
- [ ] Search functionality works
- [ ] PDF download works
- [ ] Print works
- [ ] Delete works

### 4.3 Check Logs

In Vercel Dashboard:
1. Go to Deployments
2. Click latest deployment
3. View Logs tab for any errors

## Step 5: Custom Domain (Optional)

### 5.1 Connect Domain

1. In Vercel Dashboard, go to Settings > Domains
2. Click "Add"
3. Enter your domain (e.g., `mess-pass.example.com`)
4. Follow DNS configuration

### 5.2 Update DNS

1. Go to your domain provider (GoDaddy, Namecheap, etc.)
2. Add CNAME record:
   - Name: (subdomain or @)
   - Value: `cname.vercel-dns.com`

3. Wait for DNS propagation (10-60 minutes)

## Step 6: Production Checklist

- [ ] Domain configured (if using custom domain)
- [ ] All environment variables set
- [ ] MongoDB whitelist includes Vercel IPs
- [ ] Admin credentials changed
- [ ] HTTPS working (automatic)
- [ ] Application performance acceptable
- [ ] Errors monitored (Vercel analytics)
- [ ] Backups configured (MongoDB)

## Troubleshooting

### "Build Failed"

Check Vercel logs:
```
Error: Cannot find module 'mongoose'
```

**Solution:** Ensure `mongoose` is in dependencies, not devDependencies

### "MongoDB Connection Timeout"

**Solution:**
1. Check connection string is correct
2. Whitelist Vercel IPs in MongoDB
3. Database user password has special characters? URL-encode it

### "Cloudinary Upload Fails"

**Solution:**
1. Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
2. Verify unsigned preset exists: `srmap_mess_pass`
3. Check browser CORS settings

### "Token Invalid After Deployment"

**Solution:**
1. JWT_SECRET is same in all environments
2. Clear browser localStorage
3. Re-login

### "Blank Page / 500 Error"

**Solution:**
1. Check Vercel logs for errors
2. Open browser DevTools Console
3. Check MongoDB connection
4. Verify all environment variables

## Updating Production

After making changes:

```bash
# Make changes locally
# Test with: npm run dev

# Commit and push
git add .
git commit -m "Fix: [describe changes]"
git push origin main

# Vercel auto-deploys! No additional step needed
```

## Monitoring

### Vercel Analytics
- Dashboard shows real-time traffic
- Check "Analytics" tab for performance

### MongoDB
- Go to Metrics in MongoDB Atlas
- Monitor connections and operations

### Error Tracking
- Vercel shows error logs in Deployments
- Check production logs regularly

## Rollback

If deployment has issues:

```bash
# View deployment history
vercel list

# Rollback to previous
vercel rollback
```

Or via Dashboard:
1. Deployments tab
2. Select previous working deployment
3. Click "Promote to Production"

## Performance Optimization

### Enable Caching

Add to `.env`:
```
VERCEL_ENV=production
```

### Image Optimization

Already uses Next.js Image component for optimization.

### Database Indexes

In MongoDB, add indexes on frequently searched fields:
```javascript
db.passes.createIndex({ fullName: 1 })
db.passes.createIndex({ regNumber: 1 })
db.passes.createIndex({ issueId: 1 })
```

## Security

- ✅ Environment variables not exposed
- ✅ HTTPS enabled
- ✅ JWT tokens secure
- ✅ Passwords hashed with bcryptjs
- ⚠️ MongoDB whitelist needs hardening for production

## Cost

**Vercel:** FREE tier includes:
- 100 GB bandwidth/month
- Unlimited builds/deployments
- Unlimited serverless functions (up to 12 sec)
- Performance monitoring

**MongoDB:** FREE tier includes:
- 512 MB storage (auto-expands if needed)
- 3 shared nodes
- Good for small projects

**Cloudinary:** FREE tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- Plenty for this project

**Total Cost:** $0/month 🎉

## Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/
- Cloudinary Docs: https://cloudinary.com/documentation

---

**Deployment Successful! 🚀**

Your SRMAP Mess Pass Portal is now live and accessible on the internet!
