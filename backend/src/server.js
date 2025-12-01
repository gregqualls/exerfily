import express from 'express';
import cors from 'cors';
import exerciseRoutes from './routes/exercises.js';
import { getDb } from './db/index.js';
import { syncExercises } from './services/syncService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', exerciseRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and check for sync on startup
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    // Initialize database connection
    const db = getDb();
    
    // Check if database has any exercises
    const exerciseCount = db.prepare('SELECT COUNT(*) as count FROM exercises').get().count;
    
    if (exerciseCount === 0) {
      console.log('Database is empty, performing initial sync...');
      const result = await syncExercises(true);
      if (result.success) {
        console.log(`✅ Initial sync completed: ${result.exerciseCount} exercises loaded`);
      } else {
        console.error('❌ Initial sync failed:', result.error);
        // Don't crash the server if sync fails - continue anyway
      }
    } else {
      console.log(`Database initialized with ${exerciseCount} exercises`);
      // Check if sync is needed (non-blocking)
      syncExercises(false).then(result => {
        if (result.synced) {
          console.log(`✅ Sync completed: ${result.exerciseCount} exercises in database`);
        } else {
          console.log(`ℹ️  Sync check: ${result.reason}`);
        }
      }).catch(error => {
        console.error('Error during startup sync check:', error);
      });
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't crash the server - continue even if DB init fails
    // The API will return errors, but at least the server will be up
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});
