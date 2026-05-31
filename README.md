DEPLOYMENT VIDEO LINK- https://drive.google.com/file/d/1wJ_RROldTXtW7j2P_E8t_RiuGzYZqLJQ/view?usp=sharing
# 🏦 LoanFlow — Full Stack Loan Management System

A production-ready, full-stack Loan Management System with multi-role operations dashboard, BRE validation, multi-step borrower flow, live interest calculation, and end-to-end loan lifecycle management.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** — fully type-safe
- **Tailwind CSS** — custom dark design system
- **Zustand** — auth + loan application state
- **React Hook Form + Zod** — form validation
- **Axios** — API client with interceptors
- **Sonner** — toast notifications

### Backend
- **Node.js + Express** — REST API
- **TypeScript** — type-safe throughout
- **MongoDB + Mongoose** — database
- **JWT + bcrypt** — authentication
- **Multer + Cloudinary** — file uploads
- **express-validator** — server-side validation

---

## 📁 Folder Structure

```
loan-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # DB + Cloudinary
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth + Role guards
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── seed/           # Database seed
│   │   ├── services/       # BRE + Interest calc
│   │   ├── types/          # TypeScript types
│   │   ├── validators/     # express-validator rules
│   │   └── app.ts          # Express entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── login/          # Auth pages
    │   │   ├── register/
    │   │   ├── apply/          # Multi-step loan form
    │   │   └── dashboard/      # Role-based dashboards
    │   │       ├── admin/
    │   │       ├── borrower/
    │   │       ├── sales/
    │   │       ├── sanction/
    │   │       ├── disbursement/
    │   │       └── collection/
    │   ├── hooks/              # useAuth
    │   ├── lib/                # API client, utils, Zod schemas
    │   ├── store/              # Zustand stores
    │   └── types/              # Shared TypeScript types
    ├── middleware.ts            # Route protection
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run seed     # Create role users
npm run dev      # Start dev server on :5000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your API URL
npm install
npm run dev      # Start on :3000
```

---

## 🔐 Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lms.com | Admin@123 |
| Sales | sales@lms.com | Sales@123 |
| Sanction | sanction@lms.com | Sanction@123 |
| Disbursement | disburse@lms.com | Disburse@123 |
| Collection | collection@lms.com | Collection@123 |

---

## 🔄 Loan Status Flow

```
REGISTERED
    ↓ (borrower applies)
APPLIED
    ↓ (sanction approves)     ↘ (sanction rejects)
SANCTIONED                    REJECTED
    ↓ (disbursement marks)
DISBURSED
    ↓ (collection records payments)
CLOSED (auto when fully repaid)
```

---

## 📐 BRE Rules

| Rule | Criteria |
|------|----------|
| Age | 23 ≤ age ≤ 50 |
| Salary | ≥ ₹25,000/month |
| Employment | Not UNEMPLOYED |
| PAN | `/^[A-Z]{5}[0-9]{4}[A-Z]$/` |

---

## 💰 Interest Formula

```
SI = (P × R × T) / (365 × 100)
```
- P = Principal amount
- R = 12 (fixed rate)
- T = Tenure in days

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Borrower
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/borrower/profile` | BORROWER |
| POST | `/api/borrower/upload-slip` | BORROWER |
| GET | `/api/borrower/me` | BORROWER |
| GET | `/api/borrower/list` | SALES, ADMIN |
| GET | `/api/borrower/all` | ADMIN |

### Loans
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/loans/apply` | BORROWER |
| GET | `/api/loans/my-loans` | BORROWER |
| GET | `/api/loans` | Multi-role |
| PUT | `/api/loans/:id/approve` | SANCTION |
| PUT | `/api/loans/:id/reject` | SANCTION |
| PUT | `/api/loans/:id/disburse` | DISBURSEMENT |
| GET | `/api/loans/admin/stats` | ADMIN |

### Payments
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/payments` | COLLECTION |
| GET | `/api/payments/:loanId` | Multi-role |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
# Set NEXT_PUBLIC_API_URL in Vercel environment variables
vercel deploy
```

### Backend → Render
1. Create a new Web Service on Render
2. Set environment variables from `.env.example`
3. Build command: `npm run build`
4. Start command: `npm start`

### Database → MongoDB Atlas
1. Create a free cluster on MongoDB Atlas
2. Whitelist Render IP or use `0.0.0.0/0` for development
3. Copy connection string to `MONGO_URI`

### Storage → Cloudinary
1. Create a free account on cloudinary.com
2. Copy Cloud Name, API Key, API Secret to environment variables

---

## 🐳 Docker (Local)

```bash
cp .env.example .env
# Edit .env
docker-compose up --build
```

---

## 📝 Environment Variables

### Backend (`.env`)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
