import { useState, useEffect } from 'react';
import { fetchExerciseById } from '../services/api';
import ExerciseGrid from '../components/ExerciseGrid';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import WorkoutSelectorModal from '../components/WorkoutSelectorModal';
import { getFavoriteExerciseIds, toggleFavorite } from '../services/favoritesStorage';
import type { Exercise } from '../types';

export default function FavoritesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [isWorkoutSelectorOpen, setIsWorkoutSelectorOpen] = useState(false);

  useEffect(() => {
    loadFavoriteExercises();
  }, []);

  const loadFavoriteExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const favoriteIds = getFavoriteExerciseIds();
      console.log('Loading favorite exercises:', favoriteIds.length);

      if (favoriteIds.length === 0) {
        setExercises([]);
        setLoading(false);
        return;
      }

      // Fetch all favorite exercises
      const exercisePromises = favoriteIds.map(id => 
        fetchExerciseById(id).catch(err => {
          console.error(`Failed to load exercise ${id}:`, err);
          return null;
        })
      );

      const loadedExercises = await Promise.all(exercisePromises);
      const validExercises = loadedExercises.filter((ex): ex is Exercise => ex !== null);
      
      setExercises(validExercises);
      console.log(`Loaded ${validExercises.length} favorite exercises`);
    } catch (err) {
      console.error('Error loading favorite exercises:', err);
      setError(`Failed to load favorites: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseClick = async (exercise: Exercise) => {
    try {
      const fullExercise = await fetchExerciseById(exercise.id);
      setSelectedExercise(fullExercise);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load exercise details:', err);
      setSelectedExercise(exercise);
      setIsModalOpen(true);
    }
  };

  const handleAddToWorkout = (exercise: Exercise) => {
    setExerciseToAdd(exercise);
    setIsWorkoutSelectorOpen(true);
  };

  const handleExerciseAdded = () => {
    setIsWorkoutSelectorOpen(false);
    setExerciseToAdd(null);
  };

  const handleToggleFavorite = (exercise: Exercise) => {
    const wasFavorite = toggleFavorite(exercise.id);
    if (!wasFavorite) {
      // If unfavorited, remove from the list
      setExercises(prev => prev.filter(ex => ex.id !== exercise.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-enter">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-mermaid-teal-700">Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-mermaid-teal-900">Favorites</h1>
          {exercises.length > 0 && (
            <p className="text-mermaid-teal-600">{exercises.length} favorite{exercises.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
            {error}
          </div>
        )}

        {!loading && !error && exercises.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-mermaid-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p className="text-mermaid-teal-700 text-lg mb-2">No favorites yet</p>
            <p className="text-mermaid-teal-600">
              Browse exercises and click the heart icon to add them to your favorites
            </p>
          </div>
        )}

        {!loading && !error && exercises.length > 0 && (
          <div className="mt-6">
            <ExerciseGrid
              exercises={exercises}
              onExerciseClick={handleExerciseClick}
              onAddToWorkout={handleAddToWorkout}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToWorkout={handleAddToWorkout}
        />

        <WorkoutSelectorModal
          isOpen={isWorkoutSelectorOpen}
          onClose={() => {
            setIsWorkoutSelectorOpen(false);
            setExerciseToAdd(null);
          }}
          exercise={exerciseToAdd}
          onExerciseAdded={handleExerciseAdded}
        />
      </div>
    </div>
  );
}

