# Exerfily - Workout Sheet Builder

A full-stack web application for building printable workout sheets using the ExerciseDB API. Create, organize, and print custom workout routines with detailed exercise information.

## Features

### Exercise Management
- **Exercise Browsing**: Search and filter exercises by body area, muscle group, equipment, and difficulty level
- **Exercise Carousel**: Browse exercises in a carousel view for quick navigation
- **Favorites**: Save favorite exercises for quick access
- **Custom Exercises**: Create your own custom exercises with images, descriptions, and instructions
- **Exercise Details**: View comprehensive exercise information including images, muscle groups, equipment, and step-by-step instructions

### Workout Management
- **Workout Creation**: Create, edit, duplicate, and delete workouts
- **Session Organization**: Organize workouts into multiple sessions (e.g., Day A, Day B, Push, Pull, Legs)
- **Exercise Configuration**: Set sets, reps, weight, tempo, rest, and custom tips for each exercise
- **Exercise Reordering**: Drag and drop to reorder exercises within sessions

### Equipment Management
- **Equipment Settings**: Configure your available equipment and map it to generic exercise equipment types
- **Smart Filtering**: Filter exercises based on your available equipment (show exercises that use any/all of your equipment)

### Print Functionality
- **Print Configuration**: Customize print layouts with configurable fields and exercises per page (2, 3, or 4)
- **Print Views**: Generate printable workout sheets for individual sessions or entire workouts
- **Field Customization**: Choose which fields to display (image, name, description, sets/reps, weight, rest, custom tips)

### Data Sync
- **Database Sync**: Automatic synchronization with ExerciseDB API
- **Update Notifications**: Get notified when exercise database updates are available
- **Local Caching**: Exercises are cached in a local SQLite database for fast access

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3) for exercise caching
- **API**: ExerciseDB API (https://exercisedb-api.vercel.app)
- **Storage**: 
  - SQLite (backend) for exercise data
  - localStorage (frontend) for workouts, favorites, custom exercises, and equipment preferences

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd exerfily
```

2. Install root dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Install backend dependencies:
```bash
cd ../backend
npm install
```

### Development

Run both frontend and backend concurrently from the root:
```bash
npm run dev
```

Or run them separately:

**Backend** (port 3000):
```bash
cd backend
npm run dev
```

**Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

**Note**: On first startup, the backend will automatically sync exercises from the ExerciseDB API into the local SQLite database. This may take a few moments.

### Building for Production

Build the frontend:
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`.

### Testing

Run all tests:
```bash
npm test
```

Run frontend tests:
```bash
cd frontend
npm test
```

Run backend tests:
```bash
cd backend
npm test
```

## Project Structure

```
exerfily/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── CollapsibleFilterBar.tsx
│   │   │   ├── CreateCustomExerciseModal.tsx
│   │   │   ├── EquipmentSettingsModal.tsx
│   │   │   ├── ExerciseBrowserModal.tsx
│   │   │   ├── ExerciseCarousel.tsx
│   │   │   ├── ExerciseGrid.tsx
│   │   │   ├── ExerciseDetailModal.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── PrintSettingsPanel.tsx
│   │   │   └── WorkoutExerciseRow.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── ExerciseCarouselPage.tsx
│   │   │   ├── ExercisesPage.tsx
│   │   │   ├── FavoritesPage.tsx
│   │   │   ├── PrintView.tsx
│   │   │   ├── WorkoutDetailPage.tsx
│   │   │   └── WorkoutsPage.tsx
│   │   ├── services/      # API clients and localStorage services
│   │   │   ├── api.ts
│   │   │   ├── customExerciseStorage.ts
│   │   │   ├── equipmentStorage.ts
│   │   │   ├── favoritesStorage.ts
│   │   │   └── workoutStorage.ts
│   │   ├── types/         # TypeScript interfaces
│   │   └── contexts/      # React contexts (ThemeContext)
│   └── package.json
├── backend/               # Express API server
│   ├── src/
│   │   ├── db/            # Database setup and schema
│   │   │   ├── index.js
│   │   │   └── schema.js
│   │   ├── routes/        # API routes
│   │   │   └── exercises.js
│   │   ├── services/      # Business logic
│   │   │   ├── exerciseService.js
│   │   │   ├── gifService.js
│   │   │   └── syncService.js
│   │   └── server.js      # Express app entry
│   ├── data/              # SQLite database files
│   ├── scripts/           # Utility scripts
│   │   └── fetchExercises.js
│   └── package.json
└── package.json           # Root workspace config
```

## Usage

### Getting Started

1. **Browse Exercises**: 
   - Navigate to the Exercises page to search and filter exercises
   - Use the carousel view for a different browsing experience
   - Click on any exercise card to view detailed information

2. **Manage Favorites**:
   - Click the heart icon on any exercise to add it to favorites
   - Access all favorites from the Favorites page in the navigation

3. **Create Custom Exercises**:
   - Click "Create Custom Exercise" on the Exercises page
   - Add your own exercises with custom images, descriptions, and instructions

4. **Configure Equipment**:
   - Click the settings icon in the navigation bar
   - Add your available equipment and map it to generic types
   - Enable equipment filtering to show only exercises you can perform

5. **Create Workouts**:
   - Navigate to the Workouts page
   - Click "New Workout" to create a workout
   - Add one or more sessions to your workout
   - Click "Add Exercise" to browse and add exercises to a session

6. **Configure Exercises**:
   - Set sets, reps, weight, tempo, rest, and custom tips for each exercise
   - Drag and drop to reorder exercises within a session

7. **Print Workouts**:
   - Configure print settings (exercises per page, fields to show)
   - Click "Print Session" to print a single session
   - Click "Print Workout" to print all sessions in a workout

## Data Persistence

- **Exercises**: Cached in SQLite database on the backend, synced from ExerciseDB API
- **Workouts**: Stored in browser localStorage
- **Favorites**: Stored in browser localStorage
- **Custom Exercises**: Stored in browser localStorage
- **Equipment Preferences**: Stored in browser localStorage

**Note**: All frontend data (workouts, favorites, custom exercises, equipment) is stored locally in your browser. This data persists across browser sessions but is specific to the browser/device.

## API Endpoints

### Backend API

- `GET /api/exercises` - Get exercises with optional filters
  - Query params: `q`, `bodyPart`, `target`, `equipment`, `limit`, `offset`
- `GET /api/exercises/:id` - Get exercise by ID
- `GET /api/bodyparts` - Get list of available body parts
- `GET /api/targets` - Get list of available target muscles
- `GET /api/equipments` - Get list of available equipment types
- `GET /api/sync/status` - Check sync status with ExerciseDB
- `POST /api/sync` - Trigger manual sync with ExerciseDB
- `GET /health` - Health check

### ExerciseDB Integration

The backend syncs exercises from the ExerciseDB API and stores them in a local SQLite database for fast access. The sync process:
- Runs automatically on server startup if the database is empty
- Checks for updates periodically
- Can be triggered manually via the API or UI

## Development

### Adding New Features

- Frontend components are in `frontend/src/components/`
- Page components are in `frontend/src/pages/`
- API services are in `frontend/src/services/`
- Backend routes are in `backend/src/routes/`
- Backend services are in `backend/src/services/`

### Database Schema

The SQLite database schema is defined in `backend/src/db/schema.js`. The database stores:
- Exercise data synced from ExerciseDB
- Exercise metadata and relationships

## License

MIT

