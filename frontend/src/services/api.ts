import type { Exercise, ExerciseFilters, ExerciseResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchExercises(filters: ExerciseFilters = {}): Promise<ExerciseResponse> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append('q', filters.q);
  if (filters.bodyPart) params.append('bodyPart', filters.bodyPart);
  if (filters.primaryMuscle) params.append('primaryMuscle', filters.primaryMuscle);
  if (filters.equipment) params.append('equipment', filters.equipment);
  if (filters.level) params.append('level', filters.level);
  if (filters.category) params.append('category', filters.category);
  if (filters.exerciseType) params.append('exerciseType', filters.exerciseType);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const url = `${API_BASE_URL}/api/exercises?${params.toString()}`;
  console.log('Fetching from:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch exercises: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/api/exercises/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch exercise');
  }
  return response.json();
}

export async function fetchEquipments(): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/api/equipments`;
    console.log('Fetching equipments from:', url);
    const response = await fetch(url);
    console.log('Equipments response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Equipments error response:', errorText);
      throw new Error(`Failed to fetch equipments: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Equipments data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching equipments:', error);
    throw error;
  }
}

export async function fetchBodyParts(): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/api/bodyparts`;
    console.log('Fetching bodyparts from:', url);
    const response = await fetch(url);
    console.log('Bodyparts response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bodyparts error response:', errorText);
      throw new Error(`Failed to fetch bodyparts: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Bodyparts data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching bodyparts:', error);
    throw error;
  }
}

export async function fetchTargets(): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/api/targets`;
    console.log('Fetching targets from:', url);
    const response = await fetch(url);
    console.log('Targets response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Targets error response:', errorText);
      throw new Error(`Failed to fetch targets: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Targets data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching targets:', error);
    throw error;
  }
}

export interface SyncStatus {
  lastSyncDate: number | null;
  lastCommitSha: string | null;
  exerciseCount: number;
  hasData: boolean;
  updateAvailable: boolean;
  updateReason: string;
}

export async function checkSyncStatus(): Promise<SyncStatus> {
  try {
    const url = `${API_BASE_URL}/api/sync/status`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to check sync status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error checking sync status:', error);
    throw error;
  }
}

export async function triggerSync(force = false): Promise<{ success: boolean; synced: boolean; exerciseCount?: number }> {
  try {
    const url = `${API_BASE_URL}/api/sync${force ? '?force=true' : ''}`;
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Failed to trigger sync: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error triggering sync:', error);
    throw error;
  }
}

/**
 * Search ExerciseDB v2 API for exercises
 */
export async function searchExerciseDB(query: string): Promise<any[]> {
  try {
    const url = `${API_BASE_URL}/api/exercisedb/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to search ExerciseDB: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error searching ExerciseDB:', error);
    throw error;
  }
}

/**
 * Add an exercise from ExerciseDB v2 to the database
 */
export async function addExerciseFromDB(exerciseId: string): Promise<Exercise> {
  try {
    const url = `${API_BASE_URL}/api/exercisedb/add`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ exerciseId }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add exercise: ${response.status} ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error adding exercise from ExerciseDB:', error);
    throw error;
  }
}

