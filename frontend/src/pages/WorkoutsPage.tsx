import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorkouts, deleteWorkout, duplicateWorkout } from '../services/workoutStorage';
import type { Workout } from '../types';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    setWorkouts(getWorkouts());
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Workouts</h1>
          <Link
            to="/workouts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + New Workout
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-slate-600 mb-4">No workouts yet. Create your first workout to get started!</p>
            <Link
              to="/workouts/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Workout
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map(workout => (
              <div key={workout.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{workout.name}</h3>
                {workout.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{workout.description}</p>
                )}
                <p className="text-slate-500 text-sm mb-4">
                  {workout.sessions.length} {workout.sessions.length === 1 ? 'session' : 'sessions'}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/workouts/${workout.id}`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center text-sm"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleDuplicate(workout)}
                    className="px-3 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-sm"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

