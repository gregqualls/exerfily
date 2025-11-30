import type { Workout } from '../types';

const STORAGE_KEY = 'exerfy-workouts';

export function getWorkouts(): Workout[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
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
    sessions: workout.sessions.map(session => ({
      ...session,
      id: crypto.randomUUID(),
      exercises: session.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID()
      }))
    }))
  };
  
  saveWorkout(duplicated);
  return duplicated;
}

export function getWorkoutById(id: string): Workout | null {
  const workouts = getWorkouts();
  return workouts.find(w => w.id === id) || null;
}

