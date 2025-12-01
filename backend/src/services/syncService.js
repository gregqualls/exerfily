import { getDb } from '../db/index.js';

const GITHUB_REPO_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const GITHUB_API_REPO_URL = 'https://api.github.com/repos/yuhonas/free-exercise-db/commits/main';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

/**
 * Map muscle groups to body parts
 */
function getBodyPartFromMuscles(primaryMuscles) {
  if (!primaryMuscles || primaryMuscles.length === 0) {
    return 'full body';
  }

  const muscleToBodyPart = {
    // Upper body
    'biceps': 'upper body',
    'triceps': 'upper body',
    'forearms': 'upper body',
    'shoulders': 'upper body',
    'delts': 'upper body',
    'traps': 'upper body',
    'lats': 'back',
    'middle back': 'back',
    'lower back': 'back',
    'pectorals': 'upper body',
    'chest': 'upper body',
    
    // Core
    'abs': 'core',
    'abdominals': 'core',
    'obliques': 'core',
    
    // Lower body
    'quadriceps': 'lower body',
    'quads': 'lower body',
    'hamstrings': 'lower body',
    'glutes': 'lower body',
    'calves': 'lower body',
    'adductors': 'lower body',
    'abductors': 'lower body',
    
    // Back
    'lats': 'back',
    'spine': 'back',
    'erector spinae': 'back'
  };

  // Check primary muscles first
  for (const muscle of primaryMuscles) {
    const muscleLower = muscle.toLowerCase();
    for (const [key, bodyPart] of Object.entries(muscleToBodyPart)) {
      if (muscleLower.includes(key) || key.includes(muscleLower)) {
        return bodyPart;
      }
    }
  }

  // Default based on first muscle
  const firstMuscle = primaryMuscles[0].toLowerCase();
  if (firstMuscle.includes('bicep') || firstMuscle.includes('tricep') || 
      firstMuscle.includes('shoulder') || firstMuscle.includes('chest') || 
      firstMuscle.includes('pec')) {
    return 'upper body';
  }
  if (firstMuscle.includes('quad') || firstMuscle.includes('hamstring') || 
      firstMuscle.includes('glute') || firstMuscle.includes('calf')) {
    return 'lower body';
  }
  if (firstMuscle.includes('abs') || firstMuscle.includes('oblique') || 
      firstMuscle.includes('core')) {
    return 'core';
  }
  if (firstMuscle.includes('back') || firstMuscle.includes('lat')) {
    return 'back';
  }

  return 'full body';
}

/**
 * Map free-exercise-db format to our Exercise domain model
 */
function mapToDomainModel(exercise) {
  const id = exercise.id || exercise.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'unknown';
  
  // Handle equipment - can be null or string
  let equipment = [];
  if (exercise.equipment) {
    if (Array.isArray(exercise.equipment)) {
      equipment = exercise.equipment;
    } else if (typeof exercise.equipment === 'string') {
      equipment = [exercise.equipment];
    }
  }
  // Normalize equipment names
  equipment = equipment.map(eq => eq ? eq.toLowerCase() : 'body weight').filter(Boolean);

  // Handle primary and secondary muscles
  const primaryMuscles = Array.isArray(exercise.primaryMuscles) 
    ? exercise.primaryMuscles 
    : [];
  const secondaryMuscles = Array.isArray(exercise.secondaryMuscles) 
    ? exercise.secondaryMuscles 
    : [];

  // Get body part from muscles
  const bodyPart = getBodyPartFromMuscles(primaryMuscles);

  // Map level
  let level = 'intermediate';
  if (exercise.level) {
    const levelLower = exercise.level.toLowerCase();
    if (levelLower.includes('beginner') || levelLower === 'easy') {
      level = 'beginner';
    } else if (levelLower.includes('advanced') || levelLower === 'hard' || levelLower === 'expert') {
      level = 'advanced';
    }
  }

  // Handle images - transform to full GitHub URLs
  let imageUrls = [];
  if (Array.isArray(exercise.images) && exercise.images.length > 0) {
    imageUrls = exercise.images.map(img => {
      // If already a full URL, use it; otherwise construct from path
      if (img.startsWith('http')) {
        return img;
      }
      // Handle paths like "Alternate_Incline_Dumbbell_Curl/0.jpg"
      if (img.includes('/')) {
        return `${IMAGE_BASE_URL}/${img}`;
      }
      // Handle just filename - use exercise id as directory
      return `${IMAGE_BASE_URL}/${exercise.id}/${img}`;
    });
  }

  // Handle instructions
  const instructions = Array.isArray(exercise.instructions) 
    ? exercise.instructions 
    : [];

  // Create description from instructions or use empty string
  const description = instructions.length > 0 
    ? instructions.join(' ') 
    : '';

  return {
    id,
    name: exercise.name || '',
    bodyPart,
    primaryMuscles,
    secondaryMuscles,
    equipment,
    category: exercise.category || 'strength',
    level,
    description,
    instructions,
    imageUrls,
    sourceId: exercise.id || id,
    tags: exercise.keywords || [],
    force: exercise.force || null,
    mechanic: exercise.mechanic || null
  };
}

