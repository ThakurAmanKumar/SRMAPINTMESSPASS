# 🚀 Setup Checklist - SRMAP Mess Pass Portal

Complete this checklist to ensure everything is properly configured.

## Phase 1: Project Setup (5 minutes)

### Environment Preparation
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] VS Code or preferred code editor open
- [ ] Project folder opened in editor
- [ ] Terminal ready in project root

### Dependencies Installation
- [ ] Run `npm install` successfully
- [ ] No error messages in installation log
- [ ] `node_modules/` folder created
- [ ] `package-lock.json` present

### Project Files
- [ ] All source files created in `src/` directory
- [ ] Configuration files present (next.config.js, tsconfig.json, etc.)
- [ ] Documentation files present (README.md, QUICK_START.md, etc.)

---

## Phase 2: Environment Configuration (5 minutes)

### Create .env.local File
- [ ] Create `.env.local` file in project root
- [ ] Copy contents from `.env.example` or `.env.local.example`
- [ ] File is NOT tracked in git (in .gitignore)

### MongoDB Setup Required
- [ ] MongoDB Atlas account created (https://www.mongodb.com/cloud/atlas)
- [ ] Free tier cluster created (M0)
- [ ] Database user created with password
- [ ] Database named `srmap-mess-pass`
- [ ] Connection string copied
- [ ] IP whitelist includes your IP (0.0.0.0/0 for development)
- [ ] MONGODB_URI added to .env.local

### Cloudinary Setup Required
- [ ] Cloudinary account created (https://cloudinary.com)
- [ ] Cloud Name copied
- [ ] API Key obtained
- [ ] API Secret obtained
- [ ] Unsigned upload preset created named `srmap_mess_pass`
- [ ] All credentials added to .env.local

### .env.local Complete
- [ ] MONGODB_URI ✓
- [ ] JWT_SECRET ✓
- [ ] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ✓
- [ ] CLOUDINARY_API_KEY ✓
- [ ] CLOUDINARY_API_SECRET ✓
- [ ] NEXT_PUBLIC_API_URL ✓

---

## Phase 3: Local Testing (10 minutes)

### Start Development Server
- [ ] Run command: `npm run dev`
- [ ] No build errors
- [ ] Server ready on localhost:3000
- [ ] Terminal shows "ready - started server on"

### Test Login Page
- [ ] Uncomment auth test routes if needed
- [ ] Application loads without errors
- [ ] Redirected to `/login` from root
- [ ] Login page displays properly
- [ ] Form fields visible (email, password)

### Test Admin Login
- [ ] Enter Email: `er.thakuramankumar@gmail.com`
- [ ] Enter Password: `Aman228`
- [ ] Click "Login" button
- [ ] No error messages
- [ ] Redirected to `/dashboard`

### Test Dashboard
- [ ] Dashboard page loads
- [ ] Statistics cards display (3 cards)
- [ ] Sidebar navigation visible
- [ ] All menu items clickable
- [ ] No console errors

### Test Issue Pass Page
- [ ] Click "Issue Pass" in sidebar
- [ ] Form displays correctly
- [ ] Photo upload field visible
- [ ] Full Name input field works
- [ ] Registration Number input works
- [ ] Can select a test image

### Test Pass Preview & Creation
- [ ] Fill in test student data
- [ ] Upload a test photo
- [ ] Click "Issue Pass" button
- [ ] Wait for success message
- [ ] Pass preview appears
- [ ] Issue ID generated (SRMAPIM01)
- [ ] Pass card displays student photo

### Test Issued Passes Page
- [ ] Click "Issued Passes" in sidebar
- [ ] Previously created pass appears in table
- [ ] Search functionality works
- [ ] Filter returns correct results
- [ ] Action buttons visible (View, Download, Print, Delete)

### Test Pass Actions
- [ ] View Pass: Opens preview on right
- [ ] Download PDF: File downloads
- [ ] Print: Opens print dialog
- [ ] Delete: Shows confirmation, removes from list

### Test Logout
- [ ] Click "Logout" button in sidebar
- [ ] Redirected to `/login`
- [ ] Token cleared from localStorage
- [ ] Need to login again to access dashboard

---

## Phase 4: Production Build (5 minutes)

### Build Test
- [ ] Run: `npm run build`
- [ ] Build succeeds (no errors)
- [ ] `.next` folder created
- [ ] File sizes reasonable

### Production Server Test
- [ ] Run: `npm start`
- [ ] Application starts without error
- [ ] All features work same as dev mode
- [ ] Database queries work
- [ ] Image uploads work

---

## Phase 5: Database & API (10 minutes)

### MongoDB Verification
- [ ] MongoDB Atlas account accessible
- [ ] Connection successful
- [ ] Check database in MongoDB Atlas:
  - [ ] "srmap-mess-pass" database exists
  - [ ] "passes" collection created
  - [ ] "admins" collection created
  - [ ] Can see documents created

### API Endpoints Testing (Optional - for developers)

#### Test with cURL or Postman:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"er.thakuramankumar@gmail.com","password":"Aman228"}'
```

- [ ] Returns JWT token
- [ ] Save token for next tests

```bash
# 2. Verify Token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Returns valid: true

```bash
# 3. Get All Passes
curl -X GET http://localhost:3000/api/passes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Returns array of passes
- [ ] Includes created passes

```bash
# 4. Get Statistics
curl -X GET http://localhost:3000/api/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] Returns totalPasses, todaysPasses, totalStudents

---

## Phase 6: Deployment Preparation (10 minutes)

### Git Setup
- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Local repo initialized: `git init`
- [ ] Files added: `git add .`
- [ ] Committed: `git commit -m "Initial commit"`
- [ ] Remote added: `git remote add origin [URL]`
- [ ] Pushed: `git push -u origin main`

### GitHub Verification
- [ ] All files visible on GitHub
- [ ] `.env.local` NOT in repository
- [ ] `.gitignore` configured properly
- [ ] README.md visible

### Vercel Account
- [ ] Vercel account created (vercel.com)
- [ ] Connected with GitHub account
- [ ] GitHub access authorized

---

## Phase 7: Deploy to Vercel (5-10 minutes)

### Vercel Project Setup
- [ ] Dashboard opens in Vercel
- [ ] Repository imported successfully
- [ ] Build settings auto-configured
- [ ] Framework: Next.js detected

### Environment Variables in Vercel
- [ ] All 6 environment variables added:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
  - [ ] NEXT_PUBLIC_API_URL (your vercel domain)

### MongoDB IP Whitelist
- [ ] MongoDB Atlas updated
- [ ] Vercel IPs whitelisted (or 0.0.0.0/0)
- [ ] Test connection works

### Deployment
- [ ] Click "Deploy" on Vercel
- [ ] Build completes (2-3 minutes)
- [ ] Deployment successful message shown
- [ ] Vercel URL generated

### Post-Deployment Testing
- [ ] Visit Vercel URL
- [ ] Redirected to login page
- [ ] Login functionality works
- [ ] Create a test pass
- [ ] Photo upload works
- [ ] All features functional
- [ ] No 500 errors

---

## Phase 8: Security & Polish (Final Checks)

### Security Checklist
- [ ] No passwords in code
- [ ] All secrets in environment variables
- [ ] .env.local not in git
- [ ] JWT secret is strong (32+ chars)
- [ ] Change admin password after first use (recommended)
- [ ] MongoDB password secured
- [ ] Cloudinary keys not exposed
- [ ] HTTPS enabled (automatic on Vercel)

### Code Quality
- [ ] No console.log() debug lines
- [ ] No commented-out code
- [ ] TypeScript compiles without errors
- [ ] No ESLint warnings (severe ones)

### Documentation
- [ ] README.md complete
- [ ] QUICK_START.md accurate
- [ ] API_DOCUMENTATION.md present
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] Comments in code where needed

### Performance
- [ ] Page loads quickly (<3s)
- [ ] Images optimized
- [ ] No memory leaks in browser
- [ ] Database queries efficient

---

## Final Verification

### Features Working
- [ ] User can login
- [ ] Dashboard displays statistics
- [ ] Can issue new passes
- [ ] Photos upload to Cloudinary
- [ ] Issue IDs auto-generate correctly
- [ ] Can view all passes
- [ ] Search functionality works
- [ ] Can download PDF
- [ ] Can print pass
- [ ] Can delete pass
- [ ] Logout works

### Data Persistence
- [ ] Database saves data correctly
- [ ] Data persists after page refresh
- [ ] Data persists after logout/login
- [ ] MongoDB Atlas shows documents

### Error Handling
- [ ] Invalid login shows error
- [ ] Missing fields show error
- [ ] Network errors handled gracefully
- [ ] Upload fails handled properly

---

## Troubleshooting Checkpoints

If something doesn't work, check:

### Won't Start Locally
- [ ] Node.js version correct (18+)
- [ ] Dependencies installed (`npm install`)
- [ ] Port 3000 not in use
- [ ] No syntax errors in code

### Login Fails
- [ ] MongoDB connection works
- [ ] Credentials correct
- [ ] Email exactly: `er.thakuramankumar@gmail.com`
- [ ] Password exactly: `Aman228`

### Photo Upload Fails
- [ ] Cloudinary credentials correct
- [ ] Upload preset name exact: `srmap_mess_pass`
- [ ] Preset is unsigned
- [ ] File size < 5MB
- [ ] Browser allows access

### Won't Deploy to Vercel
- [ ] GitHub push successful
- [ ] All env vars added
- [ ] Build succeeds locally first
- [ ] No sensitive data in code
- [ ] Next.js version compatible

### Data Not Saving
- [ ] MongoDB connection working
- [ ] Database user has correct permissions
- [ ] IP whitelist includes your IP
- [ ] Collections created in database

---

## 📊 Summary

```
Tasks Completed: ___/80

Estimated Time to Complete All: 1-2 hours

After Completion:
✓ Application running locally
✓ All features tested
✓ Deployed to Vercel
✓ Live on internet
✓ Production ready
```

---

## 🎉 You're Done!

When all checkboxes are checked:

1. ✅ Local development complete
2. ✅ Production build tested
3. ✅ Deployed to Vercel
4. ✅ All features working
5. ✅ Database configured
6. ✅ Image uploads working
7. ✅ API endpoints tested

**Your SRMAP Mess Pass Portal is ready for use!**

### Next Steps:
- Share Vercel URL with users
- Change admin password for security
- Monitor application in Vercel dashboard
- Back up MongoDB regularly
- Keep dependencies updated

---

**Last Updated:** March 5, 2024
**Status:** Ready for Deployment
**Confidence:** 99% 🚀
