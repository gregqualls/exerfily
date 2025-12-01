const STORAGE_KEY = 'exerfy-available-equipment';
const CUSTOM_EQUIPMENT_KEY = 'exerfy-custom-equipment';
const PREFERENCES_KEY = 'exerfy-equipment-preferences';

// Legacy support - convert old format to new format
export function getAvailableEquipment(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading available equipment from localStorage:', error);
    return [];
  }
}

export function saveAvailableEquipment(equipment: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
  } catch (error) {
    console.error('Error saving available equipment to localStorage:', error);
    throw error;
  }
}

export function clearAvailableEquipment(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing available equipment from localStorage:', error);
    throw error;
  }
}

// Custom equipment with mappings
export interface CustomEquipment {
  id: string;
  name: string;
  mapsTo: string[]; // Generic equipment types this custom equipment maps to
}

export function getCustomEquipment(): CustomEquipment[] {
  try {
    const data = localStorage.getItem(CUSTOM_EQUIPMENT_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading custom equipment from localStorage:', error);
    return [];
  }
}

export function saveCustomEquipment(equipment: CustomEquipment[]): void {
  try {
    localStorage.setItem(CUSTOM_EQUIPMENT_KEY, JSON.stringify(equipment));
  } catch (error) {
    console.error('Error saving custom equipment to localStorage:', error);
    throw error;
  }
}

export function addCustomEquipment(equipment: Omit<CustomEquipment, 'id'>): CustomEquipment {
  const existing = getCustomEquipment();
  const newEquipment: CustomEquipment = {
    ...equipment,
    id: crypto.randomUUID()
  };
  existing.push(newEquipment);
  saveCustomEquipment(existing);
  return newEquipment;
}

export function updateCustomEquipment(id: string, updates: Partial<CustomEquipment>): void {
  const existing = getCustomEquipment();
  const index = existing.findIndex(eq => eq.id === id);
  if (index >= 0) {
    existing[index] = { ...existing[index], ...updates };
    saveCustomEquipment(existing);
  }
}

export function deleteCustomEquipment(id: string): void {
  const existing = getCustomEquipment().filter(eq => eq.id !== id);
  saveCustomEquipment(existing);
}

// Get all generic equipment types that are covered by user's custom equipment
export function getMappedGenericEquipment(): string[] {
  const customEquipment = getCustomEquipment();
  const mappedTypes = new Set<string>();
  customEquipment.forEach(eq => {
    eq.mapsTo.forEach(type => mappedTypes.add(type));
  });
  return Array.from(mappedTypes);
}

// Check if a generic equipment type is available (via custom equipment mapping)
export function hasGenericEquipment(genericType: string): boolean {
  const customEquipment = getCustomEquipment();
  return customEquipment.some(eq => eq.mapsTo.includes(genericType));
}

export interface EquipmentPreferences {
  enabled: boolean;
  filterMode: 'all' | 'any';
}

export function getEquipmentPreferences(): EquipmentPreferences {
  try {
    const data = localStorage.getItem(PREFERENCES_KEY);
    if (!data) return { enabled: false, filterMode: 'any' };
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading equipment preferences from localStorage:', error);
    return { enabled: false, filterMode: 'any' };
  }
}

export function saveEquipmentPreferences(preferences: EquipmentPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving equipment preferences to localStorage:', error);
    throw error;
  }
}

