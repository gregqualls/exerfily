import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutById, getWorkouts } from '../services/workoutStorage';
import { fetchExerciseById } from '../services/api';
import type { Workout, Session, Exercise, PrintConfig } from '../types';

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

export default function PrintView() {
  const { type, id } = useParams<{ type: 'workout' | 'session'; id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, type]);

  const loadData = async () => {
    if (!id) return;

    if (type === 'workout') {
      const loadedWorkout = getWorkoutById(id);
      if (!loadedWorkout) {
        navigate('/workouts');
        return;
      }
      setWorkout(loadedWorkout);
      setSessions(loadedWorkout.sessions);
    } else {
      // Find workout containing this session
      const allWorkouts = getWorkouts();
      const foundWorkout = allWorkouts.find((w: Workout) =>
        w.sessions.some(s => s.id === id)
      );
      if (foundWorkout) {
        setWorkout(foundWorkout);
        const session = foundWorkout.sessions.find(s => s.id === id);
        if (session) {
          setSessions([session]);
        } else {
          navigate('/workouts');
          return;
        }
      } else {
        navigate('/workouts');
        return;
      }
    }

    // Load exercises
    const exerciseMap = new Map<string, Exercise>();
    const sessionsToLoad = type === 'workout' 
      ? (getWorkoutById(id)?.sessions || [])
      : sessions;

    for (const session of sessionsToLoad) {
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
    setLoading(false);
  };

  const getActivePrintConfig = (session: Session): PrintConfig => {
    if (!workout) return DEFAULT_PRINT_CONFIG;
    return session.printConfigOverride || workout.printConfig || DEFAULT_PRINT_CONFIG;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!workout || sessions.length === 0) {
    return <div className="p-8">No data found</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 print:hidden">
          <button
            onClick={() => navigate('/workouts')}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Workouts
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Print
          </button>
        </div>

        {sessions.map((session, sessionIndex) => {
          const config = getActivePrintConfig(session);
          const exercisesPerPage = config.exercisesPerPage;
          const gridCols = exercisesPerPage === 2 ? 'grid-cols-2' : exercisesPerPage === 3 ? 'grid-cols-3' : 'grid-cols-4';

          return (
            <div key={session.id} className={sessionIndex > 0 ? 'mt-12' : ''}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{session.name}</h2>
                {session.notes && (
                  <p className="text-slate-600 mt-2">{session.notes}</p>
                )}
              </div>

              {session.exercises.length === 0 ? (
                <p className="text-slate-600">No exercises in this session.</p>
              ) : (
                <div className={`grid ${gridCols} gap-6`}>
                  {session.exercises
                    .sort((a, b) => a.order - b.order)
                    .map((sessionEx) => {
                      const exercise = exercises.get(sessionEx.exerciseId);
                      if (!exercise) return null;

                      return (
                        <div
                          key={sessionEx.id}
                          className="border border-slate-300 rounded-lg p-4 break-inside-avoid page-break-inside-avoid"
                          style={{ pageBreakInside: 'avoid' }}
                        >
                          {config.showName && (
                            <h3 className="font-bold text-lg text-slate-900 mb-2">
                              {exercise.name}
                            </h3>
                          )}

                          {config.showImage && exercise.imageUrls.length > 0 && (
                            <img
                              src={exercise.imageUrls[0]}
                              alt={exercise.name}
                              className="w-full rounded mb-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}

                          {config.showDescription && exercise.description && (
                            <p className="text-sm text-slate-700 mb-2">
                              {exercise.description}
                            </p>
                          )}

                          {config.showInstructions && exercise.instructions.length > 0 && (
                            <div className="mb-2">
                              {config.condenseInstructions ? (
                                <p className="text-sm text-slate-700">
                                  {exercise.instructions[0]}
                                </p>
                              ) : (
                                <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                                  {exercise.instructions.map((instruction, idx) => (
                                    <li key={idx}>{instruction}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}

                          {(config.showSetsReps || config.showWeight || config.showRest) && (
                            <div className="text-sm text-slate-700 space-y-1 mb-2">
                              {config.showSetsReps && (
                                <p>
                                  {sessionEx.sets && <span>{sessionEx.sets} sets</span>}
                                  {sessionEx.sets && sessionEx.reps && <span> × </span>}
                                  {sessionEx.reps && <span>{sessionEx.reps} reps</span>}
                                </p>
                              )}
                              {config.showWeight && sessionEx.weight && (
                                <p>Weight: {sessionEx.weight}</p>
                              )}
                              {config.showRest && sessionEx.rest && (
                                <p>Rest: {sessionEx.rest}</p>
                              )}
                            </div>
                          )}

                          {config.showCustomTips && sessionEx.customTips && (
                            <p className="text-sm italic text-slate-600 mt-2 border-t border-slate-200 pt-2">
                              {sessionEx.customTips}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
          @page {
            margin: 1cm;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

