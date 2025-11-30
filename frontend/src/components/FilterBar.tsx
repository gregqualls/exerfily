import { useState } from 'react';
import type { ExerciseFilters } from '../types';

interface FilterBarProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
  availableBodyAreas: string[];
  availableMuscles: string[];
  availableEquipment: string[];
}

export default function FilterBar({
  filters,
  onFiltersChange,
  availableBodyAreas,
  availableMuscles,
  availableEquipment
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState(filters.q || '');

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

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search exercises..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Body Area
          </label>
          <select
            value={filters.bodyArea || ''}
            onChange={(e) => handleFilterChange('bodyArea', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All</option>
            {availableBodyAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Muscle
          </label>
          <select
            value={filters.primaryMuscle || ''}
            onChange={(e) => handleFilterChange('primaryMuscle', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All</option>
            {availableMuscles.map(muscle => (
              <option key={muscle} value={muscle}>{muscle}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Equipment
          </label>
          <select
            value={filters.equipment || ''}
            onChange={(e) => handleFilterChange('equipment', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All</option>
            {availableEquipment.map(eq => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Level
          </label>
          <select
            value={filters.level || ''}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

