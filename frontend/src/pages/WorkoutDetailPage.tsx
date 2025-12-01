import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getWorkoutById, saveWorkout } from '../services/workoutStorage';
import { fetchExerciseById } from '../services/api';
import WorkoutExerciseRow from '../components/WorkoutExerciseRow';
import PrintSettingsPanel from '../components/PrintSettingsPanel';
import ExerciseBrowserModal from '../components/ExerciseBrowserModal';
import type { Workout, WorkoutExercise, Exercise, PrintConfig } from '../types';

const DEFAULT_PRINT_CONFIG: PrintConfig = {
  exercisesPerPage: 3,
  showImage: true,
  showName: true,
  showDescription: true,
  showInstructions: true,
  showCustomTips: true,
  showSetsReps: true,
  showWeight: true,
  showRest: true,
  condenseInstructions: false
};

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [isExerciseBrowserOpen, setIsExerciseBrowserOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      loadWorkout();
    } else {
      // Create new workout
      const newWorkout: Workout = {
        id: crypto.randomUUID(),
        name: 'New Workout',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        exercises: [],
        printConfig: DEFAULT_PRINT_CONFIG
      };
      setWorkout(newWorkout);
      // Auto-focus name input for new workouts
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 100);
    }
  }, [id]);

  useEffect(() => {
    if (workout) {
      loadExercises();
    }
  }, [workout]);

  const loadWorkout = () => {
    if (!id) return;
    const loaded = getWorkoutById(id);
    if (loaded) {
      setWorkout(loaded);
    } else {
      navigate('/workouts');
    }
  };

  const loadExercises = async () => {
    if (!workout) return;
    const exerciseMap = new Map<string, Exercise>();
    
    for (const workoutEx of workout.exercises) {
      if (!exerciseMap.has(workoutEx.exerciseId)) {
        try {
          const exercise = await fetchExerciseById(workoutEx.exerciseId);
          exerciseMap.set(workoutEx.exerciseId, exercise);
        } catch (err) {
          console.error('Failed to load exercise:', workoutEx.exerciseId);
        }
      }
    }
    
    setExercises(exerciseMap);
  };

  const saveWorkoutData = (updated: Workout) => {
    updated.updatedAt = new Date().toISOString();
    saveWorkout(updated);
    setWorkout(updated);
  };

  const handleWorkoutNameChange = (name: string) => {
    if (!workout) return;
    saveWorkoutData({ ...workout, name });
  };

  const handleWorkoutDescriptionChange = (description: string) => {
    if (!workout) return;
    saveWorkoutData({ ...workout, description });
  };

  const handleAddExercise = () => {
    setIsExerciseBrowserOpen(true);
  };

  const handleExerciseSelected = (exercise: Exercise) => {
    if (!workout) return;
    
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

    const updated = {
      ...workout,
      exercises: [...workout.exercises, newWorkoutExercise]
    };

    saveWorkoutData(updated);
    setExercises(new Map(exercises.set(exercise.id, exercise)));
  };

  const handleExerciseUpdate = (updatedEx: WorkoutExercise) => {
    if (!workout) return;
    const updated = {
      ...workout,
      exercises: workout.exercises.map(ex =>
        ex.id === updatedEx.id ? updatedEx : ex
      )
    };
    saveWorkoutData(updated);
  };

  const handleExerciseRemove = (exerciseId: string) => {
    if (!workout) return;
    const updated = {
      ...workout,
      exercises: workout.exercises.filter(ex => ex.id !== exerciseId)
    };
    saveWorkoutData(updated);
  };

  const handleExerciseMove = (exerciseId: string, direction: 'up' | 'down') => {
    if (!workout) return;

    const index = workout.exercises.findIndex(ex => ex.id === exerciseId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === workout.exercises.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newExercises = [...workout.exercises];
    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];

    newExercises.forEach((ex, idx) => {
      ex.order = idx;
    });

    const updated = {
      ...workout,
      exercises: newExercises
    };
    saveWorkoutData(updated);
  };

  const handlePrintConfigChange = (config: PrintConfig) => {
    if (!workout) return;
    saveWorkoutData({ ...workout, printConfig: config });
  };

  const handlePrintWorkout = () => {
    if (!workout) return;
    navigate(`/print/workout/${workout.id}`);
  };

  if (!workout) {
    return (
      <div className="min-h-screen page-enter flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  const activePrintConfig = workout.printConfig || DEFAULT_PRINT_CONFIG;

  return (
    <div className="min-h-screen page-enter">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/workouts" className="text-primary-600 hover:text-primary-700 hover:underline mb-4 inline-block font-medium transition-colors">
            ← Back to Workouts
          </Link>
          <input
            ref={nameInputRef}
            type="text"
            value={workout.name}
            onChange={(e) => handleWorkoutNameChange(e.target.value)}
            className="text-4xl font-bold text-primary bg-white border-2 border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg w-full shadow-sm"
            placeholder="Workout Name"
          />
          <textarea
            value={workout.description}
            onChange={(e) => handleWorkoutDescriptionChange(e.target.value)}
            placeholder="Add a description for this workout..."
            className="w-full mt-4 px-4 py-3 border border-border rounded-lg text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            rows={2}
          />
        </div>

        <div className="space-y-6">
          <PrintSettingsPanel
            config={activePrintConfig}
            onConfigChange={handlePrintConfigChange}
            onReset={() => handlePrintConfigChange(DEFAULT_PRINT_CONFIG)}
            canReset={!!workout.printConfig && JSON.stringify(workout.printConfig) !== JSON.stringify(DEFAULT_PRINT_CONFIG)}
          />

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-primary">Exercises</h3>
              <button
                onClick={handleAddExercise}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-sm hover:shadow-md"
              >
                + Add Exercise
              </button>
            </div>

            {workout.exercises.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-600 mb-2 text-lg">No exercises yet</p>
                <p className="text-slate-500 mb-6 text-sm">Click "Add Exercise" to start building your workout</p>
                <button
                  onClick={handleAddExercise}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  Add Your First Exercise
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {workout.exercises
                  .sort((a, b) => a.order - b.order)
                  .map((workoutEx, index) => {
                    const exercise = exercises.get(workoutEx.exerciseId);
                    return (
                      <WorkoutExerciseRow
                        key={workoutEx.id}
                        workoutExercise={workoutEx}
                        exercise={exercise || null}
                        onUpdate={(updated) => handleExerciseUpdate(updated)}
                        onRemove={() => handleExerciseRemove(workoutEx.id)}
                        onMoveUp={() => handleExerciseMove(workoutEx.id, 'up')}
                        onMoveDown={() => handleExerciseMove(workoutEx.id, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < workout.exercises.length - 1}
                      />
                    );
                  })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrintWorkout}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Print Workout
            </button>
          </div>
        </div>
      </div>

      <ExerciseBrowserModal
        isOpen={isExerciseBrowserOpen}
        onClose={() => setIsExerciseBrowserOpen(false)}
        onExerciseSelected={handleExerciseSelected}
      />
    </div>
  );
}
