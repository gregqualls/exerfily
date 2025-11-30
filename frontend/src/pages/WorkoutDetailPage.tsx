import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getWorkoutById, saveWorkout } from '../services/workoutStorage';
import { fetchExerciseById } from '../services/api';
import SessionExerciseRow from '../components/SessionExerciseRow';
import PrintSettingsPanel from '../components/PrintSettingsPanel';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import WorkoutSelectorModal from '../components/WorkoutSelectorModal';
import type { Workout, Session, SessionExercise, Exercise, PrintConfig } from '../types';

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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isWorkoutSelectorOpen, setIsWorkoutSelectorOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);

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
        sessions: [],
        printConfig: DEFAULT_PRINT_CONFIG
      };
      setWorkout(newWorkout);
    }
  }, [id]);

  useEffect(() => {
    if (workout) {
      loadExercises();
      if (workout.sessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(workout.sessions[0].id);
      }
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
    
    for (const session of workout.sessions) {
      for (const sessionEx of session.exercises) {
        if (!exerciseMap.has(sessionEx.exerciseId)) {
          try {
            const exercise = await fetchExerciseById(sessionEx.exerciseId);
            exerciseMap.set(sessionEx.exerciseId, exercise);
          } catch (err) {
            console.error('Failed to load exercise:', sessionEx.exerciseId);
          }
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

  const handleAddSession = () => {
    if (!workout) return;
    const newSession: Session = {
      id: crypto.randomUUID(),
      name: `Session ${workout.sessions.length + 1}`,
      notes: '',
      exercises: []
    };
    saveWorkoutData({
      ...workout,
      sessions: [...workout.sessions, newSession]
    });
    setSelectedSessionId(newSession.id);
  };

  const handleSessionNameChange = (sessionId: string, name: string) => {
    if (!workout) return;
    const updated = {
      ...workout,
      sessions: workout.sessions.map(s =>
        s.id === sessionId ? { ...s, name } : s
      )
    };
    saveWorkoutData(updated);
  };

  const handleSessionNotesChange = (sessionId: string, notes: string) => {
    if (!workout) return;
    const updated = {
      ...workout,
      sessions: workout.sessions.map(s =>
        s.id === sessionId ? { ...s, notes } : s
      )
    };
    saveWorkoutData(updated);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!workout) return;
    if (confirm('Are you sure you want to delete this session?')) {
      const updated = {
        ...workout,
        sessions: workout.sessions.filter(s => s.id !== sessionId)
      };
      saveWorkoutData(updated);
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(updated.sessions[0]?.id || null);
      }
    }
  };

  const handleAddExercise = () => {
    setIsWorkoutSelectorOpen(true);
  };

  const handleExerciseSelected = (exercise: Exercise) => {
    setExerciseToAdd(exercise);
    setIsWorkoutSelectorOpen(true);
  };

  const handleExerciseAdded = (exercise: Exercise) => {
    if (!workout || !selectedSessionId) return;
    
    const session = workout.sessions.find(s => s.id === selectedSessionId);
    if (!session) return;

    const newSessionExercise: SessionExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      order: session.exercises.length,
      sets: null,
      reps: null,
      weight: null,
      tempo: null,
      rest: null,
      customTips: null
    };

    const updated = {
      ...workout,
      sessions: workout.sessions.map(s =>
        s.id === selectedSessionId
          ? { ...s, exercises: [...s.exercises, newSessionExercise] }
          : s
      )
    };

    saveWorkoutData(updated);
    setExercises(new Map(exercises.set(exercise.id, exercise)));
  };

  const handleExerciseUpdate = (sessionId: string, updatedEx: SessionExercise) => {
    if (!workout) return;
    const updated = {
      ...workout,
      sessions: workout.sessions.map(s =>
        s.id === sessionId
          ? {
              ...s,
              exercises: s.exercises.map(ex =>
                ex.id === updatedEx.id ? updatedEx : ex
              )
            }
          : s
      )
    };
    saveWorkoutData(updated);
  };

  const handleExerciseRemove = (sessionId: string, exerciseId: string) => {
    if (!workout) return;
    const updated = {
      ...workout,
      sessions: workout.sessions.map(s =>
        s.id === sessionId
          ? { ...s, exercises: s.exercises.filter(ex => ex.id !== exerciseId) }
          : s
      )
    };
    saveWorkoutData(updated);
  };

  const handleExerciseMove = (sessionId: string, exerciseId: string, direction: 'up' | 'down') => {
    if (!workout) return;
    const session = workout.sessions.find(s => s.id === sessionId);
    if (!session) return;

    const index = session.exercises.findIndex(ex => ex.id === exerciseId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === session.exercises.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newExercises = [...session.exercises];
    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];

    newExercises.forEach((ex, idx) => {
      ex.order = idx;
    });

    const updated = {
      ...workout,
      sessions: workout.sessions.map(s =>
        s.id === sessionId ? { ...s, exercises: newExercises } : s
      )
    };
    saveWorkoutData(updated);
  };

  const handlePrintConfigChange = (sessionId: string | null, config: PrintConfig) => {
    if (!workout) return;
    if (sessionId) {
      const updated = {
        ...workout,
        sessions: workout.sessions.map(s =>
          s.id === sessionId ? { ...s, printConfigOverride: config } : s
        )
      };
      saveWorkoutData(updated);
    } else {
      saveWorkoutData({ ...workout, printConfig: config });
    }
  };

  const getActivePrintConfig = (session: Session | null): PrintConfig => {
    if (!workout) return DEFAULT_PRINT_CONFIG;
    return session?.printConfigOverride || workout.printConfig || DEFAULT_PRINT_CONFIG;
  };

  const handlePrintSession = () => {
    if (!selectedSessionId) return;
    navigate(`/print/session/${selectedSessionId}`);
  };

  const handlePrintWorkout = () => {
    if (!workout) return;
    navigate(`/print/workout/${workout.id}`);
  };

  if (!workout) {
    return <div className="p-8">Loading...</div>;
  }

  const selectedSession = workout.sessions.find(s => s.id === selectedSessionId);
  const activePrintConfig = getActivePrintConfig(selectedSession || null);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/workouts" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Workouts
          </Link>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => handleWorkoutNameChange(e.target.value)}
            className="text-3xl font-bold text-slate-900 bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-2"
          />
          <textarea
            value={workout.description}
            onChange={(e) => handleWorkoutDescriptionChange(e.target.value)}
            placeholder="Workout description..."
            className="w-full mt-2 px-2 py-1 border border-slate-300 rounded text-slate-600"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Sessions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-slate-900">Sessions</h2>
                <button
                  onClick={handleAddSession}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {workout.sessions.map(session => (
                  <div
                    key={session.id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedSessionId === session.id
                        ? 'bg-blue-100 border-2 border-blue-600'
                        : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                    }`}
                    onClick={() => setSelectedSessionId(session.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={session.name}
                          onChange={(e) => handleSessionNameChange(session.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-slate-900 bg-transparent border-none p-0 focus:outline-none focus:ring-1 focus:ring-blue-600 rounded px-1 w-full"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          {session.exercises.length} exercises
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel - Session details */}
          <div className="lg:col-span-3">
            {selectedSession ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <input
                    type="text"
                    value={selectedSession.name}
                    onChange={(e) => handleSessionNameChange(selectedSession.id, e.target.value)}
                    className="text-xl font-semibold text-slate-900 bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-2 mb-2 w-full"
                  />
                  <textarea
                    value={selectedSession.notes}
                    onChange={(e) => handleSessionNotesChange(selectedSession.id, e.target.value)}
                    placeholder="Session notes..."
                    className="w-full px-2 py-1 border border-slate-300 rounded text-slate-600 text-sm"
                    rows={2}
                  />
                </div>

                <PrintSettingsPanel
                  config={activePrintConfig}
                  onConfigChange={(config) => handlePrintConfigChange(selectedSessionId, config)}
                  onReset={() => handlePrintConfigChange(selectedSessionId, workout.printConfig || DEFAULT_PRINT_CONFIG)}
                  canReset={!!selectedSession.printConfigOverride}
                />

                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900">Exercises</h3>
                    <button
                      onClick={handleAddExercise}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 text-sm"
                    >
                      + Add Exercise
                    </button>
                  </div>

                  {selectedSession.exercises.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">
                      No exercises yet. Click "Add Exercise" to get started.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedSession.exercises
                        .sort((a, b) => a.order - b.order)
                        .map((sessionEx, index) => {
                          const exercise = exercises.get(sessionEx.exerciseId);
                          return (
                            <SessionExerciseRow
                              key={sessionEx.id}
                              sessionExercise={sessionEx}
                              exercise={exercise || null}
                              onUpdate={(updated) => handleExerciseUpdate(selectedSession.id, updated)}
                              onRemove={() => handleExerciseRemove(selectedSession.id, sessionEx.id)}
                              onMoveUp={() => handleExerciseMove(selectedSession.id, sessionEx.id, 'up')}
                              onMoveDown={() => handleExerciseMove(selectedSession.id, sessionEx.id, 'down')}
                              canMoveUp={index > 0}
                              canMoveDown={index < selectedSession.exercises.length - 1}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrintSession}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Print Session
                  </button>
                  <button
                    onClick={handlePrintWorkout}
                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
                  >
                    Print Workout
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-slate-600 mb-4">No session selected. Create a session to get started.</p>
                <button
                  onClick={handleAddSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <WorkoutSelectorModal
        isOpen={isWorkoutSelectorOpen}
        onClose={() => {
          setIsWorkoutSelectorOpen(false);
          setExerciseToAdd(null);
        }}
        exercise={exerciseToAdd}
        onExerciseAdded={() => {
          if (exerciseToAdd) {
            handleExerciseAdded(exerciseToAdd);
          }
        }}
      />
    </div>
  );
}

