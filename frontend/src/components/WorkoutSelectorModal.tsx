import { useState } from 'react';
import { getWorkouts, saveWorkout } from '../services/workoutStorage';
import type { Workout, Exercise } from '../types';

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
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);

  if (!isOpen || !exercise) return null;

  const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);

  const handleAdd = () => {
    if (!exercise) return;

    let workout: Workout;
    let sessionId: string;

    if (showNewWorkout && newWorkoutName) {
      // Create new workout
      const newSessionId = crypto.randomUUID();
      workout = {
        id: crypto.randomUUID(),
        name: newWorkoutName,
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sessions: [{
          id: newSessionId,
          name: newSessionName || 'Session 1',
          notes: '',
          exercises: []
        }]
      };
      sessionId = newSessionId;
    } else if (selectedWorkoutId) {
      workout = { ...selectedWorkout! };
      
      if (showNewSession && newSessionName) {
        // Create new session in existing workout
        const newSessionId = crypto.randomUUID();
        workout.sessions.push({
          id: newSessionId,
          name: newSessionName,
          notes: '',
          exercises: []
        });
        sessionId = newSessionId;
      } else if (selectedSessionId) {
        sessionId = selectedSessionId;
      } else {
        alert('Please select or create a session');
        return;
      }
    } else {
      alert('Please select or create a workout');
      return;
    }

    // Add exercise to session
    const session = workout.sessions.find(s => s.id === sessionId);
    if (session) {
      session.exercises.push({
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        order: session.exercises.length,
        sets: null,
        reps: null,
        weight: null,
        tempo: null,
        rest: null,
        customTips: null
      });
      workout.updatedAt = new Date().toISOString();
      saveWorkout(workout);
      onExerciseAdded();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Add {exercise.name} to Workout
        </h2>

        <div className="space-y-4">
          {!showNewWorkout ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Workout
                </label>
                <select
                  value={selectedWorkoutId}
                  onChange={(e) => {
                    setSelectedWorkoutId(e.target.value);
                    setSelectedSessionId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Choose a workout...</option>
                  {workouts.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowNewWorkout(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Create New Workout
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="Enter workout name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Enter session name (e.g., Day 1)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <button
                onClick={() => {
                  setShowNewWorkout(false);
                  setNewWorkoutName('');
                  setNewSessionName('');
                }}
                className="text-sm text-slate-600 hover:underline"
              >
                ← Back to select workout
              </button>
            </>
          )}

          {selectedWorkout && !showNewWorkout && (
            <>
              {!showNewSession ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Select Session
                    </label>
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">Choose a session...</option>
                      {selectedWorkout.sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowNewSession(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Create New Session
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Session Name
                    </label>
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Enter session name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowNewSession(false);
                      setNewSessionName('');
                    }}
                    className="text-sm text-slate-600 hover:underline"
                  >
                    ← Back to select session
                  </button>
                </>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