/**
 * Get the latest commit SHA from GitHub
 */
async function getLatestCommitSha() {
  try {
    const response = await fetch(GITHUB_API_REPO_URL);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const data = await response.json();
    return data.sha;
  } catch (error) {
    console.error('Error fetching latest commit SHA:', error);
    return null;
  }
}

/**
 * Check if sync is needed by comparing commit SHA
 */
export async function checkSyncNeeded() {
  const db = getDb();
  
  // Get last sync metadata
  const lastSync = db.prepare('SELECT * FROM sync_metadata ORDER BY createdAt DESC LIMIT 1').get();
  
  if (!lastSync) {
    return { needed: true, reason: 'No previous sync found' };
  }

  // Check latest commit SHA
  const latestSha = await getLatestCommitSha();
  if (!latestSha) {
    // If we can't check, assume sync is needed if it's been more than 24 hours
    const hoursSinceSync = (Date.now() / 1000 - lastSync.lastSyncDate) / 3600;
    return { 
      needed: hoursSinceSync > 24, 
      reason: hoursSinceSync > 24 ? 'More than 24 hours since last sync' : 'Recent sync, no update needed'
    };
  }

  if (lastSync.lastCommitSha !== latestSha) {
    return { needed: true, reason: 'New commit detected', latestSha };
  }

  return { needed: false, reason: 'Already up to date' };
}

/**
 * Fetch exercises from GitHub repo
 */
async function fetchExercisesFromGitHub() {
  try {
    console.log('Fetching exercises from free-exercise-db GitHub repo...');
    const response = await fetch(GITHUB_REPO_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
    }
    
    const exercises = await response.json();
    console.log(`Fetched ${exercises.length} exercises from GitHub`);
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises from GitHub:', error);
    throw error;
  }
}

/**
 * Sync exercises from GitHub to database
 */
export async function syncExercises(force = false) {
  const db = getDb();
  
  try {
    // Check if sync is needed
    if (!force) {
      const check = await checkSyncNeeded();
      if (!check.needed) {
        console.log('Sync not needed:', check.reason);
        return {
          success: true,
          synced: false,
          reason: check.reason,
          exerciseCount: db.prepare('SELECT COUNT(*) as count FROM exercises').get().count
        };
      }
      console.log('Sync needed:', check.reason);
    }

    // Fetch exercises from GitHub
    const githubExercises = await fetchExercisesFromGitHub();
    
    // Get latest commit SHA
    const latestSha = await getLatestCommitSha();
    
    // Map to domain model
    const mappedExercises = githubExercises.map(mapToDomainModel);
    
    // Start transaction
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO exercises (
        id, name, bodyPart, primaryMuscles, secondaryMuscles, equipment,
        category, level, description, instructions, imageUrls, sourceId,
        tags, force, mechanic, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `);
    
    const insertMany = db.transaction((exercises) => {
      for (const exercise of exercises) {
        insertStmt.run(
          exercise.id,
          exercise.name,
          exercise.bodyPart,
          JSON.stringify(exercise.primaryMuscles),
          JSON.stringify(exercise.secondaryMuscles),
          JSON.stringify(exercise.equipment),
          exercise.category,
          exercise.level,
          exercise.description,
          JSON.stringify(exercise.instructions),
          JSON.stringify(exercise.imageUrls),
          exercise.sourceId,
          JSON.stringify(exercise.tags),
          exercise.force,
          exercise.mechanic
        );
      }
    });
    
    insertMany(mappedExercises);
    
    // Record sync metadata
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
      INSERT INTO sync_metadata (lastSyncDate, lastCommitSha, exerciseCount)
      VALUES (?, ?, ?)
    `).run(now, latestSha || null, mappedExercises.length);
    
    console.log(`✅ Synced ${mappedExercises.length} exercises to database`);
    
    return {
      success: true,
      synced: true,
      exerciseCount: mappedExercises.length,
      commitSha: latestSha
    };
  } catch (error) {
    console.error('Error syncing exercises:', error);
    return {
      success: false,
      synced: false,
      error: error.message
    };
  }
}

/**
 * Get sync status
 */
export function getSyncStatus() {
  const db = getDb();
  
  const lastSync = db.prepare('SELECT * FROM sync_metadata ORDER BY createdAt DESC LIMIT 1').get();
  const exerciseCount = db.prepare('SELECT COUNT(*) as count FROM exercises').get().count;
  
  return {
    lastSyncDate: lastSync ? lastSync.lastSyncDate : null,
    lastCommitSha: lastSync ? lastSync.lastCommitSha : null,
    exerciseCount: exerciseCount || 0,
    hasData: exerciseCount > 0
  };
}


