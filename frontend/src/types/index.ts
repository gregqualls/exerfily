export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  category: string;
  level: string;
  description: string;
  instructions: string[];
  imageUrls: string[];
  sourceId: string;
  tags: string[];
  // v2 API fields
  exerciseId?: string; // v2's unique ID format: exr_...
  keywords?: string[]; // for enhanced search
  exerciseTips?: string[]; // coaching cues
  exerciseType?: string; // STRENGTH, CARDIO, etc.
  overview?: string; // enhanced description
  variations?: string[]; // exercise variations
  relatedExerciseIds?: string[]; // related exercises
  videoUrl?: string; // video URL if available
  gender?: string; // male/female
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: number | null;
  reps: string | null;
  weight: string | null;
  tempo: string | null;
  rest: string | null;
  customTips: string | null;
}

// Legacy type alias for backward compatibility during migration
export type SessionExercise = WorkoutExercise;

export interface Workout {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutExercise[];
  printConfig?: PrintConfig;
}

export interface PrintConfig {
  exercisesPerPage: 2 | 3 | 4;
  showImage: boolean;
  showName: boolean;
  showDescription: boolean;
  showInstructions: boolean;
  showCustomTips: boolean;
  showSetsReps: boolean;
  showWeight: boolean;
  showRest: boolean;
  condenseInstructions: boolean;
}

export type EquipmentFilterMode = 'all' | 'any' | 'off';

export interface ExerciseFilters {
  q?: string;
  bodyPart?: string;
  primaryMuscle?: string;
  equipment?: string;
  level?: string;
  category?: string;
  exerciseType?: string; // STRENGTH, CARDIO, etc.
  limit?: number;
  offset?: number;
  equipmentFilterMode?: EquipmentFilterMode;
  equipmentFilterEnabled?: boolean;
}

export interface ExerciseResponse {
  exercises: Exercise[];
  total: number;
  limit: number;
  offset: number;
}

