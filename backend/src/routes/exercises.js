import express from 'express';
import { getExercises, getExerciseById } from '../services/exerciseService.js';

const router = express.Router();

router.get('/exercises', async (req, res) => {
  try {
    const {
      q,
      bodyArea,
      primaryMuscle,
      equipment,
      level,
      category,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {
      q,
      bodyArea,
      primaryMuscle,
      equipment,
      level,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const exercises = await getExercises(filters);
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

router.get('/exercises/:id', async (req, res) => {
  try {
    const exercise = await getExerciseById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

export default router;

