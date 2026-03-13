# Deployment Guide - Lesson Scheduler

## Environment Configuration

### Backend Environment Files

The backend uses environment-specific configuration files:

- **`.env.dev`** - Local development with MongoDB on localhost
- **`.env.prod`** - Production with MongoDB Atlas

**Backend Environment Variables:**
```
NODE_ENV=production|development
MONGODB_HOST=<mongodb-connection-string>
DB_NAME=<database-name>
PORT=<port-number>
```

### Frontend Environment Files

The frontend uses Vite environment variables:

- **`.env.development`** - Development API endpoint
- **`.env.production`** - Production API endpoint

**Frontend Environment Variables:**
```
VITE_API_URL=<backend-api-url>
```

---

## Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start development server (uses .env.dev)
npm run dev

# Or start without watch mode
npm start
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (uses .env.development)
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Running Tests

```bash
cd backend

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Production Deployment

### Backend Deployment

#### Prerequisites
- MongoDB Atlas cluster configured
- Production server with Node.js installed

#### Steps

1. **Update `.env.prod` with production values:**
   ```
   NODE_ENV=production
   MONGODB_HOST=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
   DB_NAME=lesson-scheduler-prod
   PORT=5000
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install --production
   ```

3. **Start production server:**
   ```bash
   npm run prod
   ```

4. **Using PM2 (recommended for production):**
   ```bash
   # Install PM2 globally
   npm install -g pm2

   # Start with PM2
   pm2 start server.js --name lesson-scheduler-api --node-args="--env-file=.env.prod"

   # Save PM2 configuration
   pm2 save

   # Setup PM2 to start on system boot
   pm2 startup
   ```

### Frontend Deployment

#### Prerequisites
- Production API URL configured
- Web server (Nginx, Apache, or static hosting service)

#### Steps

1. **Update `.env.production` with production API URL:**
   ```
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. **Build for production:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

   This creates an optimized production build in the `dist/` folder.

3. **Deploy the `dist/` folder to your hosting service:**

   **Option A: Static Hosting (Netlify, Vercel, etc.)**
   - Upload the `dist/` folder
   - Configure environment variables in hosting dashboard

   **Option B: Traditional Web Server (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## Database Setup

### Development (Local MongoDB)

1. **Install MongoDB locally:**
   - Download from https://www.mongodb.com/try/download/community
   - Start MongoDB service

2. **Database will be created automatically** when the backend starts

### Production (MongoDB Atlas)

1. **Create MongoDB Atlas cluster:**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Configure network access (whitelist IP addresses)
   - Create database user

2. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Update `.env.prod` with the connection string

3. **Database will be created automatically** when the backend connects

---

## Environment-Specific Commands

### Backend

| Command | Environment | Description |
|---------|-------------|-------------|
| `npm start` | Development | Start server with .env.dev |
| `npm run dev` | Development | Start server with auto-reload |
| `npm run prod` | Production | Start server with .env.prod |
| `npm test` | Test | Run test suite |

### Frontend

| Command | Environment | Description |
|---------|-------------|-------------|
| `npm run dev` | Development | Start dev server |
| `npm run build` | Production | Build for production |
| `npm run build:dev` | Development | Build with dev settings |
| `npm run preview` | - | Preview production build |

---

## Security Checklist

- [ ] Never commit `.env.dev`, `.env.prod`, or `.env.production` files to git
- [ ] Use strong MongoDB credentials
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Enable CORS only for trusted domains in production
- [ ] Use HTTPS for production API and frontend
- [ ] Regularly update dependencies
- [ ] Enable MongoDB authentication
- [ ] Set up proper error logging

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify MongoDB is running (local) or accessible (Atlas)
- Check port 5000 is not in use
- Verify environment file exists and is loaded

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend is running
- Check browser console for errors

### Database connection errors
- Verify MongoDB credentials
- Check network access in MongoDB Atlas
- Ensure database name is correct
- Check firewall settings

---

## Monitoring & Maintenance

### Backend Monitoring (with PM2)
```bash
# View logs
pm2 logs lesson-scheduler-api

# Monitor resources
pm2 monit

# Restart application
pm2 restart lesson-scheduler-api

# Stop application
pm2 stop lesson-scheduler-api
```

### Database Backups
- Configure automated backups in MongoDB Atlas
- Or use `mongodump` for manual backups:
  ```bash
  mongodump --uri="<connection-string>" --out=/path/to/backup
  ```

---

## Support

For issues or questions, please refer to:
- Backend API documentation: `/docs/tech-stack.md`
- Database schema: `/docs/database-schema.md`
- User stories: `/docs/user-stories.md`
