import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Exerfy
          </Link>
          <div className="flex gap-6">
            <Link
              to="/exercises"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/exercises'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Exercises
            </Link>
            <Link
              to="/workouts"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/workouts'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Workouts
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

