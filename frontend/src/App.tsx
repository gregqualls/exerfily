import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import ExercisesPage from './pages/ExercisesPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import PrintView from './pages/PrintView';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/exercises" replace />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/workouts/new" element={<WorkoutDetailPage />} />
          <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
          <Route path="/print/workout/:id" element={<PrintView />} />
          <Route path="/print/session/:id" element={<PrintView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
