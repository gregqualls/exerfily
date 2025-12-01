const STORAGE_KEY = 'exerfy-favorites';

/**
 * Get all favorite exercise IDs
 */
export function getFavoriteExerciseIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

/**
 * Check if an exercise is favorited
 */
export function isFavorite(exerciseId: string): boolean {
  const favorites = getFavoriteExerciseIds();
  return favorites.includes(exerciseId);
}

/**
 * Add an exercise to favorites
 */
export function addFavorite(exerciseId: string): void {
  try {
    const favorites = getFavoriteExerciseIds();
    if (!favorites.includes(exerciseId)) {
      favorites.push(exerciseId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
}

/**
 * Remove an exercise from favorites
 */
export function removeFavorite(exerciseId: string): void {
  try {
    const favorites = getFavoriteExerciseIds().filter(id => id !== exerciseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

/**
 * Toggle favorite status of an exercise
 */
export function toggleFavorite(exerciseId: string): boolean {
  if (isFavorite(exerciseId)) {
    removeFavorite(exerciseId);
    return false;
  } else {
    addFavorite(exerciseId);
    return true;
  }
}

/**
 * Get count of favorites
 */
export function getFavoriteCount(): number {
  return getFavoriteExerciseIds().length;
}


