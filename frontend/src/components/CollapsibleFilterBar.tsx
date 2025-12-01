import { useState, useEffect, useRef } from 'react';
import type { ExerciseFilters, EquipmentFilterMode } from '../types';
import { getAvailableEquipment, getEquipmentPreferences, saveEquipmentPreferences } from '../services/equipmentStorage';

interface CollapsibleFilterBarProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
  availableBodyParts: string[];
  availableMuscles: string[];
  availableEquipment: string[];
}

export default function CollapsibleFilterBar({
  filters,
  onFiltersChange,
  availableBodyParts,
  availableMuscles,
  availableEquipment
}: CollapsibleFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.q || '');
  const [equipmentFilterEnabled, setEquipmentFilterEnabled] = useState(false);
  const [equipmentFilterMode, setEquipmentFilterMode] = useState<EquipmentFilterMode>('any');
  const prevFiltersRef = useRef<ExerciseFilters>(filters);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.q ||
    filters.bodyPart ||
    filters.primaryMuscle ||
    filters.equipment ||
    filters.level ||
    filters.category ||
    filters.exerciseType ||
    filters.equipmentFilterEnabled
  );

  // Auto-collapse only when filters actually change (not just when expanded)
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const filtersChanged = 
      prevFilters.q !== filters.q ||
      prevFilters.bodyPart !== filters.bodyPart ||
      prevFilters.primaryMuscle !== filters.primaryMuscle ||
      prevFilters.equipment !== filters.equipment ||
      prevFilters.level !== filters.level ||
      prevFilters.category !== filters.category ||
      prevFilters.exerciseType !== filters.exerciseType ||
      prevFilters.equipmentFilterEnabled !== filters.equipmentFilterEnabled ||
      prevFilters.equipmentFilterMode !== filters.equipmentFilterMode;

    if (filtersChanged && isExpanded && hasActiveFilters) {
      // Small delay to show the filter being applied, then collapse
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 300);
      prevFiltersRef.current = filters;
      return () => clearTimeout(timer);
    }
    
    prevFiltersRef.current = filters;
  }, [filters, isExpanded, hasActiveFilters]);

  useEffect(() => {
    const preferences = getEquipmentPreferences();
    setEquipmentFilterEnabled(preferences.enabled);
    setEquipmentFilterMode(preferences.filterMode);
    
    if (preferences.enabled && filters.equipmentFilterEnabled !== true) {
      onFiltersChange({
        ...filters,
        equipmentFilterEnabled: true,
        equipmentFilterMode: preferences.filterMode
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filters.equipmentFilterEnabled !== undefined) {
      setEquipmentFilterEnabled(filters.equipmentFilterEnabled);
    }
    if (filters.equipmentFilterMode) {
      setEquipmentFilterMode(filters.equipmentFilterMode);
    }
  }, [filters.equipmentFilterEnabled, filters.equipmentFilterMode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onFiltersChange({ ...filters, q: q || undefined });
  };

  const handleFilterChange = (key: keyof ExerciseFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const handleEquipmentFilterToggle = (enabled: boolean) => {
    setEquipmentFilterEnabled(enabled);
    const mode = enabled ? equipmentFilterMode : 'any';
    const preferences = { enabled, filterMode: mode as 'all' | 'any' };
    saveEquipmentPreferences(preferences);
    onFiltersChange({
      ...filters,
      equipmentFilterEnabled: enabled,
      equipmentFilterMode: enabled ? mode : 'off'
    });
  };

  const handleEquipmentFilterModeChange = (mode: EquipmentFilterMode) => {
    setEquipmentFilterMode(mode);
    if (mode !== 'off') {
      const preferences = { enabled: equipmentFilterEnabled, filterMode: mode as 'all' | 'any' };
      saveEquipmentPreferences(preferences);
    }
    onFiltersChange({
      ...filters,
      equipmentFilterMode: mode
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setEquipmentFilterEnabled(false);
    setEquipmentFilterMode('any');
    saveEquipmentPreferences({ enabled: false, filterMode: 'any' });
    onFiltersChange({});
    setIsExpanded(false);
  };

  const availableEquipmentCount = getAvailableEquipment().length;

  // Count active filters for display
  const activeFilterCount = [
    filters.q,
    filters.bodyPart,
    filters.primaryMuscle,
    filters.equipment,
    filters.level,
    filters.category,
    filters.exerciseType,
    filters.equipmentFilterEnabled
  ].filter(Boolean).length;

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-md border border-mermaid-aqua-200 overflow-hidden transition-all duration-300 animate-fade-in-up">
      {/* Collapsed Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-4 cursor-pointer transition-all duration-300 ${
          isExpanded ? 'border-b border-mermaid-aqua-200' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-mermaid-aqua-600 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-medium text-mermaid-teal-900">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-mermaid-aqua-600 text-white text-xs rounded-full font-medium">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-xs text-mermaid-aqua-600 hover:text-mermaid-aqua-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        {!isExpanded && hasActiveFilters && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filters.q && (
              <span className="px-2 py-1 bg-mermaid-aqua-100 text-mermaid-teal-900 text-xs rounded">
                Search: {filters.q}
              </span>
            )}
            {filters.bodyPart && (
              <span className="px-2 py-1 bg-mermaid-aqua-100 text-mermaid-teal-900 text-xs rounded capitalize">
                {filters.bodyPart}
              </span>
            )}
            {filters.primaryMuscle && (
              <span className="px-2 py-1 bg-mermaid-aqua-100 text-mermaid-teal-900 text-xs rounded">
                {filters.primaryMuscle}
              </span>
            )}
            {filters.equipment && (
              <span className="px-2 py-1 bg-mermaid-aqua-100 text-mermaid-teal-900 text-xs rounded">
                {filters.equipment}
              </span>
            )}
            {filters.level && (
              <span className="px-2 py-1 bg-mermaid-aqua-100 text-mermaid-teal-900 text-xs rounded capitalize">
                {filters.level}
              </span>
            )}
            {filters.exerciseType && (
              <span className="px-2 py-1 bg-mermaid-aqua-100 text-mermaid-teal-900 text-xs rounded">
                {filters.exerciseType}
              </span>
            )}
            {filters.equipmentFilterEnabled && (
              <span className="px-2 py-1 bg-mermaid-purple-100 text-mermaid-teal-900 text-xs rounded">
                Equipment Filter: {filters.equipmentFilterMode}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-mermaid-teal-900 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search exercises..."
                className="w-full px-3 py-2 border border-mermaid-aqua-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white text-mermaid-teal-900 transition-all"
              />
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-mermaid-teal-900 mb-1">
                Body Parts
              </label>
              <select
                value={filters.bodyPart || ''}
                onChange={(e) => handleFilterChange('bodyPart', e.target.value)}
                className="w-full px-3 py-2 border border-mermaid-aqua-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white text-mermaid-teal-900 transition-all"
              >
                <option value="">All</option>
                {availableBodyParts.map(part => (
                  <option key={part} value={part} className="capitalize">{part}</option>
                ))}
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-mermaid-teal-900 mb-1">
                Muscle
              </label>
              <select
                value={filters.primaryMuscle || ''}
                onChange={(e) => handleFilterChange('primaryMuscle', e.target.value)}
                className="w-full px-3 py-2 border border-mermaid-aqua-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white text-mermaid-teal-900 transition-all"
              >
                <option value="">All</option>
                {availableMuscles.map(muscle => (
                  <option key={muscle} value={muscle}>{muscle}</option>
                ))}
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-mermaid-teal-900 mb-1">
                Equipment
              </label>
              <select
                value={filters.equipment || ''}
                onChange={(e) => handleFilterChange('equipment', e.target.value)}
                className="w-full px-3 py-2 border border-mermaid-aqua-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white text-mermaid-teal-900 transition-all"
              >
                <option value="">All</option>
                {availableEquipment.map(eq => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-mermaid-teal-900 mb-1">
                Level
              </label>
              <select
                value={filters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-mermaid-aqua-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white text-mermaid-teal-900 transition-all"
              >
                <option value="">All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-mermaid-teal-900 mb-1">
                Exercise Type
              </label>
              <select
                value={filters.exerciseType || ''}
                onChange={(e) => handleFilterChange('exerciseType', e.target.value)}
                className="w-full px-3 py-2 border border-mermaid-aqua-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white text-mermaid-teal-900 transition-all"
              >
                <option value="">All</option>
                <option value="STRENGTH">Strength</option>
                <option value="CARDIO">Cardio</option>
                <option value="STRETCHING">Stretching</option>
                <option value="PLYOMETRIC">Plyometric</option>
                <option value="POWERLIFTING">Powerlifting</option>
                <option value="STRONGMAN">Strongman</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-mermaid-aqua-600 text-white rounded-lg hover:bg-mermaid-aqua-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              Clear Filters
            </button>
          </div>

          {/* Equipment Filter Section */}
          <div className="border-t border-mermaid-aqua-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={equipmentFilterEnabled}
                    onChange={(e) => handleEquipmentFilterToggle(e.target.checked)}
                    className="w-4 h-4 text-mermaid-aqua-600 border-mermaid-aqua-300 rounded focus:ring-mermaid-aqua-500"
                  />
                  <span className="text-sm font-medium text-mermaid-teal-900">
                    Filter by Available Equipment
                  </span>
                </label>
                {availableEquipmentCount > 0 && (
                  <span className="text-xs text-mermaid-teal-700">
                    ({availableEquipmentCount} equipment selected)
                  </span>
                )}
              </div>

              {equipmentFilterEnabled && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-mermaid-teal-700">Filter mode:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="equipmentFilterMode"
                      value="any"
                      checked={equipmentFilterMode === 'any'}
                      onChange={() => handleEquipmentFilterModeChange('any')}
                      className="w-4 h-4 text-mermaid-aqua-600 border-mermaid-aqua-300 focus:ring-mermaid-aqua-500"
                    />
                    <span className="text-sm text-mermaid-teal-900">Any required</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="equipmentFilterMode"
                      value="all"
                      checked={equipmentFilterMode === 'all'}
                      onChange={() => handleEquipmentFilterModeChange('all')}
                      className="w-4 h-4 text-mermaid-aqua-600 border-mermaid-aqua-300 focus:ring-mermaid-aqua-500"
                    />
                    <span className="text-sm text-mermaid-teal-700">All required</span>
                  </label>
                </div>
              )}
            </div>
            {equipmentFilterEnabled && availableEquipmentCount === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                No equipment added. Click the settings icon in the navigation bar to add your equipment and map it to generic types.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

