import type { Exercise, ExerciseFilters, ExerciseResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchExercises(filters: ExerciseFilters = {}): Promise<ExerciseResponse> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append('q', filters.q);
  if (filters.bodyArea) params.append('bodyArea', filters.bodyArea);
  if (filters.primaryMuscle) params.append('primaryMuscle', filters.primaryMuscle);
  if (filters.equipment) params.append('equipment', filters.equipment);
  if (filters.level) params.append('level', filters.level);
  if (filters.category) params.append('category', filters.category);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`${API_BASE_URL}/api/exercises?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }
  return response.json();
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/api/exercises/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch exercise');
  }
  return response.json();
}

