import type { Exercise } from '../types';

const STORAGE_KEY = 'exerfy-custom-exercises';

// Custom exercises have a special prefix to distinguish them from database exercises
export const CUSTOM_EXERCISE_PREFIX = 'custom_';

export function getCustomExercises(): Exercise[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading custom exercises from localStorage:', error);
    return [];
  }
}

export function saveCustomExercise(exercise: Exercise): void {
  try {
    const exercises = getCustomExercises();
    const index = exercises.findIndex(ex => ex.id === exercise.id);
    
    if (index >= 0) {
      exercises[index] = exercise;
    } else {
      exercises.push(exercise);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error('Error saving custom exercise to localStorage:', error);
    throw error;
  }
}

export function deleteCustomExercise(exerciseId: string): void {
  try {
    const exercises = getCustomExercises().filter(ex => ex.id !== exerciseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
  } catch (error) {
    console.error('Error deleting custom exercise from localStorage:', error);
    throw error;
  }
}

export function getCustomExerciseById(id: string): Exercise | null {
  const exercises = getCustomExercises();
  return exercises.find(ex => ex.id === id) || null;
}

export function isCustomExercise(id: string): boolean {
  return id.startsWith(CUSTOM_EXERCISE_PREFIX);
}


