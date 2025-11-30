// ExerciseDB API integration
// Load from local JSON file for instant loading
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXERCISES_FILE = join(__dirname, '../../data/exercises.json');

// Cache for exercises (simple in-memory cache)
let exerciseCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Map ExerciseDB response to our Exercise domain model
 */
function mapExerciseDBToDomain(exerciseDB) {
  return {
    id: exerciseDB.id || exerciseDB.name?.toLowerCase().replace(/\s+/g, '-'),
    name: exerciseDB.name || '',
    bodyArea: mapBodyPartToBodyArea(exerciseDB.bodyPart),
    primaryMuscles: exerciseDB.target ? [exerciseDB.target] : [],
    secondaryMuscles: exerciseDB.secondaryMuscles || [],
    equipment: exerciseDB.equipment ? [exerciseDB.equipment] : [],
    category: exerciseDB.category || 'strength',
    level: mapLevel(exerciseDB.difficulty || exerciseDB.level),
    description: exerciseDB.instructions?.join(' ') || exerciseDB.description || '',
    instructions: exerciseDB.instructions || [],
    imageUrls: exerciseDB.gifUrl ? [exerciseDB.gifUrl] : [],
    sourceId: exerciseDB.id || exerciseDB.name,
    tags: []
  };
}

function mapBodyPartToBodyArea(bodyPart) {
  const mapping = {
    'chest': 'upper body',
    'back': 'back',
    'shoulders': 'upper body',
    'biceps': 'upper body',
    'triceps': 'upper body',
    'forearms': 'upper body',
    'abs': 'core',
    'cardio': 'full body',
    'legs': 'lower body',
    'calves': 'lower body',
    'glutes': 'lower body',
    'quadriceps': 'lower body',
    'hamstrings': 'lower body',
    'neck': 'neck'
  };
  return mapping[bodyPart?.toLowerCase()] || 'full body';
}

function mapLevel(level) {
  if (!level) return 'intermediate';
  const l = level.toLowerCase();
  if (l.includes('beginner') || l === 'easy') return 'beginner';
  if (l.includes('advanced') || l === 'hard') return 'advanced';
  return 'intermediate';
}

/**
 * Mock exercise data for development
 */
