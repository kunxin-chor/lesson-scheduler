# API Testing

Automated tests for the Lesson Material Scheduler API endpoints.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure test environment is configured:
   - `.env.test` file should exist with test database settings
   - Test database: `lesson-scheduler-test`
   - Test port: `5001`

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

- **`tests/setup.js`** - Test environment setup and database cleanup
- **`tests/testHelpers.js`** - Shared test utilities and sample data
- **`tests/health.test.js`** - Health check endpoint tests
- **`tests/lessonPlan.test.js`** - Lesson Plan API tests
- **`tests/intake.test.js`** - Intake API tests

## Test Coverage

### Lesson Plan Endpoints
- ✅ POST /api/lesson-plans - Create lesson plan
- ✅ GET /api/lesson-plans - Get all lesson plans
- ✅ GET /api/lesson-plans/:id - Get specific lesson plan
- ✅ PUT /api/lesson-plans/:id - Update lesson plan
- ✅ DELETE /api/lesson-plans/:id - Delete lesson plan

### Intake Endpoints
- ✅ POST /api/intakes - Create intake
- ✅ GET /api/intakes - Get all intakes
- ✅ GET /api/intakes/:id - Get specific intake
- ✅ PUT /api/intakes/:id - Update intake
- ✅ DELETE /api/intakes/:id - Delete intake
- ✅ PATCH /api/intakes/:id/class-slots - Update class slots
- ✅ POST /api/intakes/:id/regenerate - Regenerate calendar

## Test Database

Tests use a separate database (`lesson-scheduler-test`) that is automatically cleaned before each test run. This ensures:
- Tests don't affect development or production data
- Each test starts with a clean slate
- Tests are isolated and repeatable

## Technologies

- **Vitest** - Fast unit test framework
- **Supertest** - HTTP assertion library for API testing
- **MongoDB** - Test database (automatically cleaned between tests)
