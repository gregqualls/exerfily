import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutById } from '../services/workoutStorage';
import { fetchExerciseById } from '../services/api';
import { getCustomExercises } from '../services/customExerciseStorage';
import { isGifUrl } from '../utils/gifUtils';
import GifFrameExtractor from '../components/GifFrameExtractor';
import type { Workout, Exercise, PrintConfig } from '../types';

const DEFAULT_PRINT_CONFIG: PrintConfig = {
  exercisesPerPage: 2, // Changed to 2 for horizontal layout
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const loadedWorkout = getWorkoutById(id);
        if (!loadedWorkout) {
          console.error('Workout not found:', id);
          navigate('/workouts');
          return;
        }

        console.log('Loaded workout:', loadedWorkout);
        console.log('Workout exercises:', loadedWorkout.exercises);
        console.log('Exercises length:', loadedWorkout.exercises?.length);

        setWorkout(loadedWorkout);

        // Load exercises in parallel with timeout protection
        const exerciseMap = new Map<string, Exercise>();

        // First, load custom exercises from localStorage
        const customExercises = getCustomExercises();
        console.log('Custom exercises loaded:', customExercises.length);
        customExercises.forEach(ex => {
          exerciseMap.set(ex.id, ex);
          console.log('Added custom exercise to map:', ex.id, ex.name);
        });

        if (loadedWorkout.exercises && Array.isArray(loadedWorkout.exercises) && loadedWorkout.exercises.length > 0) {
          console.log('Workout exercise IDs:', loadedWorkout.exercises.map(ex => ex.exerciseId));
          
          // Get unique exercise IDs (excluding custom exercises we already loaded)
          const uniqueExerciseIds = [...new Set(
            loadedWorkout.exercises
              .map(ex => ex.exerciseId)
              .filter((id): id is string => Boolean(id) && !exerciseMap.has(id))
          )];
          
          console.log('Unique exercise IDs to fetch (excluding already loaded):', uniqueExerciseIds);
          console.log('Exercise map before fetching:', Array.from(exerciseMap.keys()));
          
          if (uniqueExerciseIds.length > 0) {
            // Load all exercises in parallel with timeout protection
            const exercisePromises = uniqueExerciseIds.map(async (exerciseId) => {
              console.log(`Attempting to fetch exercise: ${exerciseId}`);
              try {
                // Add timeout to prevent hanging (5 second timeout)
                const timeoutPromise = new Promise<never>((_, reject) => 
                  setTimeout(() => reject(new Error(`Timeout loading exercise ${exerciseId}`)), 5000)
                );
                
                const exercise = await Promise.race([
                  fetchExerciseById(exerciseId),
                  timeoutPromise
                ]);
                
                console.log(`Successfully loaded exercise: ${exerciseId}`, exercise.name);
                return { id: exerciseId, exercise };
              } catch (err) {
                console.error(`Failed to load exercise: ${exerciseId}`, err);
                console.error('Error details:', err instanceof Error ? err.message : String(err));
                return null;
              }
            });

            const results = await Promise.all(exercisePromises);
            console.log('Fetch results:', results);
            results.forEach(result => {
              if (result && result.exercise) {
                exerciseMap.set(result.id, result.exercise);
                console.log(`Added to exercise map: ${result.id}`);
              } else {
                console.warn(`Result was null for an exercise`);
              }
            });
          } else {
            console.log('No unique exercise IDs to fetch - all already loaded or no valid IDs');
          }
        }

        setExercises(exerciseMap);
        console.log('Loaded exercises map:', exerciseMap);
        console.log('Exercise map size:', exerciseMap.size);
        console.log('Workout exercises:', loadedWorkout.exercises);
      } catch (err) {
        console.error('Error loading workout data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const getActivePrintConfig = (): PrintConfig => {
    if (!workout) return DEFAULT_PRINT_CONFIG;
    return workout.printConfig || DEFAULT_PRINT_CONFIG;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading print view...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Workout not found</p>
          <button
            onClick={() => navigate('/workouts')}
            className="px-4 py-2 bg-mermaid-aqua-600 text-white font-semibold rounded-lg hover:bg-mermaid-aqua-700 transition-colors shadow-md"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  if (!workout.exercises || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No exercises found in this workout</p>
          <p className="text-sm text-slate-500 mb-4">Add exercises to your workout to print it.</p>
          <button
            onClick={() => navigate(`/workouts/${workout.id}`)}
            className="px-4 py-2 bg-mermaid-aqua-600 text-white font-semibold rounded-lg hover:bg-mermaid-aqua-700 transition-colors shadow-md"
          >
            Back to Workout
          </button>
        </div>
      </div>
    );
  }

  const config = getActivePrintConfig();
  
  // Debug logging
  console.log('=== PRINT VIEW DEBUG ===');
  console.log('Workout exercises:', workout.exercises);
  console.log('Exercises map keys:', Array.from(exercises.keys()));
  console.log('Exercises map size:', exercises.size);
  console.log('Exercise map entries:', Array.from(exercises.entries()).map(([id, ex]) => ({ id, name: ex.name })));
  
  // Check each workout exercise
  workout.exercises.forEach(wex => {
    const found = exercises.has(wex.exerciseId);
    console.log(`Workout exercise ID: ${wex.exerciseId}, Found in map: ${found}`);
    if (!found) {
      console.log(`  - Looking for: "${wex.exerciseId}"`);
      console.log(`  - Available IDs:`, Array.from(exercises.keys()));
      // Check for partial matches
      const partialMatch = Array.from(exercises.keys()).find(key => 
        key.includes(wex.exerciseId) || wex.exerciseId.includes(key)
      );
      if (partialMatch) {
        console.log(`  - Found partial match: ${partialMatch}`);
      }
    }
  });
  
  const sortedExercises = workout.exercises
    .sort((a, b) => a.order - b.order)
    .map(workoutEx => {
      const exercise = exercises.get(workoutEx.exerciseId);
      if (!exercise) {
        console.warn(`Exercise not found for ID: ${workoutEx.exerciseId}`);
        // Try to find by partial match as fallback
        const partialMatch = Array.from(exercises.entries()).find(([id]) => 
          id.includes(workoutEx.exerciseId) || workoutEx.exerciseId.includes(id)
        );
        if (partialMatch) {
          console.log(`Found partial match for ${workoutEx.exerciseId}: ${partialMatch[0]}`);
          return { workoutEx, exercise: partialMatch[1] };
        }
      }
      return exercise ? { workoutEx, exercise } : null;
    })
    .filter((item): item is { workoutEx: typeof workout.exercises[0]; exercise: Exercise } => item !== null);
  
  console.log('Sorted exercises after filtering:', sortedExercises.length);
  console.log('=== END DEBUG ===');

  // Group exercises into pages (2 per page)
  const exercisesPerPage = 2;
  const pages: Array<Array<{ workoutEx: typeof workout.exercises[0]; exercise: Exercise }>> = [];
  for (let i = 0; i < sortedExercises.length; i += exercisesPerPage) {
    pages.push(sortedExercises.slice(i, i + exercisesPerPage));
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 print:hidden">
          <button
            onClick={() => navigate('/workouts')}
            className="text-mermaid-aqua-600 hover:text-mermaid-aqua-700 hover:underline mb-4 inline-block transition-colors font-semibold"
          >
            ← Back to Workouts
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-mermaid-aqua-600 text-white font-semibold rounded-lg hover:bg-mermaid-aqua-700 transition-colors shadow-md hover:shadow-lg"
          >
            Print
          </button>
        </div>

        <div className="mb-4 print:mb-2">
          <h1 className="text-3xl font-bold text-slate-900">{workout.name}</h1>
          {workout.description && (
            <p className="text-slate-600 mt-2 print:text-sm">{workout.description}</p>
          )}
        </div>

        {sortedExercises.length === 0 && workout.exercises && workout.exercises.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-2">Exercises found but could not be loaded.</p>
            <p className="text-sm text-slate-500">Please check the console for details.</p>
            <p className="text-xs text-slate-400 mt-2">
              Workout has {workout.exercises.length} exercise(s), but {exercises.size} were loaded.
            </p>
          </div>
        ) : sortedExercises.length === 0 ? (
          <p className="text-slate-600">No exercises in this workout.</p>
        ) : (
          <div className="print-exercises">
            {pages.map((pageExercises, pageIndex) => (
              <div
                key={pageIndex}
                className="print-page grid grid-cols-2 gap-6 mb-8 print:mb-0 print:gap-4"
              >
                {pageExercises.map(({ workoutEx, exercise }) => (
                  <div
                    key={workoutEx.id}
                    className="border border-slate-300 rounded-lg p-4 print:p-3 flex flex-col h-full"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    {/* Name on top */}
                    {config.showName && (
                      <h3 className="font-bold text-2xl text-slate-900 mb-3 print:text-xl print:mb-2">
                        {exercise.name}
                      </h3>
                    )}

                    {/* Image below name */}
                    {config.showImage && exercise.imageUrls.length > 0 && (
                      <div className="mb-3 print:mb-2 flex-shrink-0">
                        {(() => {
                          const imageUrl = exercise.imageUrls[0];
                          const isGif = isGifUrl(imageUrl);
                          console.log(`Exercise ${exercise.name} image URL: ${imageUrl}, isGif: ${isGif}`);
                          
                          if (isGif) {
                            // For GIFs, show two frames side-by-side (start and end positions)
                            return (
                              <div className="grid grid-cols-2 gap-1">
                                <div className="flex flex-col">
                                  <GifFrameExtractor
                                    gifUrl={imageUrl}
                                    alt={`${exercise.name} - Start position`}
                                    frameIndex={0}
                                    className="w-full rounded print:rounded-sm object-cover"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                  />
                                  <span className="text-xs text-slate-500 text-center mt-1 print:text-[10px]">Start</span>
                                </div>
                                <div className="flex flex-col">
                                  <GifFrameExtractor
                                    gifUrl={imageUrl}
                                    alt={`${exercise.name} - End position`}
                                    frameIndex={1}
                                    className="w-full rounded print:rounded-sm object-cover"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                  />
                                  <span className="text-xs text-slate-500 text-center mt-1 print:text-[10px]">End</span>
                                </div>
                              </div>
                            );
                          } else {
                            // For regular images, show single image
                            return (
                              <img
                                src={imageUrl}
                                alt={exercise.name}
                                className="w-full rounded print:rounded-sm object-cover"
                                style={{ maxHeight: '200px', objectFit: 'contain' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            );
                          }
                        })()}
                      </div>
                    )}

                    {/* Content below image */}
                    <div className="flex-1 flex flex-col">

                      {/* Sets/Reps/Weight/Rest at top if shown */}
                      {(config.showSetsReps || config.showWeight || config.showRest) && (
                        <div className="text-sm text-slate-700 space-y-1 mb-2 print:text-xs print:mb-1 print:space-y-0.5">
                          {config.showSetsReps && (
                            <p className="font-medium">
                              {workoutEx.sets && <span>{workoutEx.sets} sets</span>}
                              {workoutEx.sets && workoutEx.reps && <span> × </span>}
                              {workoutEx.reps && <span>{workoutEx.reps} reps</span>}
                            </p>
                          )}
                          {config.showWeight && workoutEx.weight && (
                            <p>Weight: {workoutEx.weight}</p>
                          )}
                          {config.showRest && workoutEx.rest && (
                            <p>Rest: {workoutEx.rest}</p>
                          )}
                        </div>
                      )}

                      {config.showDescription && exercise.description && (
                        <p className="text-sm text-slate-700 mb-2 print:text-xs print:mb-1">
                          {exercise.description}
                        </p>
                      )}

                      {config.showInstructions && exercise.instructions.length > 0 && (
                        <div className="mb-2 print:mb-1">
                          {config.condenseInstructions ? (
                            <p className="text-sm text-slate-700 print:text-xs">
                              {exercise.instructions[0]}
                            </p>
                          ) : (
                            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1 print:text-xs print:space-y-0.5">
                              {exercise.instructions.map((instruction, idx) => (
                                <li key={idx}>{instruction}</li>
                              ))}
                            </ol>
                          )}
                        </div>
                      )}

                      {config.showCustomTips && workoutEx.customTips && (
                        <p className="text-sm italic text-slate-600 mt-auto pt-2 border-t border-slate-200 print:text-xs print:pt-1">
                          {workoutEx.customTips}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {/* Fill empty slot if odd number of exercises on last page */}
                {pageExercises.length === 1 && (
                  <div className="border border-transparent"></div>
                )}
              </div>
            ))}
          </div>
        )}
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
            size: landscape;
          }
          .print-page {
            page-break-after: always;
            min-height: calc(100vh - 2cm);
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1cm;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .print-exercises > .print-page > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          /* Ensure images don't break across pages */
          img {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
