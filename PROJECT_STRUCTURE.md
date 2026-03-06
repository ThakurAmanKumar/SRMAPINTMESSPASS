# Project Structure & File Guide

Complete overview of all project files and their purposes.

## 📁 Directory Structure

```
srmap-mess-pass-portal/
│
├── 📄 Configuration Files
│   ├── package.json                 # Project dependencies & scripts
│   ├── next.config.js              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── .eslintrc.json              # ESLint configuration
│   ├── vercel.json                 # Vercel deployment config
│   └── .gitignore                  # Git ignore rules
│
├── 📝 Documentation Files
│   ├── README.md                    # Main project documentation
│   ├── QUICK_START.md              # Quick setup guide
│   ├── DEPLOYMENT_GUIDE.md         # Vercel deployment instructions
│   ├── API_DOCUMENTATION.md        # API endpoints reference
│   └── PROJECT_STRUCTURE.md        # This file
│
├── 🔐 Environment Files
│   ├── .env.example                # Environment variables example
│   └── .env.local.example          # Detailed env template with comments
│
├── src/
│   ├── 🏗️ app/                     # Next.js App Router
│   │   ├── layout.tsx              # Root layout (wraps all pages)
│   │   ├── globals.css             # Global styles with Tailwind
│   │   ├── page.tsx                # Root page (redirects to /login)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx            # Admin login page
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts  # POST - Admin login
│   │   │   │   └── verify/route.ts # GET - Verify JWT token
│   │   │   │
│   │   │   ├── passes/
│   │   │   │   ├── route.ts        # POST - Create pass, GET - Get all
│   │   │   │   ├── [id]/route.ts   # GET - Get specific, DELETE - Delete
│   │   │   │   └── search/route.ts # GET - Search passes
│   │   │   │
│   │   │   └── statistics/
│   │   │       └── route.ts        # GET - Dashboard statistics
│   │   │
│   │   └── dashboard/              # Protected routes
│   │       ├── layout.tsx          # Dashboard layout with sidebar
│   │       ├── page.tsx            # Dashboard with statistics
│   │       ├── issue-pass/
│   │       │   └── page.tsx        # Create new pass page
│   │       └── issued-passes/
│   │           └── page.tsx        # Manage all passes page
│   │
│   ├── 🧩 components/              # Reusable React components
│   │   ├── ProtectedRoute.tsx      # Auth wrapper for protected pages
│   │   ├── Sidebar.tsx             # Dashboard sidebar navigation
│   │   ├── StatCard.tsx            # Statistics card component
│   │   └── PassCard.tsx            # Student pass card design
│   │
│   ├── 📚 lib/                     # Utility functions
│   │   ├── mongodb.ts              # MongoDB connection
│   │   ├── jwt.ts                  # JWT token utilities
│   │   └── auth-middleware.ts      # Auth middleware helper
│   │
│   ├── 📊 models/                  # MongoDB/Mongoose models
│   │   ├── Pass.ts                 # Pass document schema
│   │   └── Admin.ts                # Admin user schema
│   │
│   └── 🔤 types/
│       └── global.d.ts             # Global TypeScript definitions
│
└── 📦 public/                       # Static assets (if needed)
```

