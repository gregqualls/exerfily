import express from 'express';
import { 
  getExercises, 
  getExerciseById, 
  getEquipments, 
  getBodyParts, 
  getTargets,
  searchExerciseDB,
  addExerciseFromDB
} from '../services/exerciseService.js';
import { syncExercises, checkSyncNeeded, getSyncStatus } from '../services/syncService.js';
import { extractGifFrame } from '../services/gifService.js';

const router = express.Router();

router.get('/exercises', async (req, res) => {
  try {
    const {
      q,
      bodyPart,
      primaryMuscle,
      equipment,
      level,
      category,
      exerciseType,
      limit = 50,
      offset = 0,
      availableEquipment,
      equipmentFilterMode
    } = req.query;

    const filters = {
      q,
      bodyPart,
      primaryMuscle,
      equipment,
      level,
      category,
      exerciseType,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Handle equipment filtering with available equipment list
    if (availableEquipment && equipmentFilterMode && equipmentFilterMode !== 'off') {
      const equipmentList = Array.isArray(availableEquipment)
        ? availableEquipment
        : availableEquipment.split(',').map(eq => eq.trim());
      filters.availableEquipment = equipmentList;
      filters.equipmentFilterMode = equipmentFilterMode;
    }

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

router.get('/equipments', async (req, res) => {
  try {
    const equipments = getEquipments();
    res.json(equipments);
  } catch (error) {
    console.error('Error fetching equipments:', error);
    res.status(500).json({ error: 'Failed to fetch equipments', details: error.message });
  }
});

router.get('/bodyparts', async (req, res) => {
  try {
    const bodyParts = getBodyParts();
    res.json(bodyParts);
  } catch (error) {
    console.error('Error fetching bodyparts:', error);
    res.status(500).json({ error: 'Failed to fetch bodyparts' });
  }
});

router.get('/targets', async (req, res) => {
  try {
    const targets = getTargets();
    res.json(targets);
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({ error: 'Failed to fetch targets', details: error.message });
  }
});

// Sync status endpoint
router.get('/sync/status', async (req, res) => {
  try {
    const status = getSyncStatus();
    const check = await checkSyncNeeded();
    
    res.json({
      ...status,
      updateAvailable: check.needed,
      updateReason: check.reason
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

// Manual sync endpoint (for testing/admin)
router.post('/sync', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const result = await syncExercises(force);
    res.json(result);
  } catch (error) {
    console.error('Error syncing exercises:', error);
    res.status(500).json({ error: 'Failed to sync exercises', details: error.message });
  }
});

// GitHub webhook endpoint
router.post('/webhooks/github', express.json(), async (req, res) => {
  try {
    // GitHub webhook payload
    const event = req.headers['x-github-event'];
    
    // Only process push events to main branch
    if (event === 'push') {
      const payload = req.body;
      
      // Check if it's a push to main branch
      if (payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master') {
        console.log('GitHub webhook: Push to main branch detected');
        
        // Check if sync is needed
        const check = await checkSyncNeeded();
        
        if (check.needed) {
          // Trigger sync
          const result = await syncExercises(false);
          return res.json({
            success: true,
            synced: result.synced,
            message: result.synced ? 'Exercises synced successfully' : 'Sync not needed',
            exerciseCount: result.exerciseCount
          });
        } else {
          return res.json({
            success: true,
            synced: false,
            message: 'No sync needed',
            reason: check.reason
          });
        }
      }
    }
    
    res.json({ success: true, message: 'Webhook received but no action taken' });
  } catch (error) {
    console.error('Error processing GitHub webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook', details: error.message });
  }
});

// ExerciseDB v2 search endpoint
router.get('/exercisedb/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || !q.trim()) {
      return res.json([]);
    }
    
    const results = await searchExerciseDB(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching ExerciseDB:', error);
    res.status(500).json({ error: 'Failed to search ExerciseDB', details: error.message });
  }
});

// ExerciseDB v2 add exercise endpoint
router.post('/exercisedb/add', express.json(), async (req, res) => {
  try {
    const { exerciseId } = req.body;
    
    if (!exerciseId) {
      return res.status(400).json({ error: 'exerciseId is required' });
    }
    
    const exercise = await addExerciseFromDB(exerciseId);
    res.json(exercise);
  } catch (error) {
    console.error('Error adding exercise from ExerciseDB:', error);
    res.status(500).json({ error: 'Failed to add exercise', details: error.message });
  }
});

// Extract frame from GIF endpoint
router.get('/gif/frame', async (req, res) => {
  try {
    const { url, frame = '0' } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'url parameter is required' });
    }

    // frame can be '0' for first, '1' or '-1' for last
    const frameIndex = frame === '1' || frame === '-1' ? -1 : parseInt(frame, 10) || 0;
    
    const frameBuffer = await extractGifFrame(url, frameIndex);
    
    res.setHeader('Content-Type', 'image/png');
    // Cache for 1 hour to allow updates, but not too aggressive
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(frameBuffer);
  } catch (error) {
    console.error('Error extracting GIF frame:', error);
    res.status(500).json({ error: 'Failed to extract GIF frame', details: error.message });
  }
});

export default router;
