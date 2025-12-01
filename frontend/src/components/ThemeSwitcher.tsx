import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSwitcher() {
  console.log('ThemeSwitcher component rendering...');
  
  let theme: string;
  let setTheme: (theme: 'clean' | 'mermaid' | 'dark' | 'natural' | 'neon') => void;
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    setTheme = themeContext.setTheme;
    console.log('ThemeSwitcher got theme:', theme);
  } catch (error) {
    console.error('ThemeSwitcher ERROR:', error);
    return (
      <div className="p-4 bg-error text-primary font-bold">
        ERROR: {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-secondary">Theme:</span>
      <svg
        className="w-4 h-4 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
      <div className="relative">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'clean' | 'mermaid' | 'dark' | 'natural' | 'neon')}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-primary-400 bg-surface text-primary hover:bg-muted-100 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none cursor-pointer pr-8 shadow-md min-w-[110px]"
          aria-label="Select theme"
          title="Change theme"
        >
          <option value="clean">Clean</option>
          <option value="mermaid">Mermaid</option>
          <option value="dark">Dark</option>
          <option value="natural">Natural</option>
          <option value="neon">Neon</option>
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

