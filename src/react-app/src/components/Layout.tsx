import { useEffect, useCallback, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { RightPanel } from './RightPanel';
import { useApiStore, useUIStore, useAuthStore, useFavoritesStore, useVariablesStore } from '../store';

export function Layout() {
  const { spec, loadSpec, isLoading, error } = useApiStore();
  const { leftSidebarOpen, rightSidebarOpen, setLeftSidebarOpen, setRightSidebarOpen, theme, setTheme } = useUIStore();
  const { initializeFromSpec } = useAuthStore();
  const { loadFromStorage: loadFavorites } = useFavoritesStore();
  const { loadFromStorage: loadVariables } = useVariablesStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);

  // Close sidebars helper (must be before early returns)
  const closeSidebars = useCallback(() => {
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  }, [setLeftSidebarOpen, setRightSidebarOpen]);

  // Load spec on mount
  useEffect(() => {
    loadSpec('swagger.json');
  }, [loadSpec]);

  // Initialize stores when spec loads
  useEffect(() => {
    if (spec) {
      // Initialize auth from security schemes
      if (spec.components?.securitySchemes) {
        initializeFromSpec(spec.components.securitySchemes);
      }
      
      // Load stored data
      loadFavorites();
      loadVariables();
    }
  }, [spec, initializeFromSpec, loadFavorites, loadVariables]);

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Handle responsive behavior
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(!e.matches);
      // On mobile, close panels by default on first load
      if (!e.matches && window.innerWidth < 1024) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };
    
    // Initial check
    setIsMobile(!mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, [setLeftSidebarOpen, setRightSidebarOpen]);

  // Close sidebars on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobile, setLeftSidebarOpen, setRightSidebarOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="loader mb-4">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <p className="text-[var(--text-secondary)]">Loading API specification...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-4xl mb-4">Error</div>
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={() => loadSpec('swagger.json')}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-secondary)]">No API specification loaded</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--bg-primary)]">
      {/* Mobile backdrop */}
      {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeSidebars}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
          flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)]
          transition-all duration-300 overflow-hidden
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : ''}
          ${leftSidebarOpen ? 'w-72' : 'w-0'}
        `}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[var(--bg-primary)]">
        <MainContent />
      </main>

      {/* Right Panel */}
      <aside
        className={`
          flex-shrink-0 border-l border-[var(--border)] relative
          transition-all duration-300 overflow-hidden
          ${isMobile ? 'fixed inset-y-0 right-0 z-50' : ''}
          ${rightSidebarOpen ? (isMobile ? 'w-full max-w-[500px]' : 'w-[40%]') : 'w-0'}
        `}
        style={{ maxWidth: isMobile ? '100%' : '700px' }}
      >
        <RightPanel />
      </aside>
    </div>
  );
}
