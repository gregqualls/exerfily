import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchExercises, fetchExerciseById, fetchBodyParts, fetchTargets, fetchEquipments } from '../services/api';
import CollapsibleFilterBar from '../components/CollapsibleFilterBar';
import ExerciseGrid from '../components/ExerciseGrid';
import ExerciseCarousel from '../components/ExerciseCarousel';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import WorkoutSelectorModal from '../components/WorkoutSelectorModal';
import CreateCustomExerciseModal from '../components/CreateCustomExerciseModal';
import ExerciseDBModal from '../components/ExerciseDBModal';
import { getAvailableEquipment } from '../services/equipmentStorage';
import { toggleFavorite } from '../services/favoritesStorage';
import { getCustomExercises } from '../services/customExerciseStorage';
import type { Exercise, ExerciseFilters } from '../types';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseFilters>({ limit: 12 });
  const [totalExercises, setTotalExercises] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [isWorkoutSelectorOpen, setIsWorkoutSelectorOpen] = useState(false);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [isExerciseDBOpen, setIsExerciseDBOpen] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const observerTarget = useRef<HTMLDivElement>(null);
  
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

  // Load exercises when filters change or view mode changes
  useEffect(() => {
    if (viewMode === 'carousel') {
      // For carousel, load all exercises
      loadAllExercises();
    } else {
      // For grid, load initial batch
      loadInitialExercises();
    }
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
    customExercises,
    viewMode
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

  // Load initial batch of exercises for grid view
  const loadInitialExercises = async () => {
    setLoading(true);
    setError(null);
    setExercises([]);
    setLoadedCount(0);
    setHasMore(true);
    
    try {
      const limit = 12;
      const response = await fetchExercises({
        ...filters,
        limit,
        offset: 0
      });

      setTotalExercises(response.total);
      const combined = [...response.exercises, ...customExercises];
      setExercises(combined);
      setLoadedCount(response.exercises.length);
      setHasMore(combined.length < response.total + customExercises.length);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError(`Failed to load exercises: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Load more exercises for infinite scroll (grid view only)
  const loadMoreExercises = useCallback(async () => {
    if (loadingMore || !hasMore || viewMode !== 'grid') return;
    
    setLoadingMore(true);
    
    try {
      const limit = 12;
      const currentLoadedCount = loadedCount;
      const response = await fetchExercises({
        ...filters,
        limit,
        offset: currentLoadedCount
      });

      setExercises(prev => [...prev, ...response.exercises]);
      setLoadedCount(prev => prev + response.exercises.length);
      const newCount = currentLoadedCount + response.exercises.length;
      setHasMore(newCount < totalExercises + customExercises.length);
    } catch (err) {
      console.error('Error loading more exercises:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, viewMode, loadedCount, filters, totalExercises, customExercises]);

  // Load all exercises for carousel view
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

  // Infinite scroll observer for grid view
  useEffect(() => {
    if (viewMode !== 'grid') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          loadMoreExercises();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, loadingMore, hasMore, viewMode, loadMoreExercises]);

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

  const handleExerciseDBAdded = () => {
    // Reload exercises to show newly added ones
    if (viewMode === 'carousel') {
      loadAllExercises();
    } else {
      loadInitialExercises();
    }
    loadCustomExercises();
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
          <h1 className="text-4xl font-bold text-primary">Exercises</h1>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-lg p-1 border border-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-secondary hover:bg-primary-50'
                }`}
                aria-label="Grid view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'carousel'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-secondary hover:bg-primary-50'
                }`}
                aria-label="Carousel view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setIsExerciseDBOpen(true)}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              + Add from ExerciseDB
            </button>
            <button
              onClick={() => setIsCreateCustomOpen(true)}
              className="px-5 py-2.5 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-all font-medium shadow-sm hover:shadow-md btn-glow"
            >
              + Create Custom Exercise
            </button>
          </div>
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
            {viewMode === 'grid' ? (
              <>
                <ExerciseGrid
                  exercises={filteredExercises}
                  onExerciseClick={handleExerciseClick}
                  onAddToWorkout={handleAddToWorkout}
                  onToggleFavorite={handleToggleFavorite}
                />
                <div ref={observerTarget} className="h-4" />
                {loadingMore && (
                  <div className="text-center py-4 animate-fade-in">
                    <p className="text-secondary">Loading more exercises...</p>
                  </div>
                )}
              </>
            ) : (
              <ExerciseCarousel
                exercises={filteredExercises}
                onExerciseClick={handleExerciseClick}
                onAddToWorkout={handleAddToWorkout}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
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

        <ExerciseDBModal
          isOpen={isExerciseDBOpen}
          onClose={() => setIsExerciseDBOpen(false)}
          onExerciseAdded={handleExerciseDBAdded}
        />
      </div>
    </div>
  );
}
