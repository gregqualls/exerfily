import { useState } from 'react';
import { getWorkouts, saveWorkout } from '../services/workoutStorage';
import type { Workout, Exercise, WorkoutExercise } from '../types';

interface WorkoutSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
  onExerciseAdded: () => void;
}

export default function WorkoutSelectorModal({
  isOpen,
  onClose,
  exercise,
  onExerciseAdded
}: WorkoutSelectorModalProps) {
  const [workouts] = useState<Workout[]>(getWorkouts());
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('');
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [showNewWorkout, setShowNewWorkout] = useState(false);

  if (!isOpen || !exercise) return null;

  const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);

  const handleAdd = () => {
    if (!exercise) return;

    let workout: Workout;

    if (showNewWorkout && newWorkoutName) {
      // Create new workout
      workout = {
        id: crypto.randomUUID(),
        name: newWorkoutName,
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        exercises: []
      };
    } else if (selectedWorkoutId && selectedWorkout) {
      workout = { ...selectedWorkout };
    } else {
      alert('Please select or create a workout');
      return;
    }

    // Add exercise to workout
    const newWorkoutExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      order: workout.exercises.length,
      sets: null,
      reps: null,
      weight: null,
      tempo: null,
      rest: null,
      customTips: null
    };

    workout.exercises.push(newWorkoutExercise);
    workout.updatedAt = new Date().toISOString();
    saveWorkout(workout);
    onExerciseAdded();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Add {exercise.name} to Workout
        </h2>

        <div className="space-y-4">
          {!showNewWorkout ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Select Workout
                </label>
                <select
                  value={selectedWorkoutId}
                  onChange={(e) => setSelectedWorkoutId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-primary transition-all"
                >
                  <option value="" className="text-secondary">Choose a workout...</option>
                  {workouts.map(w => (
                    <option key={w.id} value={w.id} className="text-primary">{w.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowNewWorkout(true)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                + Create New Workout
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="Enter workout name"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-primary transition-all"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setShowNewWorkout(false);
                  setNewWorkoutName('');
                }}
                className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors"
              >
                ← Back to select workout
              </button>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
