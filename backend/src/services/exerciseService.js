// ExerciseDB API integration
const EXERCISEDB_BASE_URL = 'https://exercisedb-api.vercel.app';

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
 * Fetch all exercises from ExerciseDB API
 */
async function fetchAllExercises() {
  try {
    const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises`);
    if (!response.ok) {
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapExerciseDBToDomain);
  } catch (error) {
    console.error('Error fetching from ExerciseDB:', error);
    throw error;
  }
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

