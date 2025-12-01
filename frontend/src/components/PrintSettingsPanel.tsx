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
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-mermaid-teal-900">Print Settings</h3>
        {canReset && (
          <button
            onClick={onReset}
            className="text-sm font-medium text-mermaid-aqua-600 hover:text-mermaid-aqua-700 hover:underline transition-colors"
          >
            Reset to Defaults
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-mermaid-teal-900 mb-2">
          Exercises per Page
        </label>
        <select
          value={config.exercisesPerPage}
          onChange={(e) => handleChange('exercisesPerPage', parseInt(e.target.value) as 2 | 3 | 4)}
          className="w-full px-4 py-2.5 border border-mermaid-aqua-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white text-mermaid-teal-900 transition-all"
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-mermaid-teal-900 mb-2">
          Fields to Show
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config[key as keyof PrintConfig] as boolean}
                onChange={(e) => handleChange(key as keyof PrintConfig, e.target.checked)}
                className="rounded border-slate-300 text-mermaid-aqua-600 focus:ring-mermaid-aqua-500 focus:ring-2"
              />
              <span className="text-sm text-mermaid-teal-900">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.condenseInstructions}
            onChange={(e) => handleChange('condenseInstructions', e.target.checked)}
            className="rounded border-slate-300 text-mermaid-aqua-600 focus:ring-mermaid-aqua-500 focus:ring-2"
          />
          <span className="text-sm text-mermaid-teal-900 font-medium">Condense Instructions</span>
        </label>
      </div>
    </div>
  );
}

