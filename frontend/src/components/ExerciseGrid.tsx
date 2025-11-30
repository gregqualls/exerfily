import type { Exercise } from '../types';

interface ExerciseGridProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
  onAddToWorkout: (exercise: Exercise) => void;
}

export default function ExerciseGrid({
  exercises,
  onExerciseClick,
  onAddToWorkout
}: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 text-slate-600">
        <p>No exercises found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {exercises.map(exercise => (
        <div
          key={exercise.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
        >
          {exercise.imageUrls.length > 0 && (
            <img
              src={exercise.imageUrls[0]}
              alt={exercise.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2">{exercise.name}</h3>
            <div className="space-y-1 text-sm text-slate-600 mb-3">
              <p><span className="font-medium">Body Area:</span> {exercise.bodyArea}</p>
              <p><span className="font-medium">Muscles:</span> {exercise.primaryMuscles.join(', ')}</p>
              <p><span className="font-medium">Equipment:</span> {exercise.equipment.join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExerciseClick(exercise);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWorkout(exercise);
                }}
                className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

