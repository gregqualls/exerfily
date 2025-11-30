import { useState, useEffect, useMemo } from 'react';
import { fetchExercises, fetchExerciseById } from '../services/api';
import FilterBar from '../components/FilterBar';
import ExerciseGrid from '../components/ExerciseGrid';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import WorkoutSelectorModal from '../components/WorkoutSelectorModal';
import type { Exercise, ExerciseFilters } from '../types';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseFilters>({ limit: 50 });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [isWorkoutSelectorOpen, setIsWorkoutSelectorOpen] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [filters]);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchExercises(filters);
      setExercises(response.exercises);
    } catch (err) {
      setError('Failed to load exercises. Please try again.');
      console.error(err);
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

  const availableBodyAreas = useMemo(() => {
    const areas = new Set<string>();
    exercises.forEach(ex => {
      if (ex.bodyArea) areas.add(ex.bodyArea);
    });
    return Array.from(areas).sort();
  }, [exercises]);

  const availableMuscles = useMemo(() => {
    const muscles = new Set<string>();
    exercises.forEach(ex => {
      ex.primaryMuscles.forEach(m => muscles.add(m));
    });
    return Array.from(muscles).sort();
  }, [exercises]);

  const availableEquipment = useMemo(() => {
    const equipment = new Set<string>();
    exercises.forEach(ex => {
      ex.equipment.forEach(eq => equipment.add(eq));
    });
    return Array.from(equipment).sort();
  }, [exercises]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Exercises</h1>

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          availableBodyAreas={availableBodyAreas}
          availableMuscles={availableMuscles}
          availableEquipment={availableEquipment}
        />

        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading exercises...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-6">
            <ExerciseGrid
              exercises={exercises}
              onExerciseClick={handleExerciseClick}
              onAddToWorkout={handleAddToWorkout}
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