function getMockExercises() {
  return [
    {
      id: '1',
      name: 'Barbell Curl',
      bodyPart: 'biceps',
      target: 'biceps',
      equipment: 'barbell',
      category: 'strength',
      instructions: [
        'Stand up straight with a barbell in your hands',
        'Keep your elbows close to your torso',
        'Curl the barbell up to your chest',
        'Slowly lower back to starting position'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/0131.gif'
    },
    {
      id: '2',
      name: 'Dumbbell Bench Press',
      bodyPart: 'chest',
      target: 'pectorals',
      equipment: 'dumbbell',
      category: 'strength',
      instructions: [
        'Lie on a flat bench with dumbbells in each hand',
        'Press the dumbbells up until arms are extended',
        'Lower slowly back to chest level'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/0314.gif'
    },
    {
      id: '3',
      name: 'Squat',
      bodyPart: 'legs',
      target: 'quadriceps',
      equipment: 'body weight',
      category: 'strength',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your body by bending knees',
        'Keep back straight and chest up',
        'Return to standing position'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/1512.gif'
    },
    {
      id: '4',
      name: 'Pull-up',
      bodyPart: 'back',
      target: 'lats',
      equipment: 'body weight',
      category: 'strength',
      instructions: [
        'Hang from a pull-up bar',
        'Pull your body up until chin is above bar',
        'Lower slowly to starting position'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/1301.gif'
    },
    {
      id: '5',
      name: 'Overhead Press',
      bodyPart: 'shoulders',
      target: 'delts',
      equipment: 'barbell',
      category: 'strength',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Hold barbell at shoulder height',
        'Press up until arms are fully extended',
        'Lower back to shoulders'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/0305.gif'
    },
    {
      id: '6',
      name: 'Deadlift',
      bodyPart: 'back',
      target: 'erector spinae',
      equipment: 'barbell',
      category: 'strength',
      instructions: [
        'Stand with feet hip-width apart',
        'Bend at hips and knees to grab bar',
        'Keep back straight and lift with legs',
        'Stand up straight, then lower bar'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/0001.gif'
    },
    {
      id: '7',
      name: 'Push-up',
      bodyPart: 'chest',
      target: 'pectorals',
      equipment: 'body weight',
      category: 'strength',
      instructions: [
        'Start in plank position',
        'Lower body until chest nearly touches ground',
        'Push back up to starting position'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/1164.gif'
    },
    {
      id: '8',
      name: 'Lunges',
      bodyPart: 'legs',
      target: 'quadriceps',
      equipment: 'body weight',
      category: 'strength',
      instructions: [
        'Step forward with one leg',
        'Lower body until both knees are bent at 90 degrees',
        'Push back to starting position',
        'Alternate legs'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/3214.gif'
    },
    {
      id: '9',
      name: 'Plank',
      bodyPart: 'abs',
      target: 'abs',
      equipment: 'body weight',
      category: 'strength',
      instructions: [
        'Start in push-up position',
        'Hold body straight from head to heels',
        'Keep core engaged',
        'Hold for desired time'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/2204.gif'
    },
    {
      id: '10',
      name: 'Dumbbell Row',
      bodyPart: 'back',
      target: 'lats',
      equipment: 'dumbbell',
      category: 'strength',
      instructions: [
        'Bend over with one knee on bench',
        'Pull dumbbell up to side of chest',
        'Lower slowly',
        'Alternate sides'
      ],
      gifUrl: 'https://d205bpvrqc9yn1.cloudfront.net/0315.gif'
    }
  ];
}

/**
 * Load exercises from local JSON file (instant loading)
 */
function loadExercisesFromFile() {
  try {
    const fileContent = readFileSync(EXERCISES_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading exercises from file, using mock data:', error);
    // Fallback to mock data
    return getMockExercises().map(mapExerciseDBToDomain);
  }
}

/**
 * Fetch all exercises - loads from local file instantly
 */
async function fetchAllExercises() {
  // Load from local JSON file for instant response
  return loadExercisesFromFile();
}

/**
 * Get all exercises with optional caching
 */
async function getAllExercises() {
  const now = Date.now();
  if (exerciseCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return exerciseCache;
  }

  const exercises = await fetchAllExercises();
  exerciseCache = exercises;
  cacheTimestamp = now;
  return exercises;
}

/**
 * Get exercises with filters
 */
export async function getExercises(filters = {}) {
  const allExercises = await getAllExercises();
  let filtered = [...allExercises];

  // Search by name
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(ex => 
      ex.name.toLowerCase().includes(query)
    );
  }

  // Filter by body area
  if (filters.bodyArea) {
    filtered = filtered.filter(ex => 
      ex.bodyArea.toLowerCase() === filters.bodyArea.toLowerCase()
    );
  }

  // Filter by primary muscle
  if (filters.primaryMuscle) {
    filtered = filtered.filter(ex => 
      ex.primaryMuscles.some(m => 
        m.toLowerCase().includes(filters.primaryMuscle.toLowerCase())
      )
    );
  }

  // Filter by equipment
  if (filters.equipment) {
    filtered = filtered.filter(ex => 
      ex.equipment.some(e => 
        e.toLowerCase().includes(filters.equipment.toLowerCase())
      )
    );
  }

  // Filter by level
  if (filters.level) {
    filtered = filtered.filter(ex => 
      ex.level.toLowerCase() === filters.level.toLowerCase()
    );
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter(ex => 
      ex.category.toLowerCase() === filters.category.toLowerCase()
    );
  }

  // Apply pagination
  const start = filters.offset || 0;
  const end = start + (filters.limit || 50);
  const paginated = filtered.slice(start, end);

  return {
    exercises: paginated,
    total: filtered.length,
    limit: filters.limit || 50,
    offset: filters.offset || 0
  };
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(id) {
  const allExercises = await getAllExercises();
  return allExercises.find(ex => ex.id === id || ex.sourceId === id) || null;
}

