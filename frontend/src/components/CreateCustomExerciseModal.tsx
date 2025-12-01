import { useState } from 'react';
import { saveCustomExercise } from '../services/customExerciseStorage';
import type { Exercise } from '../types';

interface CreateCustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseCreated: (exercise: Exercise) => void;
}

export default function CreateCustomExerciseModal({
  isOpen,
  onClose,
  onExerciseCreated
}: CreateCustomExerciseModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [primaryMuscles, setPrimaryMuscles] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExercise: Exercise = {
      id: `custom_${crypto.randomUUID()}`,
      name: name.trim(),
      bodyPart: bodyPart.trim() || 'other',
      primaryMuscles: primaryMuscles.split(',').map(m => m.trim()).filter(Boolean),
      secondaryMuscles: [],
      equipment: equipment.split(',').map(e => e.trim()).filter(Boolean),
      category: 'custom',
      level: 'intermediate',
      description: description.trim(),
      instructions: instructions.split('\n').filter(Boolean),
      imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
      sourceId: 'custom',
      tags: [],
      exerciseType: 'STRENGTH'
    };

    saveCustomExercise(newExercise);
    onExerciseCreated(newExercise);
    
    // Reset form
    setName('');
    setDescription('');
    setBodyPart('');
    setPrimaryMuscles('');
    setEquipment('');
    setInstructions('');
    setImageUrl('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 dark:bg-midnight-800/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-mermaid-aqua-200 dark:border-midnight-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 dark:bg-midnight-800/95 backdrop-blur-md border-b border-mermaid-aqua-200 dark:border-midnight-700 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-mermaid-teal-900 dark:text-silver-100">Create Custom Exercise</h2>
          <button
            onClick={onClose}
            className="text-mermaid-teal-600 dark:text-silver-400 hover:text-mermaid-aqua-600 dark:hover:text-silver-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
              Exercise Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
              placeholder="e.g., Custom Push-up Variation"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
              placeholder="Brief description of the exercise"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
                Body Part
              </label>
              <input
                type="text"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
                placeholder="e.g., chest"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
                Equipment (comma-separated)
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
                placeholder="e.g., bodyweight, dumbbell"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
              Primary Muscles (comma-separated)
            </label>
            <input
              type="text"
              value={primaryMuscles}
              onChange={(e) => setPrimaryMuscles(e.target.value)}
              className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
              placeholder="e.g., pectorals, triceps"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
              Instructions (one per line)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
              placeholder="Step 1: ...&#10;Step 2: ..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-mermaid-teal-700 dark:text-silver-300 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 border border-mermaid-aqua-300 dark:border-midnight-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mermaid-aqua-500 focus:border-mermaid-aqua-500 bg-white dark:bg-midnight-700 text-mermaid-teal-900 dark:text-white transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-midnight-600 dark:bg-midnight-700 text-white dark:text-silver-100 rounded-lg hover:bg-midnight-500 dark:hover:bg-midnight-600 transition-all font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-mermaid-aqua-600 dark:bg-mermaid-aqua-500 text-white rounded-lg hover:bg-mermaid-aqua-700 dark:hover:bg-mermaid-aqua-600 transition-all font-medium shadow-sm hover:shadow-md"
            >
              Create Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

