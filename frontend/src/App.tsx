import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import NavBar from './components/NavBar';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseCarouselPage from './pages/ExerciseCarouselPage';
import FavoritesPage from './pages/FavoritesPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import PrintView from './pages/PrintView';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen theme-bg animate-fade-in">
          <NavBar />
          <Routes>
            <Route path="/" element={<Navigate to="/exercises" replace />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/exercises/carousel" element={<ExerciseCarouselPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/workouts/new" element={<WorkoutDetailPage />} />
            <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
            <Route path="/print/workout/:id" element={<PrintView />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
