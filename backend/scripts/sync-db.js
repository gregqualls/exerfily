// Script to sync database during build
import { getDb } from '../src/db/index.js';
import { syncExercises } from '../src/services/syncService.js';

async function main() {
  try {
    console.log('Checking database...');
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as count FROM exercises').get().count;
    
    if (count === 0) {
      console.log('Database is empty, running initial sync...');
      const result = await syncExercises(true);
      if (result.success) {
        console.log(`✅ Initial sync completed: ${result.exerciseCount} exercises`);
        process.exit(0);
      } else {
        console.error('❌ Initial sync failed:', result.error);
        process.exit(1);
      }
    } else {
      console.log(`Database already has ${count} exercises, skipping sync`);
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during database sync:', error);
    process.exit(1);
  }
}

main();

