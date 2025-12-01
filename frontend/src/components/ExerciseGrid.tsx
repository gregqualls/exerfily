import type { Exercise } from '../types';
import { isFavorite } from '../services/favoritesStorage';

interface ExerciseGridProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
  onAddToWorkout: (exercise: Exercise) => void;
  onToggleFavorite?: (exercise: Exercise) => void;
}

export default function ExerciseGrid({
  exercises,
  onExerciseClick,
  onAddToWorkout,
  onToggleFavorite
}: ExerciseGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 text-secondary animate-fade-in">
        <p>No exercises found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          onClick={() => onExerciseClick(exercise)}
          className="bg-white/70 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-border card-hover animate-fade-in-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {exercise.imageUrls.length > 0 && (
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={exercise.imageUrls[0]}
                alt={exercise.name}
                className="w-full h-48 object-cover transition-all duration-500 filter grayscale-[0.7] brightness-[0.85] contrast-110 saturate-50 hue-rotate-[180deg] hover:grayscale-0 hover:brightness-100 hover:contrast-100 hover:saturate-100 hover:hue-rotate-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 opacity-60 hover:opacity-0 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-semibold text-primary mb-2">{exercise.name}</h3>
            <div className="space-y-1 text-sm text-secondary mb-3">
              <p><span className="font-medium">Body Part:</span> <span className="capitalize">{exercise.bodyPart}</span></p>
              <p><span className="font-medium">Muscles:</span> {exercise.primaryMuscles.join(', ')}</p>
              <p><span className="font-medium">Equipment:</span> {exercise.equipment.join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExerciseClick(exercise);
                }}
                className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium shadow-sm hover:shadow-md btn-glow"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWorkout(exercise);
                }}
                className="flex-1 px-3 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-all text-sm font-medium shadow-sm hover:shadow-md btn-glow"
              >
                Add
              </button>
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(exercise);
                  }}
                  className={`px-3 py-2 rounded-md transition-colors text-sm shadow-sm hover:shadow-md ${
                    isFavorite(exercise.id)
                      ? 'bg-accent-500 text-white hover:bg-accent-600'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  title={isFavorite(exercise.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill={isFavorite(exercise.id) ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
