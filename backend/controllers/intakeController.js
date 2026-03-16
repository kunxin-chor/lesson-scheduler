import * as intakeService from '../services/intakeService.js';

// Transform MongoDB _id to id for frontend
function transformIntake(intake) {
  if (!intake) return null;
  const { _id, ...rest } = intake;
  return { id: _id.toString(), ...rest };
}

function transformIntakes(intakes) {
  return intakes.map(transformIntake);
}

export async function createIntake(req, res) {
  try {
    const intake = await intakeService.createIntake(req.body);
    res.status(201).json(transformIntake(intake));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllIntakes(req, res) {
  try {
    const intakes = await intakeService.getAllIntakes();
    res.json(transformIntakes(intakes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getIntakeById(req, res) {
  try {
    const intake = await intakeService.getIntakeById(req.params.id);
    if (!intake) {
      return res.status(404).json({ error: 'Intake not found' });
    }
    res.json(transformIntake(intake));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateIntake(req, res) {
  try {
    const intake = await intakeService.updateIntake(req.params.id, req.body);
    if (!intake) {
      return res.status(404).json({ error: 'Intake not found' });
    }
    res.json(transformIntake(intake));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteIntake(req, res) {
  try {
    const success = await intakeService.deleteIntake(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Intake not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateClassSlots(req, res) {
  try {
    const intake = await intakeService.updateClassSlots(req.params.id, req.body.classSlots);
    if (!intake) {
      return res.status(404).json({ error: 'Intake not found' });
    }
    res.json(transformIntake(intake));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function regenerateIntake(req, res) {
  try {
    const { classSlotPatterns, exceptions, classSlots } = req.body;
    const intake = await intakeService.regenerateIntake(
      req.params.id,
      classSlotPatterns,
      exceptions,
      classSlots
    );
    if (!intake) {
      return res.status(404).json({ error: 'Intake not found' });
    }
    res.json(transformIntake(intake));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
