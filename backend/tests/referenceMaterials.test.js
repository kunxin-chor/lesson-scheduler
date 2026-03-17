import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from './testHelpers.js';

const app = createTestApp();

describe('Module Reference Materials', () => {
  it('should create a lesson plan with reference materials', async () => {
    const lessonPlan = {
      name: 'Test Plan with References',
      description: 'Testing reference materials',
      modules: [
        {
          id: 'module-1',
          name: 'Module 1',
          order: 0,
          referenceMaterials: '# Reference Materials\n\n- [MDN Web Docs](https://developer.mozilla.org)\n- [W3Schools](https://www.w3schools.com)',
          lessons: []
        }
      ]
    };

    const response = await request(app)
      .post('/api/lesson-plans')
      .send(lessonPlan)
      .expect(201);

    expect(response.body.modules[0].referenceMaterials).toBe(lessonPlan.modules[0].referenceMaterials);
  });

  it('should handle modules without reference materials (backward compatibility)', async () => {
    const lessonPlan = {
      name: 'Test Plan without References',
      description: 'Testing backward compatibility',
      modules: [
        {
          id: 'module-1',
          name: 'Module 1',
          order: 0,
          lessons: []
        }
      ]
    };

    const response = await request(app)
      .post('/api/lesson-plans')
      .send(lessonPlan)
      .expect(201);

    expect(response.body.modules[0].referenceMaterials).toBe('');
  });

  it('should update reference materials', async () => {
    // Create a lesson plan
    const createResponse = await request(app)
      .post('/api/lesson-plans')
      .send({
        name: 'Test Plan',
        modules: [
          {
            id: 'module-1',
            name: 'Module 1',
            order: 0,
            referenceMaterials: 'Initial references',
            lessons: []
          }
        ]
      });

    const planId = createResponse.body.id;
    const moduleId = createResponse.body.modules[0].id;

    // Update reference materials
    const updatedReferences = '# Updated References\n\n- New link 1\n- New link 2';
    const updateResponse = await request(app)
      .put(`/api/lesson-plans/${planId}`)
      .send({
        modules: [
          {
            id: moduleId,
            name: 'Module 1',
            order: 0,
            referenceMaterials: updatedReferences,
            lessons: []
          }
        ]
      })
      .expect(200);

    expect(updateResponse.body.modules[0].referenceMaterials).toBe(updatedReferences);
  });

  it('should preserve reference materials when updating other module properties', async () => {
    // Create a lesson plan
    const createResponse = await request(app)
      .post('/api/lesson-plans')
      .send({
        name: 'Test Plan',
        modules: [
          {
            id: 'module-1',
            name: 'Module 1',
            order: 0,
            referenceMaterials: 'Important references',
            lessons: []
          }
        ]
      });

    const planId = createResponse.body.id;
    const moduleId = createResponse.body.modules[0].id;

    // Update module name but keep reference materials
    const updateResponse = await request(app)
      .put(`/api/lesson-plans/${planId}`)
      .send({
        modules: [
          {
            id: moduleId,
            name: 'Updated Module Name',
            order: 0,
            referenceMaterials: 'Important references',
            lessons: []
          }
        ]
      })
      .expect(200);

    expect(updateResponse.body.modules[0].name).toBe('Updated Module Name');
    expect(updateResponse.body.modules[0].referenceMaterials).toBe('Important references');
  });
});
