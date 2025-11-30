import type { PrintConfig } from '../types';

interface PrintSettingsPanelProps {
  config: PrintConfig;
  onConfigChange: (config: PrintConfig) => void;
  onReset: () => void;
  canReset: boolean;
}

export default function PrintSettingsPanel({
  config,
  onConfigChange,
  onReset,
  canReset
}: PrintSettingsPanelProps) {
  const handleChange = (field: keyof PrintConfig, value: any) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-900">Print Settings</h3>
        {canReset && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset to Defaults
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Exercises per Page
        </label>
        <select
          value={config.exercisesPerPage}
          onChange={(e) => handleChange('exercisesPerPage', parseInt(e.target.value) as 2 | 3 | 4)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md"
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Fields to Show
        </label>
        <div className="space-y-2">
          {[
            { key: 'showImage', label: 'Image' },
            { key: 'showName', label: 'Name' },
            { key: 'showDescription', label: 'Description' },
            { key: 'showInstructions', label: 'Instructions' },
            { key: 'showCustomTips', label: 'Custom Tips' },
            { key: 'showSetsReps', label: 'Sets / Reps' },
            { key: 'showWeight', label: 'Weight' },
            { key: 'showRest', label: 'Rest' }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config[key as keyof PrintConfig] as boolean}
                onChange={(e) => handleChange(key, e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.condenseInstructions}
            onChange={(e) => handleChange('condenseInstructions', e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-sm text-slate-700">Condense Instructions</span>
        </label>
      </div>
    </div>
  );
}

