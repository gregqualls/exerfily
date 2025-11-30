import { useState } from 'react';
import type { SessionExercise, Exercise } from '../types';

interface SessionExerciseRowProps {
  sessionExercise: SessionExercise;
  exercise: Exercise | null;
  onUpdate: (updated: SessionExercise) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function SessionExerciseRow({
  sessionExercise,
  exercise,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: SessionExerciseRowProps) {
  const [showCustomTips, setShowCustomTips] = useState(false);

  const handleFieldChange = (field: keyof SessionExercise, value: string | number | null) => {
    onUpdate({
      ...sessionExercise,
      [field]: value
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{exercise?.name || 'Unknown Exercise'}</h4>
          {exercise && (
            <p className="text-sm text-slate-600">
              {exercise.primaryMuscles.join(', ')} • {exercise.equipment.join(', ')}
            </p>
          )}
        </div>
        <div className="flex gap-1 ml-4">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onRemove}
            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
            title="Remove"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Sets</label>
          <input
            type="number"
            value={sessionExercise.sets || ''}
            onChange={(e) => handleFieldChange('sets', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="3"
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Reps</label>
          <input
            type="text"
            value={sessionExercise.reps || ''}
            onChange={(e) => handleFieldChange('reps', e.target.value || null)}
            placeholder="8-10"
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Weight</label>
          <input
            type="text"
            value={sessionExercise.weight || ''}
            onChange={(e) => handleFieldChange('weight', e.target.value || null)}
            placeholder="bodyweight"
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Rest</label>
          <input
            type="text"
            value={sessionExercise.rest || ''}
            onChange={(e) => handleFieldChange('rest', e.target.value || null)}
            placeholder="60s"
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
          />
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowCustomTips(!showCustomTips)}
          className="text-sm text-blue-600 hover:underline mb-2"
        >
          {showCustomTips ? 'Hide' : 'Show'} Custom Tips
        </button>
        {showCustomTips && (
          <textarea
            value={sessionExercise.customTips || ''}
            onChange={(e) => handleFieldChange('customTips', e.target.value || null)}
            placeholder="Add your personal tips or coaching cues..."
            className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
            rows={3}
          />
        )}
      </div>
    </div>
  );
}

