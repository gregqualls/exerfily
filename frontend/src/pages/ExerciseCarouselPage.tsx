import { useState, useEffect, useMemo } from 'react';
import { fetchExercises, fetchExerciseById, fetchBodyParts, fetchTargets, fetchEquipments } from '../services/api';
import CollapsibleFilterBar from '../components/CollapsibleFilterBar';
import ExerciseCarousel from '../components/ExerciseCarousel';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import WorkoutSelectorModal from '../components/WorkoutSelectorModal';
import CreateCustomExerciseModal from '../components/CreateCustomExerciseModal';
import { getAvailableEquipment } from '../services/equipmentStorage';
import { toggleFavorite } from '../services/favoritesStorage';
import { getCustomExercises } from '../services/customExerciseStorage';
import type { Exercise, ExerciseFilters } from '../types';

export default function ExerciseCarouselPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseFilters>({ limit: 100 });
  const [totalExercises, setTotalExercises] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [isWorkoutSelectorOpen, setIsWorkoutSelectorOpen] = useState(false);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  
  // Filter options loaded from API
  const [availableBodyParts, setAvailableBodyParts] = useState<string[]>([]);
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
    loadCustomExercises();
  }, []);

  const loadCustomExercises = () => {
    setCustomExercises(getCustomExercises());
  };

  // Auto-load all exercises when filters change
  useEffect(() => {
    loadAllExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.q,
    filters.bodyPart,
    filters.primaryMuscle,
    filters.equipment,
    filters.level,
    filters.category,
    filters.exerciseType,
    filters.equipmentFilterEnabled,
    filters.equipmentFilterMode,
    customExercises
  ]);

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

  const loadAllExercises = async () => {
    setLoading(true);
    setError(null);
    setExercises([]);
    
    try {
      let allExercises: Exercise[] = [];
      let offset = 0;
      const limit = 100;
      let hasMoreData = true;

      while (hasMoreData) {
        const response = await fetchExercises({
          ...filters,
          limit,
          offset
        });

        allExercises = [...allExercises, ...response.exercises];
        setTotalExercises(response.total);
        
        if (allExercises.length >= response.total || response.exercises.length < limit) {
          hasMoreData = false;
        } else {
          offset += limit;
        }
      }

      // Combine database exercises with custom exercises
      const combined = [...allExercises, ...customExercises];
      setExercises(combined);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError(`Failed to load exercises: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
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
    toggleFavorite(exercise.id);
    // Force re-render to update favorite button state
    setExercises(prev => [...prev]);
  };

  // Apply equipment filtering based on user preferences
  const filteredExercises = useMemo(() => {
    if (!filters.equipmentFilterEnabled || filters.equipmentFilterMode === 'off') {
      return exercises;
    }

    const availableEquipmentList = getAvailableEquipment();
    if (availableEquipmentList.length === 0) {
      return exercises;
    }

    return exercises.filter(ex => {
      if (filters.equipmentFilterMode === 'all') {
        return ex.equipment.every(eq => availableEquipmentList.includes(eq));
      } else {
        return ex.equipment.some(eq => availableEquipmentList.includes(eq));
      }
    });
  }, [exercises, filters.equipmentFilterEnabled, filters.equipmentFilterMode]);

  const handleCustomExerciseCreated = () => {
    loadCustomExercises();
    setIsCreateCustomOpen(false);
  };

  const handleExerciseClick = async (exercise: Exercise) => {
    // Custom exercises are already loaded, database exercises need fetching
    if (exercise.id.startsWith('custom_')) {
      setSelectedExercise(exercise);
      setIsModalOpen(true);
    } else {
      try {
        const fullExercise = await fetchExerciseById(exercise.id);
        setSelectedExercise(fullExercise);
        setIsModalOpen(true);
      } catch (err) {
        console.error('Failed to load exercise details:', err);
        setSelectedExercise(exercise);
        setIsModalOpen(true);
      }
    }
  };

  return (
    <div className="min-h-screen page-enter">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-primary">Exercise Carousel</h1>
          <button
            onClick={() => setIsCreateCustomOpen(true)}
            className="px-5 py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-all font-medium shadow-sm hover:shadow-md btn-glow"
          >
            + Create Custom Exercise
          </button>
        </div>

        <CollapsibleFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          availableBodyParts={availableBodyParts}
          availableMuscles={availableMuscles}
          availableEquipment={availableEquipment}
        />

        {loading && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-secondary">Loading exercises...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6">
            <ExerciseCarousel
              exercises={filteredExercises}
              onExerciseClick={handleExerciseClick}
              onAddToWorkout={handleAddToWorkout}
              onToggleFavorite={handleToggleFavorite}
            />
            {!loading && exercises.length > 0 && (
              <div className="mt-8 text-center text-secondary text-sm">
                <p>Showing {filteredExercises.length} of {totalExercises + customExercises.length} exercises</p>
              </div>
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

        <CreateCustomExerciseModal
          isOpen={isCreateCustomOpen}
          onClose={() => setIsCreateCustomOpen(false)}
          onExerciseCreated={handleCustomExerciseCreated}
        />
      </div>
    </div>
  );
}

