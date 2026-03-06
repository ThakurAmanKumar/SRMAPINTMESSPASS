# SRMAP Mess Pass Portal - Quick Start Guide

Follow these steps to get the application running and deployed.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create `.env.local` File

Copy the `.env.example` file to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials.

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page.

### Step 4: Login

Use these credentials:
- **Email:** er.thakuramankumar@gmail.com
- **Password:** Aman228

---

## 📋 Complete Setup Guide (For Production)

### Phase 1: MongoDB Setup (10 minutes)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up (it's free!)

2. **Create Cluster**
   - Click "Build a Cluster"
   - Choose "Shared" (M0 is free forever)
   - Select your preferred region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: (create any username)
   - Password: (create a strong password)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Get Connection String**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Drivers" option
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `myFirstDatabase` with `srmap-mess-pass`

5. **Update .env.local**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/srmap-mess-pass?retryWrites=true&w=majority
   ```

### Phase 2: Cloudinary Setup (10 minutes)

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up (free plan has 25GB/month)

2. **Get Cloud Name**
   - Go to Dashboard
   - Copy your "Cloud Name"

3. **Create API Key**
   - Go to Settings > API Keys
   - Copy your "API Key"
   - Copy your "API Secret"

4. **Create Upload Preset**
   - Go to Settings > Upload
   - Click "Add upload preset"
   - Name: `srmap_mess_pass`
   - Type: `Unsigned`
   - Click "Save"

5. **Update .env.local**
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Phase 3: Run Locally (2 minutes)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel (5 minutes)

### Option A: Connect GitHub (Recommended)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/srmap-mess-pass-portal.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Select your repository
   - Click "Import"

3. **Add Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from your `.env.local`:
     - MONGODB_URI
     - JWT_SECRET
     - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
     - CLOUDINARY_API_KEY
     - CLOUDINARY_API_SECRET
     - NEXT_PUBLIC_API_URL (set to your Vercel URL)
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live in 1-2 minutes!

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts and add environment variables when asked.

---

## ✅ Post-Deployment Checklist

- [ ] Application is accessible at your Vercel URL
- [ ] Login works with admin credentials
- [ ] Can issue a new pass
- [ ] Photo upload works
- [ ] Can view issued passes
- [ ] PDF download works
- [ ] Print functionality works

---

## 🔐 Security: Change Admin Credentials

After first successful login, **immediately change the admin credentials**:

1. Create a new admin user in MongoDB:
   ```javascript
   db.admins.updateOne(
     { email: "er.thakuramankumar@gmail.com" },
     { $set: { email: "your_email@example.com", password: "hashed_password" } }
   )
   ```

2. Or manually in MongoDB Atlas:
   - Go to "Data" > "Collections"
   - Find "admins" collection
   - Edit the admin document

---

## 🆘 Troubleshooting

### "Cannot find module 'mongoose'"
```bash
npm install mongoose
```

### "Database connection timeout"
- Check MongoDB connection string
- Whitelist your IP in MongoDB Atlas (Network Access)
- AWS: Whitelist 0.0.0.0/0 (if in development)

### "Photo upload fails"
- Check Cloudinary Cloud Name
- Verify upload preset is named exactly: `srmap_mess_pass`
- Check browser console for errors

### "Vercel deployment fails"
- Check Node.js version (should be 18.x)
- Review build logs in Vercel dashboard
- Ensure all environment variables are set

---

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🎯 Features Overview

### Dashboard
- Real-time statistics
- Total passes issued count
- Today's passes count
- Total students registered

### Issue Pass
- Upload student photo to Cloudinary
- Enter student name and registration
- Auto-generate unique Issue ID
- Real-time pass preview
- Instant confirmation

### Manage Passes
- Search by name, registration, or Issue ID
- View pass details
- Download as PDF
- Print pass card
- Delete with confirmation
- View all pass history

---

## 💡 Tips

1. **Test locally first** before deploying to Vercel
2. **Use Firefox/Chrome DevTools** to debug issues
3. **Check MongoDB Atlas** for actual data
4. **Monitor Vercel logs** for error details
5. **Keep environment variables secret** - never commit `.env.local`

---

## 📞 Support

For issues, check:
1. MongoDB Atlas console for data
2. Cloudinary dashboard for uploads
3. Vercel logs for errors
4. Browser console for client-side errors

---

**Happy Deploying! 🚀**
