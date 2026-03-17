import express from 'express';
import cors from 'cors';
import intakeRoutes from '../routes/intakeRoutes.js';
import lessonPlanRoutes from '../routes/lessonPlanRoutes.js';

export function createTestApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  app.use('/api/intakes', intakeRoutes);
  app.use('/api/lesson-plans', lessonPlanRoutes);
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });
  
  return app;
}

export const sampleLessonPlan = {
  name: 'Test Lesson Plan',
  description: 'A test lesson plan for automated testing',
  modules: [
    {
      id: 'module-1',
      name: 'Module 1',
      order: 1,
      referenceMaterials: '',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          prelearningMaterials: 'Pre-learning content',
          guidedInstructions: 'Guided instructions',
          handsOnActivities: 'Hands-on activities',
          order: 1
        }
      ]
    }
  ]
};

export const sampleIntake = {
  name: 'Test Intake',
  startDate: '2026-03-15',
  classSlotPatterns: [
    { dayOfWeek: 1, timeSlot: 'morning', frequency: 1 },
    { dayOfWeek: 3, timeSlot: 'afternoon', frequency: 1 }
  ],
  exceptions: ['2026-03-17', '2026-03-24'],
  classSlots: [],
  status: 'active'
};
