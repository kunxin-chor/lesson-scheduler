import express from 'express';
import * as intakeController from '../controllers/intakeController.js';

const router = express.Router();

// @desc    Get all intakes
// @route   GET /students/intakes
// @access  Public
router.get('/intakes', intakeController.getAllIntakes);

// @desc    Get single intake by ID
// @route   GET /students/intakes/:id
// @access  Public
router.get('/intakes/:id', intakeController.getIntakeById);

export default router;
