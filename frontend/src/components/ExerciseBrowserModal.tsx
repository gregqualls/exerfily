import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchExercises, fetchBodyParts, fetchTargets, fetchEquipments, fetchExerciseById } from '../services/api';
import FilterBar from './FilterBar';
import ExerciseGrid from './ExerciseGrid';
import ExerciseDetailModal from './ExerciseDetailModal';
import { getAvailableEquipment } from '../services/equipmentStorage';
import { getCustomExercises } from '../services/customExerciseStorage';
import { getFavoriteExerciseIds } from '../services/favoritesStorage';
import type { Exercise, ExerciseFilters } from '../types';

interface ExerciseBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseSelected: (exercise: Exercise) => void;
}

export default function ExerciseBrowserModal({
  isOpen,
  onClose,
  onExerciseSelected
}: ExerciseBrowserModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'favorites'>('browse');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseFilters>({ limit: 100 });
  const [, setTotalExercises] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Filter options
  const [availableBodyParts, setAvailableBodyParts] = useState<string[]>([]);
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFilterOptions();
      if (activeTab === 'browse') {
        loadAllExercises();
      } else {
        loadFavoriteExercises();
      }
    } else {
      // Reset when closed
      setExercises([]);
      setFavoriteExercises([]);
      setFilters({ limit: 100 });
      setError(null);
      setActiveTab('browse');
    }
  }, [isOpen, activeTab]);

  // Load all exercises when filters change (only for browse tab)
  useEffect(() => {
    if (isOpen && activeTab === 'browse') {
      loadAllExercises();
    }
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
    activeTab
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

  const loadFavoriteExercises = async () => {
    setLoadingFavorites(true);
    setError(null);
    setFavoriteExercises([]);
    
    try {
      const favoriteIds = getFavoriteExerciseIds();
      
      if (favoriteIds.length === 0) {
        setFavoriteExercises([]);
        setLoadingFavorites(false);
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
      
      // Also include custom exercises that are favorited
      const customExercises = getCustomExercises();
      const favoriteCustomExercises = customExercises.filter(ex => favoriteIds.includes(ex.id));
      
      setFavoriteExercises([...validExercises, ...favoriteCustomExercises]);
    } catch (err) {
      console.error('Error loading favorite exercises:', err);
      setError(`Failed to load favorites: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadAllExercises = async () => {
    setLoading(true);
    setError(null);
    setExercises([]);
    setHasMore(true);
    
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
          setHasMore(false);
        } else {
          offset += limit;
        }
      }

      // Combine database exercises with custom exercises
      const customExercises = getCustomExercises();
      const combined = [...allExercises, ...customExercises];
      setExercises(combined);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError(`Failed to load exercises: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          // Already loading all, so this is just for future pagination if needed
        }
      },
      { threshold: 1.0 }
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
  }, [hasMore, loading]);

  // Apply equipment filtering
  const filteredExercises = useCallback(() => {
    if (!filters.equipmentFilterEnabled || filters.equipmentFilterMode === 'off') {
      return exercises;
    }

    const availableEquipmentList = getAvailableEquipment();
    if (availableEquipmentList.length === 0) {
      return exercises;
    }

    return exercises.filter(exercise => {
      if (filters.equipmentFilterMode === 'all') {
        return exercise.equipment.every(eq => availableEquipmentList.includes(eq));
      } else {
        return exercise.equipment.some(eq => availableEquipmentList.includes(eq));
      }
    });
  }, [exercises, filters.equipmentFilterEnabled, filters.equipmentFilterMode]);

  const handleExerciseClick = async (exercise: Exercise) => {
    // Custom exercises are already loaded, database exercises need fetching
    if (exercise.id.startsWith('custom_')) {
      setSelectedExercise(exercise);
      setIsDetailModalOpen(true);
    } else {
      try {
        const fullExercise = await fetchExerciseById(exercise.id);
        setSelectedExercise(fullExercise);
        setIsDetailModalOpen(true);
      } catch (err) {
        console.error('Failed to load exercise details:', err);
        setSelectedExercise(exercise);
        setIsDetailModalOpen(true);
      }
    }
  };

  const handleAddToWorkout = (exercise: Exercise) => {
    onExerciseSelected(exercise);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
        className="bg-white/95 backdrop-blur-md rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-border p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">Select Exercise</h2>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary-600 text-2xl transition-colors"
            >
                ×
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-border">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
                  activeTab === 'browse'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary hover:text-primary-600'
                }`}
              >
                Browse All
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
                  activeTab === 'favorites'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary hover:text-primary-600'
                }`}
              >
                Favorites ({getFavoriteExerciseIds().length})
              </button>
            </div>
            
            {/* Filters - only show for browse tab */}
            {activeTab === 'browse' && (
              <FilterBar
                filters={filters}
                onFiltersChange={setFilters}
                availableBodyParts={availableBodyParts}
                availableMuscles={availableMuscles}
                availableEquipment={availableEquipment}
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'browse' ? (
              <>
                {loading && (
                  <div className="text-center py-12">
                    <p className="text-secondary">Loading exercises...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {!loading && !error && (
                  <ExerciseGrid
                    exercises={filteredExercises()}
                    onExerciseClick={handleExerciseClick}
                    onAddToWorkout={handleAddToWorkout}
                  />
                )}

                <div ref={observerTarget} className="h-4" />
              </>
            ) : (
              <>
                {loadingFavorites && (
                  <div className="text-center py-12">
                    <p className="text-secondary">Loading favorites...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {!loadingFavorites && !error && favoriteExercises.length === 0 && (
                  <div className="text-center py-12">
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

                {!loadingFavorites && !error && favoriteExercises.length > 0 && (
                  <ExerciseGrid
                    exercises={favoriteExercises}
                    onExerciseClick={handleExerciseClick}
                    onAddToWorkout={handleAddToWorkout}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToWorkout={handleAddToWorkout}
      />
    </>
  );
}

