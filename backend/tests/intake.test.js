import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp, sampleIntake, sampleLessonPlan } from './testHelpers.js';

const app = createTestApp();

describe('Intake API', () => {
  describe('POST /api/intakes', () => {
    it('should create a new intake', async () => {
      const response = await request(app)
        .post('/api/intakes')
        .send(sampleIntake)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(sampleIntake.name);
      expect(response.body.classSlotPatterns).toHaveLength(2);
      expect(response.body.exceptions).toHaveLength(2);
      expect(response.body.status).toBe('active');
    });

    it('should create intake with lesson plan reference', async () => {
      const planResponse = await request(app)
        .post('/api/lesson-plans')
        .send(sampleLessonPlan);

      const intakeWithPlan = {
        ...sampleIntake,
        lessonPlanId: planResponse.body._id
      };

      const response = await request(app)
        .post('/api/intakes')
        .send(intakeWithPlan)
        .expect(201);

      expect(response.body.lessonPlanId).toBe(planResponse.body._id);
    });

    it('should handle intake without lesson plan (optional)', async () => {
      const intakeWithoutPlan = { ...sampleIntake };
      delete intakeWithoutPlan.lessonPlanId;

      const response = await request(app)
        .post('/api/intakes')
        .send(intakeWithoutPlan)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
    });
  });

  describe('GET /api/intakes', () => {
    it('should return empty array when no intakes exist', async () => {
      const response = await request(app)
        .get('/api/intakes')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all intakes', async () => {
      const first = await request(app)
        .post('/api/intakes')
        .send(sampleIntake)
        .expect(201);

      const second = await request(app)
        .post('/api/intakes')
        .send({ ...sampleIntake, name: 'Second Intake' })
        .expect(201);

      expect(first.body).toHaveProperty('_id');
      expect(second.body).toHaveProperty('_id');

      const response = await request(app)
        .get('/api/intakes')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/intakes/:id', () => {
    it('should return a specific intake', async () => {
      const createResponse = await request(app)
        .post('/api/intakes')
        .send(sampleIntake);

      const id = createResponse.body._id;

      const response = await request(app)
        .get(`/api/intakes/${id}`)
        .expect(200);

      expect(response.body._id).toBe(id);
      expect(response.body.name).toBe(sampleIntake.name);
    });

    it('should return 404 for non-existent intake', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .get(`/api/intakes/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/intakes/:id', () => {
    it('should update an intake', async () => {
      const createResponse = await request(app)
        .post('/api/intakes')
        .send(sampleIntake);

      const id = createResponse.body._id;
      const updatedData = {
        name: 'Updated Intake',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/intakes/${id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.status).toBe(updatedData.status);
    });

    it('should return 404 when updating non-existent intake', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .put(`/api/intakes/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/intakes/:id', () => {
    it('should delete an intake', async () => {
      const createResponse = await request(app)
        .post('/api/intakes')
        .send(sampleIntake);

      const id = createResponse.body._id;

      await request(app)
        .delete(`/api/intakes/${id}`)
        .expect(204);

      await request(app)
        .get(`/api/intakes/${id}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent intake', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .delete(`/api/intakes/${fakeId}`)
        .expect(404);
    });
  });

  describe('PATCH /api/intakes/:id/class-slots', () => {
    it('should update class slots', async () => {
      const createResponse = await request(app)
        .post('/api/intakes')
        .send(sampleIntake);

      const id = createResponse.body._id;
      const newClassSlots = [
        {
          id: 'slot-1',
          date: '2026-03-16',
          dayOfWeek: 1,
          timeSlot: 'morning',
          isManuallyAdded: false
        },
        {
          id: 'slot-2',
          date: '2026-03-18',
          dayOfWeek: 3,
          timeSlot: 'afternoon',
          isManuallyAdded: true
        }
      ];

      const response = await request(app)
        .patch(`/api/intakes/${id}/class-slots`)
        .send({ classSlots: newClassSlots })
        .expect(200);

      expect(response.body.classSlots).toHaveLength(2);
      expect(response.body.classSlots[0].id).toBe('slot-1');
      expect(response.body.classSlots[1].isManuallyAdded).toBe(true);
    });
  });

  describe('POST /api/intakes/:id/regenerate', () => {
    it('should regenerate intake calendar', async () => {
      const createResponse = await request(app)
        .post('/api/intakes')
        .send(sampleIntake);

      const id = createResponse.body._id;
      const newConfig = {
        classSlotPatterns: [
          { dayOfWeek: 2, timeSlot: 'evening', frequency: 1 }
        ],
        exceptions: ['2026-03-19'],
        classSlots: [
          {
            id: 'slot-new-1',
            date: '2026-03-17',
            dayOfWeek: 2,
            timeSlot: 'evening',
            isManuallyAdded: false
          }
        ]
      };

      const response = await request(app)
        .post(`/api/intakes/${id}/regenerate`)
        .send(newConfig)
        .expect(200);

      expect(response.body.classSlotPatterns).toHaveLength(1);
      expect(response.body.classSlotPatterns[0].dayOfWeek).toBe(2);
      expect(response.body.exceptions).toHaveLength(1);
      expect(response.body.classSlots).toHaveLength(1);
    });
  });
});
