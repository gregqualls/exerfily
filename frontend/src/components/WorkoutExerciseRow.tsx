import { useState } from 'react';
import type { WorkoutExercise, Exercise } from '../types';

interface WorkoutExerciseRowProps {
  workoutExercise: WorkoutExercise;
  exercise: Exercise | null;
  onUpdate: (updated: WorkoutExercise) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function WorkoutExerciseRow({
  workoutExercise,
  exercise,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: WorkoutExerciseRowProps) {
  const [showCustomTips, setShowCustomTips] = useState(false);

  const handleFieldChange = (field: keyof WorkoutExercise, value: string | number | null) => {
    onUpdate({
      ...workoutExercise,
      [field]: value
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-primary mb-1">{exercise?.name || 'Unknown Exercise'}</h4>
          {exercise && (
            <p className="text-sm text-slate-600">
              {exercise.primaryMuscles.join(', ')} • {exercise.equipment.join(', ')}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Sets</label>
          <input
            type="number"
            value={workoutExercise.sets || ''}
            onChange={(e) => handleFieldChange('sets', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="3"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Reps</label>
          <input
            type="text"
            value={workoutExercise.reps || ''}
            onChange={(e) => handleFieldChange('reps', e.target.value || null)}
            placeholder="8-10"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Weight</label>
          <input
            type="text"
            value={workoutExercise.weight || ''}
            onChange={(e) => handleFieldChange('weight', e.target.value || null)}
            placeholder="bodyweight"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Rest</label>
          <input
            type="text"
            value={workoutExercise.rest || ''}
            onChange={(e) => handleFieldChange('rest', e.target.value || null)}
            placeholder="60s"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-primary transition-all"
          />
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowCustomTips(!showCustomTips)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline mb-2 transition-colors"
        >
          {showCustomTips ? 'Hide' : 'Show'} Custom Tips
        </button>
        {showCustomTips && (
          <textarea
            value={workoutExercise.customTips || ''}
            onChange={(e) => handleFieldChange('customTips', e.target.value || null)}
            placeholder="Add your personal tips or coaching cues..."
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-primary transition-all"
            rows={3}
          />
        )}
      </div>
    </div>
  );
}

