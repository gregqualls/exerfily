import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import EquipmentSettingsModal from './EquipmentSettingsModal';
import { checkSyncStatus, triggerSync, type SyncStatus } from '../services/api';

export default function NavBar() {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Check sync status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkSyncStatus();
        setSyncStatus(status);
        if (status.updateAvailable) {
          setShowUpdateNotification(true);
        }
      } catch (error) {
        console.error('Error checking sync status:', error);
      }
    };

    checkStatus();
    // Check every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await triggerSync(false);
      if (result.success) {
        setShowUpdateNotification(false);
        // Refresh sync status
        const status = await checkSyncStatus();
        setSyncStatus(status);
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {showUpdateNotification && syncStatus?.updateAvailable && (
        <div className="sticky top-0 z-[60] bg-primary-600 text-white px-4 py-2 animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium">
                Exercise database update available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3 py-1 bg-white text-primary-600 rounded text-sm font-medium hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSyncing ? 'Syncing...' : 'Update Now'}
              </button>
              <button
                onClick={() => setShowUpdateNotification(false)}
                className="p-1 text-white hover:bg-white/20 rounded transition-colors"
                aria-label="Dismiss"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <nav className="sticky top-0 z-50 bg-surface backdrop-blur-sm shadow-sm border-b border-border print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 animate-fade-in hover:opacity-80 exerfily-logo-text">
              <svg 
                className="w-8 h-8 animate-float" 
                width="64" 
                height="64" 
                viewBox="0 0 64 64" 
                xmlns="http://www.w3.org/2000/svg" 
                role="img" 
                aria-label="Exerfily icon"
              >
                <title>Exerfily icon</title>
                <defs>
                  <linearGradient id="exerfilyIconGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4"/>
                    <stop offset="100%" stopColor="#A855F7"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="56" height="56" rx="16" fill="#E0F7FA"/>
                <rect x="12" y="16" width="40" height="9" rx="4.5" fill="url(#exerfilyIconGrad2)"/>
                <rect x="12" y="27.5" width="32" height="9" rx="4.5" fill="url(#exerfilyIconGrad2)"/>
                <rect x="12" y="39" width="40" height="9" rx="4.5" fill="url(#exerfilyIconGrad2)"/>
              </svg>
              <span className="text-2xl font-bold exerfily-logo-text">Exerfily</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/exercises"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/exercises'
                    ? 'bg-primary-600 text-white shadow-md btn-glow'
                    : 'text-primary-500 hover:bg-primary-50'
                }`}
              >
                Exercises
              </Link>
              <Link
                to="/favorites"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/favorites'
                    ? 'bg-primary-600 text-white shadow-md btn-glow'
                    : 'text-primary-500 hover:bg-primary-50'
                }`}
              >
                Favorites
              </Link>
              <Link
                to="/workouts"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/workouts'
                    ? 'bg-primary-600 text-white shadow-md btn-glow'
                    : 'text-primary-500 hover:bg-primary-50'
                }`}
              >
                Workouts
              </Link>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Equipment Settings"
                aria-label="Equipment Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <EquipmentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

