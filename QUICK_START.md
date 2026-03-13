# Quick Start Guide

## 🚀 Getting Started

### Development Environment

1. **Start Backend (Development)**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on: `http://localhost:5000`

2. **Start Frontend (Development)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

### Production Environment

1. **Start Backend (Production)**
   ```bash
   cd backend
   npm install --production
   npm run prod
   ```

2. **Build Frontend (Production)**
   ```bash
   cd frontend
   npm install
   npm run build
   # Deploy the dist/ folder to your hosting service
   ```

## 📋 Environment Files

### Backend
- **`.env.dev`** - Local development (MongoDB localhost)
- **`.env.prod`** - Production (MongoDB Atlas)

### Frontend
- **`.env.development`** - Dev API URL (http://localhost:5000/api)
- **`.env.production`** - Prod API URL (update with your domain)

## 🧪 Testing

```bash
cd backend
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run with coverage report
```

## 📚 Documentation

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Database schema: [docs/database-schema.md](./docs/database-schema.md)
- Tech stack: [docs/tech-stack.md](./docs/tech-stack.md)
