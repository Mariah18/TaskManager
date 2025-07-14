# Task Manager SaaS Application

A full-stack Task Manager web application built with modern technologies, demonstrating SaaS patterns and clean architecture principles.

## Features

### Frontend

- **Authentication**: Sign up and log in with JWT
- **Task Management**: Full CRUD operations for tasks
- **Dynamic Task List**: Pagination, filtering, and sorting
- **Responsive Design**: Modern UI with Tailwind CSS
- **Real-time Feedback**: Loading indicators and user notifications

### Backend

- **RESTful API**: Complete CRUD endpoints
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: DTO validation with class-validator
- **Error Handling**: Proper HTTP status codes and error responses

### DevOps & Infrastructure

- **Docker**: Containerized application for easy deployment
- **Testing**: Unit and integration tests
- **Rate Limiting**: Protection against brute-force attacks
- **Git**: Version control with GitHub

## Tech Stack

### Frontend

- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API communication
- React Router for navigation
- React Query for state management

### Backend

- NestJS framework
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Class-validator for DTO validation
- Jest for testing

### DevOps

- Docker & Docker Compose
- GitHub Actions (optional)

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd TaskManager
   ```

2. **Start the application**

   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Option 2: Local Development

1. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Set up the database**

   ```bash
   # Start PostgreSQL (if using Docker)
   docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=taskmanager -p 5432:5432 -d postgres:15

   # Run database migrations
   cd backend
   npx prisma migrate dev
   ```

3. **Start the backend**

   ```bash
   cd backend
   npm run start:dev
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```

## Architecture

### Project Structure

```
TaskManager/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── tasks/          # Tasks module
│   │   ├── users/          # Users module
│   │   ├── common/         # Shared utilities
│   │   └── prisma/         # Database schema and migrations
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

### Design Decisions

1. **Frontend Architecture**

   - React with TypeScript for type safety
   - Tailwind CSS for rapid UI development
   - Custom hooks for reusable logic
   - Service layer for API communication

2. **Backend Architecture**

   - NestJS for scalable, modular backend
   - Prisma ORM for type-safe database operations
   - JWT for stateless authentication
   - DTOs for request/response validation

3. **Database Design**

   - PostgreSQL for ACID compliance
   - Proper indexing for performance
   - Soft deletes for data integrity

4. **Security**
   - JWT tokens with expiration
   - Password hashing with bcrypt
   - Rate limiting for API protection
   - Input validation and sanitization

## Testing

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

## API Documentation

### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Tasks Endpoints

- `GET /tasks` - Get tasks with pagination, filtering, sorting
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/complete` - Mark task as complete/incomplete

## Environment Variables

### Backend (.env)

```
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:3001
```

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Scale services
docker-compose up -d --scale backend=3
```

### Production Considerations

- Use environment variables for configuration
- Set up proper logging and monitoring
- Implement health checks
- Configure CORS properly
- Set up SSL/TLS certificates

## Future Improvements

1. **Microservices Architecture**

   - Split into separate services (Auth, Tasks, Users)
   - Implement API Gateway
   - Add service discovery

2. **Advanced Features**

   - Real-time notifications with WebSockets
   - File uploads for task attachments
   - Task categories and tags
   - Team collaboration features

3. **Performance Optimizations**

   - Redis caching
   - Database query optimization
   - CDN for static assets
   - API response compression

4. **Monitoring & Observability**
   - Application performance monitoring
   - Error tracking and logging
   - Metrics and analytics
   - Health check endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
