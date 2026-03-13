import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from './testHelpers.js';

const app = createTestApp();

describe('Health Check API', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message');
  });
});
