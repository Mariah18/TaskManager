# 🚀 Task Manager Setup Guide

## Quick Start (Docker - Recommended)

### 1. **Prerequisites**

- Docker and Docker Compose installed
- Git (to clone the repository)

### 2. **Clone and Run**

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd TaskManager

# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 3. **Access the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

### 4. **Create Your First Account**

1. Go to http://localhost:3000
2. Click "Create a new account"
3. Fill in your details and register
4. Start creating tasks!

---

## Manual Setup (Local Development)

### 1. **Backend Setup**

#### Install Dependencies

```bash
cd backend
npm install
```

#### Set up Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskmanager"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

#### Set up Database

```bash
# Start PostgreSQL (if using Docker)
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=taskmanager -p 5432:5432 -d postgres:15

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

#### Start Backend

```bash
npm run start:dev
```

### 2. **Frontend Setup**

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Set up Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:3001
```

#### Start Frontend

```bash
npm start
```

---

## 🧪 **Testing the Application**

### Backend Tests

```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:cov          # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                  # Run tests
npm run test:coverage     # Coverage report
```

---

## 🔧 **Database Management**

### View Database with Prisma Studio

```bash
cd backend
npx prisma studio
```

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

---

## 🐛 **Troubleshooting**

### Common Issues:

1. **Port already in use**

   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3001
   lsof -i :5432
   ```

2. **Database connection issues**

   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

3. **Frontend can't connect to backend**

   - Check REACT_APP_API_URL in frontend .env
   - Ensure backend is running on port 3001
   - Check CORS settings

4. **Docker issues**

   ```bash
   # Restart Docker services
   docker-compose down
   docker-compose up -d

   # View logs
   docker-compose logs backend
   docker-compose logs frontend
   ```

---

## 📊 **API Testing**

### Test Authentication

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Tasks API

```bash
# Get tasks (replace TOKEN with actual JWT token)
curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test description"}'
```

---

## 🎯 **Next Steps After Setup**

1. **Explore the Application**

   - Create your first account
   - Add some test tasks
   - Try the filtering and sorting features

2. **Review the Code**

   - Check the backend architecture in `backend/src/`
   - Explore the frontend components in `frontend/src/`
   - Review the API documentation in README.md

3. **Customize**

   - Modify the UI colors in `frontend/tailwind.config.js`
   - Add new features to the task management
   - Extend the API with new endpoints

4. **Deploy**
   - Set up production environment variables
   - Configure a production database
   - Deploy to your preferred hosting platform

---

## 🆘 **Need Help?**

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs: `docker-compose logs`
3. Ensure all environment variables are set correctly
4. Verify all dependencies are installed

The application should now be fully functional! 🎉
