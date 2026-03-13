import express from 'express';
import * as lessonPlanController from '../controllers/lessonPlanController.js';

const router = express.Router();

router.post('/', lessonPlanController.createLessonPlan);
router.get('/', lessonPlanController.getAllLessonPlans);
router.get('/:id', lessonPlanController.getLessonPlanById);
router.put('/:id', lessonPlanController.updateLessonPlan);
router.delete('/:id', lessonPlanController.deleteLessonPlan);

export default router;
