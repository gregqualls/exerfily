import { getDb } from '../db/index.js';

/**
 * Map database row to Exercise domain model
 */
function mapRowToExercise(row) {
  return {
    id: row.id,
    name: row.name,
    bodyPart: row.bodyPart || 'full body',
    primaryMuscles: JSON.parse(row.primaryMuscles || '[]'),
    secondaryMuscles: JSON.parse(row.secondaryMuscles || '[]'),
    equipment: JSON.parse(row.equipment || '[]'),
    category: row.category || 'strength',
    level: row.level || 'intermediate',
    description: row.description || '',
    instructions: JSON.parse(row.instructions || '[]'),
    imageUrls: JSON.parse(row.imageUrls || '[]'),
    sourceId: row.sourceId || row.id,
    tags: JSON.parse(row.tags || '[]')
  };
}

/**
 * Build WHERE clause and parameters for filters
 */
function buildWhereClause(filters) {
  const conditions = [];
  const params = [];

  // Search query
  if (filters.q) {
    conditions.push(`(LOWER(name) LIKE ? OR EXISTS (
      SELECT 1 FROM json_each(tags) WHERE LOWER(json_each.value) LIKE ?
    ))`);
    const searchTerm = `%${filters.q.toLowerCase()}%`;
    params.push(searchTerm, searchTerm);
  }

  // Body part filter
  if (filters.bodyPart || filters.bodyArea) {
    const bodyPart = (filters.bodyPart || filters.bodyArea).toLowerCase();
    conditions.push('LOWER(bodyPart) = ?');
    params.push(bodyPart);
  }

  // Primary muscle filter
  if (filters.primaryMuscle) {
    conditions.push(`EXISTS (
      SELECT 1 FROM json_each(primaryMuscles) 
      WHERE LOWER(json_each.value) LIKE ?
    )`);
    params.push(`%${filters.primaryMuscle.toLowerCase()}%`);
  }

  // Equipment filter (single equipment type)
  if (filters.equipment) {
    conditions.push(`EXISTS (
      SELECT 1 FROM json_each(equipment) 
      WHERE LOWER(json_each.value) LIKE ?
    )`);
    params.push(`%${filters.equipment.toLowerCase()}%`);
  }

  // Available equipment filter (user's equipment list)
  if (filters.availableEquipment && Array.isArray(filters.availableEquipment) && filters.availableEquipment.length > 0) {
    const filterMode = filters.equipmentFilterMode || 'any';
    const equipmentList = filters.availableEquipment.map(eq => eq.toLowerCase());
    
    if (filterMode === 'all') {
      // All equipment in exercise must be in available list
      // This is complex - we need to check that every equipment in the exercise is in the available list
      // For simplicity, we'll use a subquery approach
      conditions.push(`(
        SELECT COUNT(*) FROM json_each(equipment) 
        WHERE LOWER(json_each.value) NOT IN (${equipmentList.map(() => '?').join(', ')})
      ) = 0`);
      params.push(...equipmentList);
    } else {
      // At least one equipment must be in available list
      conditions.push(`EXISTS (
        SELECT 1 FROM json_each(equipment) 
        WHERE LOWER(json_each.value) IN (${equipmentList.map(() => '?').join(', ')})
      )`);
      params.push(...equipmentList);
    }
  }

  // Level filter
  if (filters.level) {
    conditions.push('LOWER(level) = ?');
    params.push(filters.level.toLowerCase());
  }

  // Category filter
  if (filters.category) {
    conditions.push('LOWER(category) = ?');
    params.push(filters.category.toLowerCase());
  }

  // Exercise type filter (if we add this field to the schema)
  if (filters.exerciseType) {
    // Note: exerciseType is not in the current schema, but we can add it if needed
    // For now, we'll skip this filter
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

/**
 * Get exercises with filters
 */
export async function getExercises(filters = {}) {
  try {
    const db = getDb();
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    // Build WHERE clause
    const { where, params } = buildWhereClause(filters);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM exercises ${where}`;
    const countResult = db.prepare(countQuery).get(...params);
    const total = countResult.total || 0;

    // Get exercises with pagination
    const query = `
      SELECT * FROM exercises 
      ${where}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;
    
    const rows = db.prepare(query).all(...params, limit, offset);
    const exercises = rows.map(mapRowToExercise);

    return {
      exercises,
      total,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error getting exercises:', error);
    return {
      exercises: [],
      total: 0,
      limit: filters.limit || 50,
      offset: filters.offset || 0
    };
  }
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(id) {
  try {
    const db = getDb();
    
    // Try to find by id first
    let row = db.prepare('SELECT * FROM exercises WHERE id = ?').get(id);
    
    // If not found, try sourceId
    if (!row) {
      row = db.prepare('SELECT * FROM exercises WHERE sourceId = ?').get(id);
    }
    
    if (!row) {
      return null;
    }
    
    return mapRowToExercise(row);
  } catch (error) {
    console.error('Error getting exercise by ID:', error);
    return null;
  }
}

/**
 * Get unique equipment types from database
 */
export function getEquipments() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT DISTINCT equipment FROM exercises').all();
    
    const equipmentSet = new Set();
    rows.forEach(row => {
      const equipment = JSON.parse(row.equipment || '[]');
      equipment.forEach(eq => {
        if (eq) equipmentSet.add(eq);
      });
    });
    
    return Array.from(equipmentSet).sort();
  } catch (error) {
    console.error('Error getting equipments:', error);
    return [];
  }
}

/**
 * Get unique body parts from database
 */
export function getBodyParts() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT DISTINCT bodyPart FROM exercises WHERE bodyPart IS NOT NULL ORDER BY bodyPart').all();
    return rows.map(row => row.bodyPart).filter(Boolean).sort();
  } catch (error) {
    console.error('Error getting body parts:', error);
    return [];
  }
}

