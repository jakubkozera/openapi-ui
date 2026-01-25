import { useUIStore, useApiStore } from '../store';
import { TryItOut } from './TryItOut';
import { Auth } from './Auth';
import { Variables } from './Variables';
import { CollectionRunner } from './CollectionRunner';
import { CodeSnippets } from './CodeSnippets';

type RightPanelSection = 'try-it-out' | 'auth' | 'variables' | 'collection-runner' | 'code-snippet';

const sections: { id: RightPanelSection; label: string; path: string }[] = [
  { 
    id: 'try-it-out', 
    label: 'Try it out', 
    path: 'M13 10V3L4 14h7v7l9-11h-7z' 
  },
  { 
    id: 'auth', 
    label: 'Authentication', 
    path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' 
  },
  { 
    id: 'variables', 
    label: 'Variables', 
    path: 'M4.745 3A23.933 23.933 0 0 0 3 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.78 1.5 5.817 1.5 9s-.533 6.22-1.5 9M8.25 8.885l1.444-.89a.75.75 0 0 1 1.105.402l2.402 7.206a.75.75 0 0 0 1.104.401l1.445-.889m-8.25.75.213.09a1.687 1.687 0 0 0 2.062-.617l4.45-6.676a1.688 1.688 0 0 1 2.062-.618l.213.09' 
  },
  { 
    id: 'collection-runner', 
    label: 'Collection Runner', 
    path: 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z' 
  },
  { 
    id: 'code-snippet', 
    label: 'Code Snippets', 
    path: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' 
  },
];

export function RightPanel() {
  const { activeRightPanelSection, setActiveRightPanelSection, rightSidebarOpen, setRightSidebarOpen } = useUIStore();
  const { currentPath, currentMethod } = useApiStore();

  const hasEndpoint = Boolean(currentPath && currentMethod);

  return (
    <div className="h-full flex bg-[var(--bg-secondary)]">
      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-[var(--bg-secondary)]">
        {!hasEndpoint ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-[var(--text-muted)] text-center">
              Select an endpoint to begin
            </p>
          </div>
        ) : (
          <div className="h-full">
            {activeRightPanelSection === 'try-it-out' && <TryItOut />}
            {activeRightPanelSection === 'auth' && <Auth />}
            {activeRightPanelSection === 'variables' && <Variables />}
            {activeRightPanelSection === 'collection-runner' && <CollectionRunner />}
            {activeRightPanelSection === 'code-snippet' && <CodeSnippets />}
          </div>
        )}
      </div>

      {/* Vertical Menu - Right Side */}
      <div className="vertical-menu shadow-lg">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`vertical-menu-icon ${activeRightPanelSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveRightPanelSection(section.id)}
            title={section.label}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={section.id === 'try-it-out' || section.id === 'code-snippet' ? 2 : 1.5} d={section.path} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
