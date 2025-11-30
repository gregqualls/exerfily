# Exerfy - Workout Sheet Builder

A full-stack web application for building printable workout sheets using the ExerciseDB API.

## Features

- **Exercise Browsing**: Search and filter exercises by body area, muscle group, equipment, and difficulty level
- **Workout Management**: Create, edit, duplicate, and delete workouts
- **Session Organization**: Organize workouts into multiple sessions (e.g., Day A, Day B)
- **Exercise Configuration**: Set sets, reps, weight, tempo, rest, and custom tips for each exercise
- **Print Configuration**: Customize print layouts with configurable fields and exercises per page (2, 3, or 4)
- **Print Views**: Generate printable workout sheets for individual sessions or entire workouts

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **API**: ExerciseDB API (https://exercisedb-api.vercel.app)
- **Storage**: localStorage (client-side persistence)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
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

### Building for Production

Build the frontend:
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`.

## Project Structure

```
exerfy/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API clients and localStorage
│   │   └── types/        # TypeScript interfaces
│   └── package.json
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # ExerciseDB integration
│   │   └── server.js     # Express app entry
│   └── package.json
└── package.json      # Root workspace config
```

## Usage

1. **Browse Exercises**: Navigate to the Exercises page to search and filter exercises
2. **Create Workout**: Click "New Workout" on the Workouts page
3. **Add Sessions**: Create one or more sessions within your workout
4. **Add Exercises**: Click "Add Exercise" to browse and add exercises to a session
5. **Configure Exercises**: Set sets, reps, weight, rest, and custom tips for each exercise
6. **Print**: Configure print settings and click "Print Session" or "Print Workout"

## Data Persistence

Workouts are stored in browser localStorage. Data persists across browser sessions but is specific to the browser/device.

## API Endpoints

### Backend API

- `GET /api/exercises` - Get exercises with optional filters
- `GET /api/exercises/:id` - Get exercise by ID
- `GET /health` - Health check

### ExerciseDB Integration

The backend proxies requests to the ExerciseDB API and maps responses to the application's domain model.

## License

MIT

