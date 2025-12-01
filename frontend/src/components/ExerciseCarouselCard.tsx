import type { Exercise } from '../types';
import { isFavorite } from '../services/favoritesStorage';

interface ExerciseCarouselCardProps {
  exercise: Exercise;
  onExerciseClick?: (exercise: Exercise) => void;
  onAddToWorkout?: (exercise: Exercise) => void;
  onToggleFavorite?: (exercise: Exercise) => void;
  isActive?: boolean;
}

export default function ExerciseCarouselCard({
  exercise,
  onExerciseClick,
  onAddToWorkout,
  onToggleFavorite,
  isActive = false
}: ExerciseCarouselCardProps) {
  return (
    <div className="flex-shrink-0 w-full">
      <div
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-mermaid-aqua-200 overflow-hidden"
        style={{ borderRadius: '1rem' }}
      >
        {exercise.imageUrls.length > 0 && (
          <div className="relative w-full h-64 sm:h-80 overflow-hidden">
            <img
              src={exercise.imageUrls[0]}
              alt={exercise.name}
              className={`w-full h-full object-cover transition-all duration-500 filter grayscale-[0.7] brightness-[0.85] contrast-110 saturate-50 hue-rotate-[180deg] ${
                isActive ? 'hover:grayscale-0 hover:brightness-100 hover:contrast-100 hover:saturate-100 hover:hue-rotate-0' : ''
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br from-mermaid-aqua-500/20 to-mermaid-purple-500/20 opacity-60 transition-opacity duration-500 pointer-events-none ${
              isActive ? 'hover:opacity-0' : ''
            }`}></div>
          </div>
        )}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-mermaid-teal-900 mb-4">{exercise.name}</h3>
          <div className="space-y-2 text-sm text-mermaid-teal-700 mb-6">
            <p>
              <span className="font-medium">Body Part:</span>{' '}
              <span className="capitalize">{exercise.bodyPart}</span>
            </p>
            <p>
              <span className="font-medium">Muscles:</span>{' '}
              {exercise.primaryMuscles.join(', ')}
            </p>
            <p>
              <span className="font-medium">Equipment:</span>{' '}
              {exercise.equipment.join(', ')}
            </p>
            {exercise.level && (
              <p>
                <span className="font-medium">Level:</span>{' '}
                <span className="capitalize">{exercise.level}</span>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {onExerciseClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExerciseClick(exercise);
                }}
                className="flex-1 px-4 py-3 bg-mermaid-aqua-600 text-white rounded-lg hover:bg-mermaid-aqua-700 transition-all text-sm font-medium shadow-sm hover:shadow-md btn-glow"
              >
                View
              </button>
            )}
            {onAddToWorkout && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWorkout(exercise);
                }}
                className="flex-1 px-4 py-3 bg-mermaid-purple-500 text-white rounded-lg hover:bg-mermaid-purple-600 transition-all text-sm font-medium shadow-sm hover:shadow-md btn-glow"
              >
                Add
              </button>
            )}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(exercise);
                }}
                className={`px-4 py-3 rounded-lg transition-colors text-sm shadow-sm hover:shadow-md ${
                  isFavorite(exercise.id)
                    ? 'bg-mermaid-purple-500 text-white hover:bg-mermaid-purple-600'
                    : 'bg-mermaid-aqua-600 text-white hover:bg-mermaid-aqua-700'
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
    </div>
  );
}

