import { useState, useEffect } from 'react';
import { fetchEquipments } from '../services/api';
import { getAvailableEquipment, saveAvailableEquipment } from '../services/equipmentStorage';
import ThemeSwitcher from './ThemeSwitcher';

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
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-border"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface backdrop-blur-md border-b-2 border-border p-6 flex justify-between items-center z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Equipment Settings</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Select the equipment you have available. Exercises will be filtered based on your selection.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-muted-100"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Theme Selector Section */}
          <div className="mb-6 pb-6 border-b-2 border-border">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Appearance</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Theme
              </label>
              <ThemeSwitcher />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--color-text-secondary)' }}>Loading equipment types...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedEquipment.length} of {allEquipmentTypes.length} selected
                </div>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-700)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  >
                    Select All
                  </button>
                  <span style={{ color: 'var(--color-border)' }}>|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-700)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                {allEquipmentTypes.map(equipment => (
                  <label
                    key={equipment}
                    className="flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors border-2"
                    style={{ 
                      backgroundColor: 'var(--color-muted-50)',
                      borderColor: 'transparent',
                      color: 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-muted-100)';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-muted-50)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(equipment)}
                      onChange={() => handleEquipmentToggle(equipment)}
                      className="w-4 h-4 rounded focus:ring-2 focus:ring-offset-1 cursor-pointer"
                      style={{ 
                        accentColor: 'var(--color-primary)',
                        borderColor: 'var(--color-border)'
                      }}
                    />
                    <span className="text-sm capitalize font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {equipment}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-6 border-t-2 border-border mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg transition-all font-medium shadow-sm border-2"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-secondary-700)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 rounded-lg transition-all font-medium shadow-sm hover:shadow-md border-2"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-primary)',
                    borderColor: 'var(--color-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-700)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
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
