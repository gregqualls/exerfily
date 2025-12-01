import { useState, useEffect } from 'react';
import { fetchEquipments } from '../services/api';
import { getAvailableEquipment, saveAvailableEquipment } from '../services/equipmentStorage';

interface EquipmentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EquipmentSettingsModal({
  isOpen,
  onClose
}: EquipmentSettingsModalProps) {
  const [allEquipmentTypes, setAllEquipmentTypes] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadEquipmentData();
    }
  }, [isOpen]);

  const loadEquipmentData = async () => {
    setLoading(true);
    try {
      console.log('Fetching equipment types from API...');
      const equipments = await fetchEquipments();
      console.log('Loaded equipment types from API:', equipments);
      if (equipments && Array.isArray(equipments) && equipments.length > 0) {
        setAllEquipmentTypes(equipments);
        console.log(`Successfully loaded ${equipments.length} equipment types`);
      } else {
        console.warn('No equipment types returned from API');
        setAllEquipmentTypes([]);
      }

      // Load saved equipment selections
      const savedEquipment = getAvailableEquipment();
      setSelectedEquipment(savedEquipment);
    } catch (error) {
      console.error('Error loading equipment data:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      setAllEquipmentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipment)) {
        return prev.filter(eq => eq !== equipment);
      } else {
        return [...prev, equipment];
      }
    });
  };

  const handleSave = () => {
    saveAvailableEquipment(selectedEquipment);
    onClose();
  };

  const handleSelectAll = () => {
    setSelectedEquipment([...allEquipmentTypes]);
  };

  const handleDeselectAll = () => {
    setSelectedEquipment([]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-mermaid-aqua-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-mermaid-aqua-200 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-mermaid-teal-900">Equipment Settings</h2>
            <p className="text-sm text-mermaid-teal-600 mt-1">
              Select the equipment you have available. Exercises will be filtered based on your selection.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-mermaid-teal-600 hover:text-mermaid-aqua-600 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-mermaid-teal-600">Loading equipment types...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-mermaid-teal-700">
                  {selectedEquipment.length} of {allEquipmentTypes.length} selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm font-medium text-mermaid-aqua-600 hover:text-mermaid-aqua-700 hover:underline transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-mermaid-aqua-300">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm font-medium text-mermaid-aqua-600 hover:text-mermaid-aqua-700 hover:underline transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                {allEquipmentTypes.map(equipment => (
                  <label
                    key={equipment}
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-mermaid-aqua-50 cursor-pointer transition-colors border border-transparent hover:border-mermaid-aqua-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(equipment)}
                      onChange={() => handleEquipmentToggle(equipment)}
                      className="w-4 h-4 text-mermaid-aqua-600 border-mermaid-aqua-300 rounded focus:ring-mermaid-aqua-500 focus:ring-2"
                    />
                    <span className="text-sm text-mermaid-teal-700 capitalize">
                      {equipment}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-6 border-t border-mermaid-aqua-200 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-mermaid-teal-600 text-white rounded-lg hover:bg-mermaid-teal-700 transition-all font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-mermaid-aqua-600 text-white rounded-lg hover:bg-mermaid-aqua-700 transition-all font-medium shadow-sm hover:shadow-md"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
