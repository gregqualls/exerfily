import type { Exercise } from '../types';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWorkout: (exercise: Exercise) => void;
}

export default function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
  onAddToWorkout
}: ExerciseDetailModalProps) {
  if (!isOpen || !exercise) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">{exercise.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {exercise.imageUrls.length > 0 && (
            <img
              src={exercise.imageUrls[0]}
              alt={exercise.name}
              className="w-full rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-700">Body Area:</span>
              <p className="text-slate-900">{exercise.bodyArea}</p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Category:</span>
              <p className="text-slate-900">{exercise.category}</p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Level:</span>
              <p className="text-slate-900 capitalize">{exercise.level}</p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Equipment:</span>
              <p className="text-slate-900">{exercise.equipment.join(', ')}</p>
            </div>
          </div>

          <div>
            <span className="font-medium text-slate-700">Primary Muscles:</span>
            <p className="text-slate-900">{exercise.primaryMuscles.join(', ')}</p>
          </div>

          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <span className="font-medium text-slate-700">Secondary Muscles:</span>
              <p className="text-slate-900">{exercise.secondaryMuscles.join(', ')}</p>
            </div>
          )}

          {exercise.description && (
            <div>
              <span className="font-medium text-slate-700">Description:</span>
              <p className="text-slate-900 mt-1">{exercise.description}</p>
            </div>
          )}

          {exercise.instructions.length > 0 && (
            <div>
              <span className="font-medium text-slate-700">Instructions:</span>
              <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-900">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                onAddToWorkout(exercise);
                onClose();
              }}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
            >
              Add to Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

