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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">{exercise.name}</h2>
          <button
            onClick={onClose}
            className="text-primary hover:text-primary-600 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {exercise.imageUrls.length > 0 && (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={exercise.imageUrls[0]}
                alt={exercise.name}
                className="w-full rounded-lg transition-all duration-500 filter grayscale-[0.7] brightness-[0.85] contrast-110 saturate-50 hue-rotate-[180deg] hover:grayscale-0 hover:brightness-100 hover:contrast-100 hover:saturate-100 hover:hue-rotate-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 opacity-60 hover:opacity-0 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-primary">Body Part:</span>
              <p className="text-primary capitalize">{exercise.bodyPart}</p>
            </div>
            <div>
              <span className="font-medium text-primary">Category:</span>
              <p className="text-primary">{exercise.category}</p>
            </div>
            <div>
              <span className="font-medium text-primary">Level:</span>
              <p className="text-primary capitalize">{exercise.level}</p>
            </div>
            <div>
              <span className="font-medium text-primary">Exercise Type:</span>
              <p className="text-primary">{exercise.exerciseType || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-primary">Equipment:</span>
              <p className="text-primary">{exercise.equipment.join(', ')}</p>
            </div>
          </div>

          <div>
            <span className="font-medium text-primary">Primary Muscles:</span>
            <p className="text-primary">{exercise.primaryMuscles.join(', ')}</p>
          </div>

          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <span className="font-medium text-primary">Secondary Muscles:</span>
              <p className="text-primary">{exercise.secondaryMuscles.join(', ')}</p>
            </div>
          )}

          {exercise.overview && (
            <div>
              <span className="font-medium text-primary">Overview:</span>
              <p className="text-primary mt-1">{exercise.overview}</p>
            </div>
          )}

          {exercise.description && !exercise.overview && (
            <div>
              <span className="font-medium text-primary">Description:</span>
              <p className="text-primary mt-1">{exercise.description}</p>
            </div>
          )}

          {exercise.instructions.length > 0 && (
            <div>
              <span className="font-medium text-primary">Instructions:</span>
              <ol className="list-decimal list-inside space-y-1 mt-1 text-primary">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {exercise.exerciseTips && exercise.exerciseTips.length > 0 && (
            <div>
              <span className="font-medium text-primary">Exercise Tips:</span>
              <ul className="list-disc list-inside space-y-1 mt-1 text-primary">
                {exercise.exerciseTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <button
              onClick={() => {
                onAddToWorkout(exercise);
                onClose();
              }}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-sm hover:shadow-md btn-glow"
            >
              Add to Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

