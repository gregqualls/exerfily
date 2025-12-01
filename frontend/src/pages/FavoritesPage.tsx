import { useState, useEffect, useMemo } from 'react';
import { fetchExerciseById, fetchBodyParts, fetchTargets, fetchEquipments } from '../services/api';
import CollapsibleFilterBar from '../components/CollapsibleFilterBar';
import ExerciseGrid from '../components/ExerciseGrid';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import WorkoutSelectorModal from '../components/WorkoutSelectorModal';
import { getFavoriteExerciseIds, toggleFavorite } from '../services/favoritesStorage';
import { getAvailableEquipment } from '../services/equipmentStorage';
import type { Exercise, ExerciseFilters } from '../types';

export default function FavoritesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [isWorkoutSelectorOpen, setIsWorkoutSelectorOpen] = useState(false);
  const [filters, setFilters] = useState<ExerciseFilters>({});
  
  // Filter options loaded from API
  const [availableBodyParts, setAvailableBodyParts] = useState<string[]>([]);
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
    loadFavoriteExercises();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [bodyParts, targets, equipments] = await Promise.all([
        fetchBodyParts().catch(() => []),
        fetchTargets().catch(() => []),
        fetchEquipments().catch(() => [])
      ]);
      setAvailableBodyParts(Array.isArray(bodyParts) ? bodyParts : []);
      setAvailableMuscles(Array.isArray(targets) ? targets : []);
      setAvailableEquipment(Array.isArray(equipments) ? equipments : []);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

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

  // Apply filters to favorite exercises (client-side filtering)
  const filteredExercises = useMemo(() => {
    let filtered = [...exercises];

    // Search filter
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query) ||
        ex.instructions?.some(inst => inst.toLowerCase().includes(query))
      );
    }

    // Body part filter
    if (filters.bodyPart) {
      filtered = filtered.filter(ex => 
        ex.bodyPart?.toLowerCase() === filters.bodyPart?.toLowerCase()
      );
    }

    // Primary muscle filter
    if (filters.primaryMuscle) {
      const muscleFilter = filters.primaryMuscle.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.primaryMuscles.some(muscle => muscle.toLowerCase().includes(muscleFilter))
      );
    }

    // Equipment filter
    if (filters.equipment) {
      filtered = filtered.filter(ex => 
        ex.equipment.some(eq => eq.toLowerCase() === filters.equipment?.toLowerCase())
      );
    }

    // Level filter
    if (filters.level) {
      filtered = filtered.filter(ex => 
        ex.level?.toLowerCase() === filters.level?.toLowerCase()
      );
    }

    // Exercise type filter (check both category and exerciseType fields)
    if (filters.exerciseType) {
      const typeFilter = filters.exerciseType.toUpperCase();
      filtered = filtered.filter(ex => 
        ex.category?.toUpperCase() === typeFilter ||
        ex.exerciseType?.toUpperCase() === typeFilter
      );
    }

    // Equipment availability filter
    if (filters.equipmentFilterEnabled && filters.equipmentFilterMode !== 'off') {
      const availableEquipmentList = getAvailableEquipment();
      if (availableEquipmentList.length > 0) {
        filtered = filtered.filter(ex => {
          if (filters.equipmentFilterMode === 'all') {
            return ex.equipment.every(eq => availableEquipmentList.includes(eq));
          } else {
            return ex.equipment.some(eq => availableEquipmentList.includes(eq));
          }
        });
      }
    }

    return filtered;
  }, [exercises, filters]);

  if (loading) {
    return (
      <div className="min-h-screen page-enter">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-secondary">Loading favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-enter">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-primary">Favorites</h1>
          {exercises.length > 0 && (
            <p className="text-secondary">
              {filteredExercises.length} of {exercises.length} favorite{exercises.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {exercises.length > 0 && (
          <CollapsibleFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            availableBodyParts={availableBodyParts}
            availableMuscles={availableMuscles}
            availableEquipment={availableEquipment}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in mt-6">
            {error}
          </div>
        )}

        {!loading && !error && exercises.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-accent-400"
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
            <p className="text-secondary text-lg mb-2">No favorites yet</p>
            <p className="text-secondary">
              Browse exercises and click the heart icon to add them to your favorites
            </p>
          </div>
        )}

        {!loading && !error && exercises.length > 0 && (
          <div className="mt-6">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-secondary text-lg mb-2">No favorites match your filters</p>
                <p className="text-secondary">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <ExerciseGrid
                exercises={filteredExercises}
                onExerciseClick={handleExerciseClick}
                onAddToWorkout={handleAddToWorkout}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
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

