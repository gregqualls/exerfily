import { useState, useEffect, useCallback } from 'react';
import { searchExerciseDB, addExerciseFromDB } from '../services/api';
import { addFavorite } from '../services/favoritesStorage';

interface ExerciseDBModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseAdded: () => void;
}

interface ExerciseDBResult {
  exerciseId: string;
  name: string;
  bodyParts?: string[];
  bodyPart?: string;
  targetMuscles?: string[];
  target?: string;
  equipments?: string[];
  equipment?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  description?: string;
  difficulty?: string;
  exerciseType?: string;
  category?: string;
  imageUrl?: string;
  gifUrl?: string;
  images?: string[];
  videoUrl?: string;
  keywords?: string[];
}

export default function ExerciseDBModal({
  isOpen,
  onClose,
  onExerciseAdded
}: ExerciseDBModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ExerciseDBResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSearchQuery('');
      setResults([]);
      setError(null);
      setAddingExerciseId(null);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
    }
  }, [isOpen, searchTimeout]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchExerciseDB(query);
      setResults(data);
    } catch (err) {
      console.error('Error searching ExerciseDB:', err);
      setError(err instanceof Error ? err.message : 'Failed to search exercises');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery, performSearch]);

  const handleAddToDatabase = async (exercise: ExerciseDBResult, alsoAddToFavorites: boolean) => {
    setAddingExerciseId(exercise.exerciseId);
    setError(null);

    try {
      const addedExercise = await addExerciseFromDB(exercise.exerciseId);
      
      if (alsoAddToFavorites) {
        addFavorite(addedExercise.id);
      }

      // Show success message briefly
      setError(null);
      
      // Refresh the exercises list
      onExerciseAdded();
      
      // Optionally close modal or show success
      // For now, we'll keep it open so user can add more
    } catch (err) {
      console.error('Error adding exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to add exercise');
    } finally {
      setAddingExerciseId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-border animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-border p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-primary">
                Add Exercise from ExerciseDB
              </h2>
              <p className="text-sm text-secondary mt-1">
                Search and add exercises from ExerciseDB v2
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for exercises (e.g., 'bench press', 'squat', 'deadlift')..."
              className="w-full px-4 py-3 pl-10 rounded-lg border border-border bg-white text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <p className="text-secondary">Searching exercises...</p>
            </div>
          )}

          {!loading && searchQuery && results.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-secondary">
                No exercises found. Try a different search term.
              </p>
            </div>
          )}

          {!loading && !searchQuery && (
            <div className="text-center py-12">
              <p className="text-secondary">
                Start typing to search for exercises...
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((exercise) => (
                <div
                  key={exercise.exerciseId}
                  className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {(exercise.gifUrl || exercise.imageUrl || (exercise.images && exercise.images.length > 0)) && (
                      <img
                        src={exercise.gifUrl || exercise.imageUrl || exercise.images?.[0]}
                        alt={exercise.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        {exercise.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3 text-sm">
                        {(exercise.bodyParts && exercise.bodyParts.length > 0) && (
                          <span className="px-2 py-1 bg-primary-100 text-secondary rounded">
                            {exercise.bodyParts.join(', ')}
                          </span>
                        )}
                        {!exercise.bodyParts && exercise.bodyPart && (
                          <span className="px-2 py-1 bg-primary-100 text-secondary rounded">
                            {exercise.bodyPart}
                          </span>
                        )}
                        {(exercise.targetMuscles && exercise.targetMuscles.length > 0) && (
                          <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded">
                            {exercise.targetMuscles.join(', ')}
                          </span>
                        )}
                        {!exercise.targetMuscles && exercise.target && (
                          <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded">
                            {exercise.target}
                          </span>
                        )}
                        {(exercise.equipments && exercise.equipments.length > 0) && (
                          <span className="px-2 py-1 bg-secondary-100 text-secondary rounded">
                            {exercise.equipments.join(', ')}
                          </span>
                        )}
                        {!exercise.equipments && exercise.equipment && (
                          <span className="px-2 py-1 bg-secondary-100 text-secondary rounded">
                            {exercise.equipment}
                          </span>
                        )}
                        {exercise.exerciseType && (
                          <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded">
                            {exercise.exerciseType}
                          </span>
                        )}
                        {!exercise.exerciseType && exercise.difficulty && (
                          <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded">
                            {exercise.difficulty}
                          </span>
                        )}
                      </div>
                      {exercise.description && (
                        <p className="text-sm text-secondary mb-3 line-clamp-2">
                          {exercise.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToDatabase(exercise, false)}
                          disabled={addingExerciseId === exercise.exerciseId}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {addingExerciseId === exercise.exerciseId ? 'Adding...' : 'Add to Exercises'}
                        </button>
                        <button
                          onClick={() => handleAddToDatabase(exercise, true)}
                          disabled={addingExerciseId === exercise.exerciseId}
                          className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {addingExerciseId === exercise.exerciseId ? 'Adding...' : 'Add to Exercises & Favorites'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

