# Movie Collection App

A full-stack application for managing your personal movie collection. Made as a practical task for [ababa.tech](https://ababa.tech/). Feel free to break it, do whatever you want.

## Features

- User authentication (register, login, logout) - this means every user can have their own collections stored.
- Create, read, update, and delete movies
- Search for movies by title
- Sort movies by title, release year, genre, and rating
- Responsive design

## Tech Stack

### Frontend
- Next.js with TypeScript
- React
- Redux Toolkit for state management
- CSS Modules for styling

### Backend
- NestJS with TypeScript
- PostgreSQL with TypeORM
- JWT authentication
- Class-validator for validation

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL

## Port Configuration

**Important**: This application uses the following port configuration:
- Backend: Runs on port **3000**
- Frontend: Runs on port **3001**

The frontend is configured to communicate with the backend at port 3000. Always start the backend first to ensure proper communication between the services.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dnocturne/ababa-movie-task
cd ababa-movie-task
```

### 2. Set up the database

The application uses PostgreSQL. Make sure you have PostgreSQL installed and running.

1. Create a new database called `movie_list`
2. The database tables will be automatically created when you run the backend server

### 3. Start the backend (REQUIRED FIRST)

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure the database (if needed)
# Edit src/app.module.ts to match your PostgreSQL configuration

# Start the backend in development mode
npm run start:dev

# OR start in production mode
npm run start:prod
```

The backend server will run on http://localhost:3000.

### 4. Start the frontend

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend in development mode
npm run dev

# OR build and start in production mode
npm run build
npm run start
```

The frontend will run on http://localhost:3001.

## Development Workflow

1. Always start the backend server first (port 3000)
2. Then start the frontend server (port 3001)
3. Access the application at http://localhost:3001

If you attempt to start the frontend while the backend is not running, API requests will fail.

## API Endpoints

### Authentication
- `POST /auth/login` - Login with username and password
- `POST /users` - Register a new user

### Users
- `GET /users/profile` - Get the current user's profile

### Movies
- `GET /movies` - Get all movies for the logged-in user (with filtering and sorting)
- `GET /movies/genres` - Get all unique genres
- `GET /movies/:id` - Get a specific movie
- `POST /movies` - Create a new movie
- `PUT /movies/:id` - Update a movie
- `DELETE /movies/:id` - Delete a movie

## Security Features

- JWT authentication with token expiration
- Password hashing with bcrypt
- Input validation with class-validator
- CORS configuration

## Building for Production

```bash
# Build the backend
cd backend
npm run build

# Build the frontend
cd frontend
npm run build
```

After building, you can start the production versions:

```bash
# Start backend production server
cd backend
npm run start:prod

# Start frontend production server
cd frontend
npm run start
```

## License

This project is licensed under 'I don't give a crap' license. Meaning it has no license. Neat.