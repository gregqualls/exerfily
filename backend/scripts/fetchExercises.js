// DEPRECATED: This script is no longer used.
// The application now fetches exercises directly from ExerciseDB v2 API (v2.exercisedb.dev)
// and does not store exercises locally.
//
// Original purpose: Script to fetch exercises with proper names and matching images from wger.de
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXERCISES_FILE = join(__dirname, '../data/exercises.json');

// Curated list of exercise IDs with known good names and images
const CURATED_EXERCISES = [
  { id: 167, name: 'Crunches', muscles: [6], equipment: [3], bodyArea: 'core' },
  { id: 427, name: 'Decline Crunch', muscles: [6], equipment: [3], bodyArea: 'core' },
  { id: 95, name: 'Standing Biceps Curl', muscles: [1], equipment: [8], bodyArea: 'upper body' },
  { id: 76, name: 'Narrow Grip Bench Press', muscles: [2, 4], equipment: [10], bodyArea: 'upper body' },
  { id: 301, name: 'Hyperextensions', muscles: [5], equipment: [3], bodyArea: 'back' },
  { id: 143, name: 'Cable Seated Rows', muscles: [5], equipment: [7], bodyArea: 'back' },
  { id: 184, name: 'Dips', muscles: [2, 4], equipment: [3], bodyArea: 'upper body' },
  { id: 51, name: 'Front Raises', muscles: [3], equipment: [8], bodyArea: 'upper body' },
  { id: 394, name: 'Hammer Curls', muscles: [1], equipment: [8], bodyArea: 'upper body' },
  { id: 272, name: 'Lateral Raises', muscles: [3], equipment: [8], bodyArea: 'upper body' },
  { id: 1091, name: 'Leg Press', muscles: [7], equipment: [4], bodyArea: 'lower body' },
  { id: 1554, name: 'Leg Raises', muscles: [6], equipment: [3], bodyArea: 'core' },
  { id: 539, name: 'Good Morning', muscles: [8, 9], equipment: [10], bodyArea: 'lower body' },
  { id: 1136, name: 'Squats', muscles: [7, 9], equipment: [10], bodyArea: 'lower body' },
  { id: 576, name: 'Deadlift', muscles: [5, 8, 9], equipment: [10], bodyArea: 'back' },
  { id: 1612, name: 'Pull-ups', muscles: [5], equipment: [3], bodyArea: 'back' },
  { id: 1348, name: 'Push-ups', muscles: [4, 2], equipment: [3], bodyArea: 'upper body' },
  { id: 475, name: 'Lunges', muscles: [7, 9], equipment: [3], bodyArea: 'lower body' },
  { id: 1673, name: 'Plank', muscles: [6], equipment: [3], bodyArea: 'core' },
  { id: 1604, name: 'Bench Press', muscles: [4, 2], equipment: [10], bodyArea: 'upper body' }
];

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function fetchExercises() {
  try {
    console.log('Fetching exercise images...');
    const imagesRes = await fetchWithRetry('https://wger.de/api/v2/exerciseimage/?limit=500&is_main=true');
    const imageMap = new Map();
    imagesRes.results.forEach(img => {
      if (img.exercise && img.image) {
        imageMap.set(img.exercise, img.image);
      }
    });
    console.log(`Found ${imageMap.size} exercises with images`);
    
    const mappedExercises = [];
    
    for (const curated of CURATED_EXERCISES) {
      const imageUrl = imageMap.get(curated.id);
      if (!imageUrl) {
        console.warn(`No image found for ${curated.name} (ID: ${curated.id})`);
        continue;
      }
      
      // Map muscles
      const muscleMap = {
        1: 'biceps', 2: 'triceps', 3: 'delts', 4: 'pectorals',
        5: 'lats', 6: 'abs', 7: 'quadriceps', 8: 'hamstrings',
        9: 'glutes', 10: 'calves', 11: 'forearms', 12: 'traps'
      };
      const primaryMuscles = curated.muscles.map(m => muscleMap[m] || 'unknown').filter(m => m !== 'unknown');
      
      // Map equipment
      const eqMap = {
        10: 'barbell', 8: 'dumbbell', 4: 'machine',
        3: 'body weight', 7: 'cable', 1: 'other'
      };
      const equipment = curated.equipment.map(eq => eqMap[eq] || 'body weight');
      
      mappedExercises.push({
        id: `wger-${curated.id}`,
        name: curated.name,
        bodyArea: curated.bodyArea,
        primaryMuscles: primaryMuscles.length > 0 ? primaryMuscles : ['full body'],
        secondaryMuscles: [],
        equipment,
        category: 'strength',
        level: 'intermediate',
        description: `${curated.name} exercise targeting ${primaryMuscles.join(' and ')}`,
        instructions: [
          'Set up in the starting position',
          'Execute the movement with proper form',
          'Control the weight throughout the range of motion',
          'Return to starting position',
          'Repeat for desired reps'
        ],
        imageUrls: [imageUrl],
        sourceId: `wger-${curated.id}`,
        tags: []
      });
    }
    
    writeFileSync(EXERCISES_FILE, JSON.stringify(mappedExercises, null, 2));
    console.log(`✅ Saved ${mappedExercises.length} exercises with matching images`);
    console.log(`Exercises: ${mappedExercises.map(e => e.name).join(', ')}`);
    
  } catch (error) {
    console.error('Error fetching exercises:', error);
    process.exit(1);
  }
}

fetchExercises();
