import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkouts, deleteWorkout, duplicateWorkout, saveWorkout } from '../services/workoutStorage';
import type { Workout } from '../types';

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    setWorkouts(getWorkouts());
  };

  const handleCreateWorkout = () => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      name: 'New Workout',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exercises: []
    };
    saveWorkout(newWorkout);
    navigate(`/workouts/${newWorkout.id}`);
  };

  const handleDelete = (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      deleteWorkout(workoutId);
      loadWorkouts();
    }
  };

  const handleDuplicate = (workout: Workout) => {
    duplicateWorkout(workout);
    loadWorkouts();
  };

  const handlePrint = (workoutId: string) => {
    navigate(`/print/workout/${workoutId}`);
  };

  return (
    <div className="min-h-screen page-enter">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-mermaid-teal-900 mb-2">Workouts</h1>
            <p className="text-mermaid-teal-600">Create and manage your workout routines</p>
          </div>
          <button
            onClick={handleCreateWorkout}
            className="px-6 py-3 bg-mermaid-purple-500 text-white rounded-lg hover:bg-mermaid-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
          >
            + Create Workout
          </button>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-mermaid-aqua-200 p-16 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-20 w-20 text-mermaid-aqua-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-mermaid-teal-900 mb-3">No workouts yet</h2>
            <p className="text-mermaid-teal-600 mb-8 text-lg">Create your first workout to get started!</p>
            <button
              onClick={handleCreateWorkout}
              className="px-8 py-4 bg-mermaid-purple-500 text-white rounded-lg hover:bg-mermaid-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
            >
              Create Your First Workout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map(workout => (
              <div key={workout.id} className="bg-white/70 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transition-all border border-mermaid-aqua-200 overflow-hidden group">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-mermaid-teal-900 mb-2 group-hover:text-mermaid-aqua-600 transition-colors">
                    {workout.name}
                  </h3>
                  {workout.description && (
                    <p className="text-mermaid-teal-600 text-sm mb-4 line-clamp-2">{workout.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/workouts/${workout.id}`)}
                      className="flex-1 px-4 py-2.5 bg-mermaid-aqua-600 text-white rounded-lg hover:bg-mermaid-aqua-700 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handlePrint(workout.id)}
                      className="px-4 py-2.5 bg-mermaid-purple-500 text-white rounded-lg hover:bg-mermaid-purple-600 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                      title="Print workout"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDuplicate(workout)}
                      className="px-4 py-2.5 bg-mermaid-teal-600 text-white rounded-lg hover:bg-mermaid-teal-700 transition-all text-sm font-medium shadow-sm"
                      title="Duplicate workout"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                      title="Delete workout"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