## 📄 File Descriptions

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies, scripts, and metadata |
| `next.config.js` | Next.js settings (images, experimental features) |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.ts` | Tailwind CSS theme and customization |
| `postcss.config.js` | PostCSS plugins (Tailwind, autoprefixer) |
| `.eslintrc.json` | Code linting rules |
| `vercel.json` | Vercel deployment settings |
| `.gitignore` | Git ignore patterns |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Complete project overview and setup |
| `QUICK_START.md` | Fast setup (5-30 minutes) |
| `DEPLOYMENT_GUIDE.md` | Detailed Vercel deployment steps |
| `API_DOCUMENTATION.md` | API endpoints and usage |
| `PROJECT_STRUCTURE.md` | This file - directory overview |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | Authenticate admin user |
| `/api/auth/verify` | GET | Verify JWT token validity |
| `/api/passes` | GET | Get all passes |
| `/api/passes` | POST | Create new pass |
| `/api/passes/[id]` | GET | Get specific pass |
| `/api/passes/[id]` | DELETE | Delete pass |
| `/api/passes/search` | GET | Search passes |
| `/api/statistics` | GET | Get dashboard stats |

### Frontend Pages

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | Admin authentication |
| Dashboard | `/dashboard` | Main dashboard with stats |
| Issue Pass | `/dashboard/issue-pass` | Create new student pass |
| Issued Passes | `/dashboard/issued-passes` | Manage all passes |

### Database Collections

#### Pass Collection
```javascript
{
  _id: ObjectId,
  issueId: String,      // SRMAPIM01, SRMAPIM02, etc.
  fullName: String,     // Student name
  regNumber: String,    // Registration number
  photoUrl: String,     // Cloudinary URL
  issuedDate: Date,     // When pass was issued
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

#### Admin Collection
```javascript
{
  _id: ObjectId,
  email: String,        // Admin email
  password: String,     // Hashed password
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

## 🔑 Key Features by File

### Authentication (`lib/jwt.ts`, `models/Admin.ts`)
- JWT token generation and verification
- Admin credentials with bcryptjs hashing
- Token expiration (24 hours default)

### Database (`lib/mongodb.ts`, `models/`)
- MongoDB connection pooling
- Mongoose schemas and models
- Data validation

### API Routes (`app/api/`)
- RESTful endpoints
- JWT authentication required
- Error handling
- Database operations

### Frontend Components (`components/`, `app/`)
- Protected routes with auth check
- Responsive design with Tailwind
- Real-time statistics
- Pass card with professional styling

### Pass Management
- Automatic Issue ID generation
- Cloudinary image upload
- PDF generation with jsPDF
- Print functionality with react-to-print
- Search and filter capabilities

## 🚀 Development Workflow

### 1. Local Development
```bash
npm run dev              # Start dev server
# Edit files in src/
# Changes auto-reload
```

### 2. Testing
```bash
npm run build            # Build for production
npm start               # Run production build locally
```

### 3. Deployment
```bash
git push origin main     # Push to GitHub
# Vercel auto-deploys   # ~2-3 minutes
```

## 📊 Dependencies

### Production
- **next**: React framework
- **react**: UI library
- **mongodb**: Database driver
- **mongoose**: ORM for MongoDB
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **next-cloudinary**: Cloudinary integration
- **tailwindcss**: CSS framework
- **jspdf**: PDF generation
- **html2canvas**: HTML to image conversion
- **react-to-print**: Print functionality
- **lucide-react**: Icon library
- **axios**: HTTP client

### Development
- **typescript**: Type safety
- **eslint**: Code linting
- **postcss**: CSS processing
- **autoprefixer**: CSS vendor prefixes

## 🔐 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | mongodb+srv://user:pass@cluster... |
| `JWT_SECRET` | Token signing key | random_32_char_string |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary account | my-cloud |
| `CLOUDINARY_API_KEY` | Upload authentication | 1234567890 |
| `CLOUDINARY_API_SECRET` | Upload signing | secret_key |
| `NEXT_PUBLIC_API_URL` | API base URL | http://localhost:3000 |

## 📈 Data Flow

```
User Request
    ↓
Next.js Page/Route
    ↓
JWT Verification (Protected routes)
    ↓
Database Query/Mutation
    ↓
API Response
    ↓
Client Update (React state)
    ↓
UI Render
```

## 🔄 Authentication Flow

```
1. User enters credentials
2. POST /api/auth/login
3. Verify password with bcryptjs
4. Generate JWT token
5. Store token in localStorage
6. Set Authorization header
7. Use token for all requests
8. GET /api/auth/verify (periodic check)
9. Redirect to /login if invalid
```

## 📦 Build Process

```
npm run build
    ↓
TypeScript Compilation
    ↓
Tailwind CSS Processing
    ↓
Next.js Optimization
    ↓
Static Generation (if applicable)
    ↓
.next folder (output)
```

## 🌐 Deployment Flow

```
git push origin main
    ↓
GitHub webhook → Vercel
    ↓
Vercel detects changes
    ↓
npm install
    ↓
npm run build
    ↓
Verification
    ↓
Deploy to CDN + Serverless
    ↓
Live on production URL
```

## 💾 File Size Reference

| Type | Approximate Size |
|------|------------------|
| Node modules | ~500MB |
| Build output (.next) | ~50MB |
| Source code (src/) | ~200KB |
| Assets | ~100KB |

## 🆘 Quick Reference

### Common Commands
```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm start              # Run production build
npm run lint           # Run ESLint
```

### Important URLs
- **Development**: http://localhost:3000
- **Login**: /login
- **Dashboard**: /dashboard
- **API Base**: /api

### Key Skills Needed
- Next.js/React
- MongoDB/Mongoose
- Tailwind CSS
- JWT/Authentication
- REST APIs

## 📚 Learning Resources

- Next.js: https://nextjs.org/docs
- MongoDB: https://docs.mongodb.com/
- Tailwind: https://tailwindcss.com/docs
- JWT: https://jwt.io/
- Cloudinary: https://cloudinary.com/documentation

---

**Total Files:** ~25
**Total Lines of Code:** ~2000+
**Time to Setup:** 10-30 minutes
**Time to Deploy:** 5-10 minutes

🎉 **You're ready to build and deploy!**
