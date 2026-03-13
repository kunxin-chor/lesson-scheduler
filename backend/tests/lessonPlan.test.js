import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp, sampleLessonPlan } from './testHelpers.js';

const app = createTestApp();

describe('Lesson Plan API', () => {
  describe('POST /api/lesson-plans', () => {
    it('should create a new lesson plan', async () => {
      const response = await request(app)
        .post('/api/lesson-plans')
        .send(sampleLessonPlan)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(sampleLessonPlan.name);
      expect(response.body.description).toBe(sampleLessonPlan.description);
      expect(response.body.modules).toHaveLength(1);
    });

    it('should return 500 if name is missing', async () => {
      const invalidPlan = { description: 'No name' };
      
      await request(app)
        .post('/api/lesson-plans')
        .send(invalidPlan)
        .expect(500);
    });
  });

  describe('GET /api/lesson-plans', () => {
    it('should return empty array when no lesson plans exist', async () => {
      const response = await request(app)
        .get('/api/lesson-plans')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all lesson plans', async () => {
      await request(app)
        .post('/api/lesson-plans')
        .send(sampleLessonPlan);

      await request(app)
        .post('/api/lesson-plans')
        .send({ ...sampleLessonPlan, name: 'Second Plan' });

      const response = await request(app)
        .get('/api/lesson-plans')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/lesson-plans/:id', () => {
    it('should return a specific lesson plan', async () => {
      const createResponse = await request(app)
        .post('/api/lesson-plans')
        .send(sampleLessonPlan);

      const id = createResponse.body._id;

      const response = await request(app)
        .get(`/api/lesson-plans/${id}`)
        .expect(200);

      expect(response.body._id).toBe(id);
      expect(response.body.name).toBe(sampleLessonPlan.name);
    });

    it('should return 404 for non-existent lesson plan', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .get(`/api/lesson-plans/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/lesson-plans/:id', () => {
    it('should update a lesson plan', async () => {
      const createResponse = await request(app)
        .post('/api/lesson-plans')
        .send(sampleLessonPlan);

      const id = createResponse.body._id;
      const updatedData = {
        name: 'Updated Lesson Plan',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/lesson-plans/${id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
    });

    it('should return 404 when updating non-existent lesson plan', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .put(`/api/lesson-plans/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/lesson-plans/:id', () => {
    it('should delete a lesson plan', async () => {
      const createResponse = await request(app)
        .post('/api/lesson-plans')
        .send(sampleLessonPlan);

      const id = createResponse.body._id;

      await request(app)
        .delete(`/api/lesson-plans/${id}`)
        .expect(204);

      await request(app)
        .get(`/api/lesson-plans/${id}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent lesson plan', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .delete(`/api/lesson-plans/${fakeId}`)
        .expect(404);
    });
  });
});
