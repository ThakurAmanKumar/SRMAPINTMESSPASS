# SRMAP International Mess Pass Portal

A production-ready full-stack web application for managing international mess access passes for SRM University AP students.

Link : https://srmapimpass.indevs.in/mess-pass-request

## Features

✅ **Admin Authentication** - Secure JWT-based login system
✅ **Dashboard** - Real-time statistics and analytics
✅ **Issue Passes** - Create and manage student passes with photo upload
✅ **Pass Management** - Search, view, print, and download passes as PDF
✅ **Professional Pass Cards** - University-style ID cards with student photos
✅ **Responsive Design** - Mobile-friendly interface with Tailwind CSS
✅ **Vercel Compatible** - Fully deployable on Vercel free plan

## Tech Stack

**Frontend:**
- Next.js 14 (React + App Router)
- Tailwind CSS
- Lucide Icons
- jsPDF & html2canvas (PDF generation)

**Backend:**
- Next.js API Routes
- MongoDB/Mongoose (Database)
- JWT Authentication
- bcryptjs (Password hashing)

**Services:**
- Cloudinary (Image upload)
- Vercel (Deployment)

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- Cloudinary account
- Vercel account (for deployment)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd srmap-mess-pass-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/srmap-mess-pass

# JWT Secret (change this in production)
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Setting Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new project
4. Create a cluster (M0 free tier)
5. Create a database user with username and password
6. Get the connection string and add it to `.env.local`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/srmap-mess-pass?retryWrites=true&w=majority`

### 5. Setting Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account
3. Go to Dashboard to get your Cloud Name
4. Generate API Key and Secret
5. Add these to `.env.local`

**Important:** Create an unsigned upload preset in Cloudinary:
- Go to Settings > Upload > Upload presets
- Create new: `srmap_mess_pass` (unsigned)
- This allows client-side uploads without exposing API secrets

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Admin Login Credentials

**Email:** `er.thakuramankumar@gmail.com`
**Password:** `Aman228`

> ⚠️ **IMPORTANT:** Change these credentials immediately after first login in production!

## Application Flow

### 1. Login
- Root URL `/` automatically redirects to `/login`
- Admin logs in with email and password
- JWT token is stored in localStorage

### 2. Dashboard
- View statistics (total passes, today's passes, total students)
- Quick access to main features

### 3. Issue Pass
- Upload student photo
- Enter student name and registration number
- Automatic Issue ID generation (SRMAPIM01, SRMAPIM02, etc.)
- Real-time pass preview
- Photo upload to Cloudinary

### 4. Issued Passes
- View all issued passes in table format
- Search by name, registration number, or issue ID
- View pass details
- Download pass as PDF
- Print pass card
- Delete pass (with confirmation)

## Issue ID Format

- **Prefix:** SRMAPIM (fixed)
- **Number:** Auto-incremented (01, 02, 03, ...)
- **Example:** SRMAPIM01, SRMAPIM02, etc.

The first pass gets SRMAPIM01, second gets SRMAPIM02, and so on automatically.

## Pass Card Design

The pass card includes:
- SRM University AP branding
- Student photo
- Full name
- Registration number
- Approval text from International Mess Committee
- Unique Issue ID
- Issued date
- Professional styling with Tailwind CSS

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Passes
- `POST /api/passes` - Create new pass
- `GET /api/passes` - Get all passes
- `GET /api/passes/[id]` - Get specific pass
- `DELETE /api/passes/[id]` - Delete pass
- `GET /api/passes/search?q=query` - Search passes

### Statistics
- `GET /api/statistics` - Get dashboard statistics

All endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

### Pass Collection
```javascript
{
  issueId: String (unique),
  fullName: String,
  regNumber: String (unique),
  photoUrl: String,
  issuedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Collection
```javascript
{
  email: String (unique, lowercase),
  password: String (hashed with bcryptjs),
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Select the repository
5. Add environment variables (same as `.env.local`)
6. Click "Deploy"

### 3. Environment Variables on Vercel
- Go to Project Settings > Environment Variables
- Add all variables from `.env.local`
- Redeploy the project

## Security Checklist

- [ ] Change MongoDB password after first setup
- [ ] Change JWT_SECRET in production
- [ ] Change admin email and password after first login
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up MongoDB IP whitelist
- [ ] Use environment variables for all secrets
- [ ] Enable RLS/security rules in MongoDB Atlas
- [ ] Use unsigned Cloudinary presets for client uploads
- [ ] Implement rate limiting in production
- [ ] Set up CORS policies

## Troubleshooting

### "Failed to connect to MongoDB"
- Check MongoDB connection string in `.env.local`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify database user credentials

### "Photo upload fails"
- Check Cloudinary Cloud Name and preset name
- Ensure unsigned upload preset `srmap_mess_pass` exists
- Verify API keys are correct
- Check network tab in browser for error details

### "Unauthorized error on protected routes"
- Check if token exists in localStorage
- Verify JWT_SECRET is same in all places
- Check token expiration time
- Clear browser cache and localStorage

### "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Performance Tips

1. **Image Optimization**
   - Cloudinary automatically optimizes images
   - Use appropriate image sizes for previews
   - Lazy load images in tables

2. **Database Optimization**
   - Add indexes on frequently searched fields
   - Use pagination for large datasets
   - Cache statistics results

3. **Frontend Optimization**
   - Use Next.js Image component
   - Implement code splitting
   - Minimize bundle size

## File Structure

```
srmap-mess-pass-portal/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   ├── passes/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── search/route.ts
│   │   │   └── statistics/route.ts
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── issue-pass/page.tsx
│   │   │   └── issued-passes/page.tsx
│   │   ├── login/page.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar.tsx
│   │   ├── PassCard.tsx
│   │   └── StatCard.tsx
│   ├── lib/
│   │   ├── mongodb.ts
│   │   └── jwt.ts
│   └── models/
│       ├── Pass.ts
│       └── Admin.ts
├── public/
├── .env.example
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## License

This project is proprietary and owned by SRM University AP International Mess Committee.

## Support

For issues or questions, please contact the International Mess Committee.

---

**Made with ❤️ for SRM University AP**
