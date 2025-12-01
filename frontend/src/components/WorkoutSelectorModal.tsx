import { useState } from 'react';
import { getWorkouts, saveWorkout } from '../services/workoutStorage';
import { useTheme } from '../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const [workouts] = useState<Workout[]>(getWorkouts());
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('');
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  
  // Determine text colors based on theme
  const titleColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const selectTextColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const placeholderColor = theme === 'dark' ? '#94a3b8' : '#64748b';

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
        className="bg-white/95 dark:bg-midnight-800/95 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl border border-mermaid-aqua-200 dark:border-midnight-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: titleColor }}>
          Add {exercise.name} to Workout
        </h2>

        <div className="space-y-4">
          {!showNewWorkout ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
                  Select Workout
                </label>
                <select
                  value={selectedWorkoutId}
                  onChange={(e) => setSelectedWorkoutId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 transition-all"
                  style={{ color: selectTextColor }}
                >
                  <option value="" style={{ color: placeholderColor }}>Choose a workout...</option>
                  {workouts.map(w => (
                    <option key={w.id} value={w.id} style={{ color: selectTextColor }}>{w.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowNewWorkout(true)}
                className="text-sm font-medium text-mermaid-aqua-600 dark:text-mermaid-aqua-400 hover:text-mermaid-aqua-700 dark:hover:text-mermaid-aqua-300 hover:underline transition-colors"
              >
                + Create New Workout
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="Enter workout name"
                  className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setShowNewWorkout(false);
                  setNewWorkoutName('');
                }}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline transition-colors"
              >
                ← Back to select workout
              </button>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-mermaid-aqua-200 dark:border-midnight-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-midnight-600 dark:bg-midnight-700 text-white dark:text-silver-100 rounded-lg hover:bg-midnight-500 dark:hover:bg-midnight-600 transition-colors font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2.5 bg-mermaid-aqua-600 dark:bg-mermaid-aqua-500 text-white rounded-lg hover:bg-mermaid-aqua-700 dark:hover:bg-mermaid-aqua-600 transition-all font-medium shadow-sm hover:shadow-md"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
