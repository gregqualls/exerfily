export interface Exercise {
  id: string;
  name: string;
  bodyArea: string;
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
}

export interface SessionExercise {
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

export interface Session {
  id: string;
  name: string;
  notes: string;
  exercises: SessionExercise[];
  printConfigOverride?: PrintConfig;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  sessions: Session[];
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

export interface ExerciseFilters {
  q?: string;
  bodyArea?: string;
  primaryMuscle?: string;
  equipment?: string;
  level?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface ExerciseResponse {
  exercises: Exercise[];
  total: number;
  limit: number;
  offset: number;
}

