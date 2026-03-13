# Lesson Material Scheduler - Backend API

RESTful API for managing lesson plans and intakes.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment files:
```bash
# Development environment (already created)
# .env.development

# Test environment (already created)
# .env.test

# Production environment (already created)
# .env.production
```

3. Configure database settings in environment files:

**Development (.env.development):**
```
NODE_ENV=development
MONGODB_HOST=mongodb://localhost:27017
DB_NAME=lesson-scheduler-dev
PORT=5000
```

**Test (.env.test):**
```
NODE_ENV=test
MONGODB_HOST=mongodb://localhost:27017
DB_NAME=lesson-scheduler-test
PORT=5001
```

**Production (.env.production):**
```
NODE_ENV=production
MONGODB_HOST=mongodb://localhost:27017
DB_NAME=lesson-scheduler
PORT=5000
```

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Test mode (with auto-reload, separate test database)
npm run test

# Production mode
npm run prod
```

## Environment Detection

The server automatically detects the environment using `NODE_ENV`:
- `npm run dev` → Uses `.env.development` (NODE_ENV=development, DB: lesson-scheduler-dev, Port: 5000)
- `npm run test` → Uses `.env.test` (NODE_ENV=test, DB: lesson-scheduler-test, Port: 5001)
- `npm run prod` → Uses `.env.production` (NODE_ENV=production, DB: lesson-scheduler, Port: 5000)

Different databases and ports are used for each environment to keep data completely separate.

## API Endpoints

### Lesson Plans

- `POST /api/lesson-plans` - Create a new lesson plan
- `GET /api/lesson-plans` - Get all lesson plans
- `GET /api/lesson-plans/:id` - Get a specific lesson plan
- `PUT /api/lesson-plans/:id` - Update a lesson plan
- `DELETE /api/lesson-plans/:id` - Delete a lesson plan

### Intakes

- `POST /api/intakes` - Create a new intake
- `GET /api/intakes` - Get all intakes
- `GET /api/intakes/:id` - Get a specific intake
- `PUT /api/intakes/:id` - Update an intake
- `DELETE /api/intakes/:id` - Delete an intake
- `PATCH /api/intakes/:id/class-slots` - Update class slots
- `POST /api/intakes/:id/regenerate` - Regenerate intake calendar

### Health Check

- `GET /api/health` - Check server status

## Testing

Run automated tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Tests use a separate test database (`lesson-scheduler-test`) that is automatically cleaned between test runs.

See [tests/README.md](tests/README.md) for detailed testing documentation.

## Architecture

- **Data Layer** (`/data`) - Direct database operations
- **Service Layer** (`/services`) - Business logic
- **Controller Layer** (`/controllers`) - Request/response handling
- **Routes** (`/routes`) - API endpoint definitions

## Database

Uses MongoDB native driver (no Mongoose) with layered architecture.