/**
 * Get unique target muscles (primary muscles) from database
 */
export function getTargets() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT DISTINCT primaryMuscles FROM exercises').all();
    
    const targetSet = new Set();
    rows.forEach(row => {
      const muscles = JSON.parse(row.primaryMuscles || '[]');
      muscles.forEach(muscle => {
        if (muscle) targetSet.add(muscle);
      });
    });
    
    return Array.from(targetSet).sort();
  } catch (error) {
    console.error('Error getting targets:', error);
    return [];
  }
}

/**
 * Search ExerciseDB API using the search endpoint
 * Documentation: https://www.exercisedb.dev/docs#tag/exercises/get/apiv1exercisessearch
 */
export async function searchExerciseDB(query) {
  try {
    if (!query || !query.trim()) {
      return [];
    }
    
    // Use the search endpoint from www.exercisedb.dev
    const searchUrl = `https://www.exercisedb.dev/api/v1/exercises/search?q=${encodeURIComponent(query)}&limit=50`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`ExerciseDB API error: ${searchResponse.status} ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    
    // The API returns { success: true, metadata: {...}, data: [...] }
    if (searchData.success && Array.isArray(searchData.data)) {
      return searchData.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching ExerciseDB:', error);
    throw error;
  }
}

/**
 * Get exercise by ID from ExerciseDB API
 */
export async function getExerciseFromDB(exerciseId) {
  try {
    // Try www.exercisedb.dev first, fallback to v2.exercisedb.dev
    const endpoints = [
      `https://www.exercisedb.dev/api/v1/exercises/${exerciseId}`,
      `https://v2.exercisedb.dev/api/v1/exercises/${exerciseId}`
    ];
    
    let lastError = null;
    for (const url of endpoints) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Exercise not found: ${exerciseId}`);
          }
          continue; // Try next endpoint
        }
        
        const data = await response.json();
        
        // Handle different response formats
        if (data.success && data.data) {
          return data.data;
        } else if (data.exerciseId || data.id) {
          return data;
        }
        
        // If we got here, the response format is unexpected
        continue;
      } catch (err) {
        lastError = err;
        // If it's a 404, don't try other endpoints
        if (err.message && err.message.includes('not found')) {
          throw err;
        }
        continue; // Try next endpoint
      }
    }
    
    throw lastError || new Error(`Failed to fetch exercise ${exerciseId}: All endpoints failed`);
  } catch (error) {
    console.error('Error fetching exercise from ExerciseDB:', error);
    throw error;
  }
}

/**
 * Map ExerciseDB format to our domain model
 * Handles both www.exercisedb.dev and v2.exercisedb.dev formats
 */
function mapExerciseDBToDomain(exerciseDB) {
  // Handle different API formats
  // www.exercisedb.dev: targetMuscles, bodyParts, equipments, gifUrl
  // v2.exercisedb.dev: targetMuscles, bodyParts, equipments, imageUrl
  
  const primaryMuscles = exerciseDB.targetMuscles && Array.isArray(exerciseDB.targetMuscles) 
    ? exerciseDB.targetMuscles 
    : (exerciseDB.target ? (Array.isArray(exerciseDB.target) ? exerciseDB.target : [exerciseDB.target]) : []);
  const secondaryMuscles = exerciseDB.secondaryMuscles && Array.isArray(exerciseDB.secondaryMuscles)
    ? exerciseDB.secondaryMuscles
    : [];
  
  // Equipment is an array
  const equipment = exerciseDB.equipments && Array.isArray(exerciseDB.equipments)
    ? exerciseDB.equipments
    : (exerciseDB.equipment ? (Array.isArray(exerciseDB.equipment) ? exerciseDB.equipment : [exerciseDB.equipment]) : []);
  
  // Body parts is an array
  const bodyParts = exerciseDB.bodyParts && Array.isArray(exerciseDB.bodyParts)
    ? exerciseDB.bodyParts
    : (exerciseDB.bodyPart ? (Array.isArray(exerciseDB.bodyPart) ? exerciseDB.bodyPart : [exerciseDB.bodyPart]) : []);
  
  // Use first body part or default
  const bodyPart = bodyParts.length > 0 ? bodyParts[0].toLowerCase() : 'full body';
  
  // Instructions might be in different fields
  const instructions = exerciseDB.instructions || exerciseDB.steps || exerciseDB.howTo || [];
  
  // Images - handle both gifUrl (www.exercisedb.dev) and imageUrl/imageUrls (v2.exercisedb.dev)
  const imageUrls = [];
  if (exerciseDB.gifUrl) {
    imageUrls.push(exerciseDB.gifUrl);
  }
  if (exerciseDB.imageUrl) {
    imageUrls.push(exerciseDB.imageUrl);
  }
  if (exerciseDB.images && Array.isArray(exerciseDB.images)) {
    imageUrls.push(...exerciseDB.images);
  }
  
  // Generate a unique ID based on ExerciseDB ID
  const sourceId = exerciseDB.exerciseId || exerciseDB.id;
  if (!sourceId) {
    throw new Error('ExerciseDB exercise missing exerciseId');
  }
  const id = `exdb_${sourceId}`;
  
  // Map exercise type to category
  const exerciseType = exerciseDB.exerciseType || exerciseDB.type || 'STRENGTH';
  const categoryMap = {
    'STRENGTH': 'strength',
    'CARDIO': 'cardio',
    'STRETCHING': 'stretching',
    'BALANCE': 'balance',
    'FLEXIBILITY': 'flexibility'
  };
  const category = categoryMap[exerciseType.toUpperCase()] || 'strength';
  
  // Default to intermediate level
  const level = exerciseDB.difficulty || exerciseDB.level || 'intermediate';
  
  return {
    id,
    name: exerciseDB.name || 'Unknown Exercise',
    bodyPart: bodyPart,
    primaryMuscles: primaryMuscles.filter(Boolean).map(m => m.toLowerCase()),
    secondaryMuscles: secondaryMuscles.filter(Boolean).map(m => m.toLowerCase()),
    equipment: equipment.filter(Boolean).map(e => e.toLowerCase()),
    category: category,
    level: level.toLowerCase(),
    description: exerciseDB.description || exerciseDB.overview || exerciseDB.summary || '',
    instructions: Array.isArray(instructions) ? instructions.filter(Boolean) : [],
    imageUrls: imageUrls.filter(Boolean),
    sourceId: sourceId,
    tags: exerciseDB.keywords && Array.isArray(exerciseDB.keywords) ? exerciseDB.keywords : [],
    force: exerciseDB.force || null,
    mechanic: exerciseDB.mechanic || null
  };
}

/**
 * Add exercise from ExerciseDB v2 to database
 */
export async function addExerciseFromDB(exerciseId) {
  try {
    const db = getDb();
    
    // Check if exercise already exists
    const existing = db.prepare('SELECT * FROM exercises WHERE sourceId = ? OR id = ?').get(
      `exdb_${exerciseId}`,
      `exdb_${exerciseId}`
    );
    
    if (existing) {
      // Return existing exercise
      return mapRowToExercise(existing);
    }
    
    // Fetch exercise from ExerciseDB v2
    const exerciseDB = await getExerciseFromDB(exerciseId);
    
    // Map to domain model
    const exercise = mapExerciseDBToDomain(exerciseDB);
    
    // Insert into database
    const insertStmt = db.prepare(`
      INSERT INTO exercises (
        id, name, bodyPart, primaryMuscles, secondaryMuscles, equipment,
        category, level, description, instructions, imageUrls, sourceId,
        tags, force, mechanic, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `);
    
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
    
    console.log(`✅ Added exercise from ExerciseDB: ${exercise.name} (${exercise.id})`);
    
    return exercise;
  } catch (error) {
    console.error('Error adding exercise from ExerciseDB:', error);
    throw error;
  }
}
