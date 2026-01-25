import { create } from 'zustand';

type Theme = 'dark' | 'light';
type RightPanelSection = 'try-it-out' | 'auth' | 'variables' | 'collection-runner' | 'code-snippet';

interface UIState {
  theme: Theme;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeRightPanelSection: RightPanelSection;
  requestTab: 'request' | 'response';
  collectionTab: 'collection' | 'results' | 'saved';
  codeSnippetTab: 'snippets' | 'api-clients';
  isExecuting: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setActiveRightPanelSection: (section: RightPanelSection) => void;
  setRequestTab: (tab: 'request' | 'response') => void;
  setCollectionTab: (tab: 'collection' | 'results' | 'saved') => void;
  setCodeSnippetTab: (tab: 'snippets' | 'api-clients') => void;
  setIsExecuting: (executing: boolean) => void;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('openapi-ui-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  activeRightPanelSection: 'try-it-out',
  requestTab: 'request',
  collectionTab: 'collection',
  codeSnippetTab: 'snippets',
  isExecuting: false,

  setTheme: (theme: Theme) => {
    localStorage.setItem('openapi-ui-theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  setLeftSidebarOpen: (open: boolean) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open: boolean) => set({ rightSidebarOpen: open }),
  setActiveRightPanelSection: (section: RightPanelSection) => set({ activeRightPanelSection: section }),
  setRequestTab: (tab: 'request' | 'response') => set({ requestTab: tab }),
  setCollectionTab: (tab: 'collection' | 'results' | 'saved') => set({ collectionTab: tab }),
  setCodeSnippetTab: (tab: 'snippets' | 'api-clients') => set({ codeSnippetTab: tab }),
  setIsExecuting: (executing: boolean) => set({ isExecuting: executing }),
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = getInitialTheme();
  document.documentElement.classList.toggle('light', theme === 'light');
}
