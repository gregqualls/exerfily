import type { Workout, Session } from '../types';

const STORAGE_KEY = 'exerfy-workouts';
const MIGRATION_KEY = 'exerfy-workouts-migrated';

// Migration function to flatten sessions into exercises
function migrateWorkout(legacyWorkout: any): Workout {
  // If it already has exercises and no sessions, it's already migrated
  if (legacyWorkout.exercises && !legacyWorkout.sessions) {
    return legacyWorkout as Workout;
  }

  // Flatten all sessions' exercises into a single exercises array
  const exercises: Workout['exercises'] = [];
  if (legacyWorkout.sessions && Array.isArray(legacyWorkout.sessions)) {
    legacyWorkout.sessions.forEach((session: Session) => {
      if (session.exercises && Array.isArray(session.exercises)) {
        exercises.push(...session.exercises);
      }
    });
  }

  return {
    id: legacyWorkout.id,
    name: legacyWorkout.name,
    description: legacyWorkout.description || '',
    createdAt: legacyWorkout.createdAt,
    updatedAt: legacyWorkout.updatedAt,
    exercises: exercises,
    printConfig: legacyWorkout.printConfig
  };
}

// Run migration once on first access
function ensureMigration(): void {
  const migrated = localStorage.getItem(MIGRATION_KEY);
  if (migrated === 'true') {
    return; // Already migrated
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }

    const workouts = JSON.parse(data);
    if (!Array.isArray(workouts)) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }

    // Check if any workout needs migration
    const needsMigration = workouts.some((w: any) => w.sessions && !w.exercises);
    if (!needsMigration) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }

    // Migrate all workouts
    const migratedWorkouts = workouts.map(migrateWorkout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedWorkouts));
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('Migrated workouts from sessions to direct exercises');
  } catch (error) {
    console.error('Error during migration:', error);
    localStorage.setItem(MIGRATION_KEY, 'true'); // Mark as migrated to avoid retry loops
  }
}

export function getWorkouts(): Workout[] {
  ensureMigration();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const workouts = JSON.parse(data);
    // Ensure all workouts are properly migrated
    return workouts.map((w: any) => migrateWorkout(w));
  } catch (error) {
    console.error('Error reading workouts from localStorage:', error);
    return [];
  }
}

export function saveWorkout(workout: Workout): void {
  try {
    const workouts = getWorkouts();
    const index = workouts.findIndex(w => w.id === workout.id);
    
    if (index >= 0) {
      workouts[index] = workout;
    } else {
      workouts.push(workout);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workout to localStorage:', error);
    throw error;
  }
}

export function deleteWorkout(workoutId: string): void {
  try {
    const workouts = getWorkouts().filter(w => w.id !== workoutId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error deleting workout from localStorage:', error);
    throw error;
  }
}

export function duplicateWorkout(workout: Workout): Workout {
  const duplicated: Workout = {
    ...workout,
    id: crypto.randomUUID(),
    name: `${workout.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: workout.exercises.map(ex => ({
      ...ex,
      id: crypto.randomUUID()
    }))
  };
  
  saveWorkout(duplicated);
  return duplicated;
}

export function getWorkoutById(id: string): Workout | null {
  const workouts = getWorkouts();
  return workouts.find(w => w.id === id) || null;
}

