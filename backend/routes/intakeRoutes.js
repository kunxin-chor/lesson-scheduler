import express from 'express';
import * as intakeController from '../controllers/intakeController.js';

const router = express.Router();

router.post('/', intakeController.createIntake);
router.get('/', intakeController.getAllIntakes);
router.get('/:id', intakeController.getIntakeById);
router.put('/:id', intakeController.updateIntake);
router.delete('/:id', intakeController.deleteIntake);
router.patch('/:id/class-slots', intakeController.updateClassSlots);
router.post('/:id/regenerate', intakeController.regenerateIntake);
router.post('/:id/bulk-slots', intakeController.addBulkSlots);

export default router;
