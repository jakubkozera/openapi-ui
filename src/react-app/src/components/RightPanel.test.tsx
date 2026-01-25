import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, resetStores } from '../test/test-utils';
import { RightPanel } from './RightPanel';

describe('RightPanel', () => {
  beforeEach(() => {
    resetStores();
  });

  it('renders placeholder when no endpoint is selected', () => {
    render(<RightPanel />, {
      initialStoreState: {
        api: {
          currentPath: null,
          currentMethod: null,
        },
      },
    });

    expect(screen.getByText(/select an endpoint to begin/i)).toBeInTheDocument();
  });

  it('renders vertical menu with all sections', () => {
    render(<RightPanel />);

    expect(screen.getByTitle('Try it out')).toBeInTheDocument();
    expect(screen.getByTitle('Authentication')).toBeInTheDocument();
    expect(screen.getByTitle('Variables')).toBeInTheDocument();
    expect(screen.getByTitle('Collection Runner')).toBeInTheDocument();
    expect(screen.getByTitle('Code Snippets')).toBeInTheDocument();
  });

  it('shows active section with active styling', () => {
    render(<RightPanel />, {
      initialStoreState: {
        ui: {
          activeRightPanelSection: 'auth',
        },
      },
    });

    const authButton = screen.getByTitle('Authentication');
    expect(authButton).toHaveClass('active');
  });

  it('switches sections when menu items are clicked', async () => {
    const user = userEvent.setup();
    
    render(<RightPanel />, {
      initialStoreState: {
        api: {
          currentPath: '/api/test',
          currentMethod: 'get',
        },
        ui: {
          activeRightPanelSection: 'try-it-out',
        },
      },
    });

    const authButton = screen.getByTitle('Authentication');
    await user.click(authButton);

    await waitFor(() => {
      expect(authButton).toHaveClass('active');
    });
  });

  it('renders TryItOut component when endpoint is selected and try-it-out is active', () => {
    render(<RightPanel />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
        },
        ui: {
          activeRightPanelSection: 'try-it-out',
        },
      },
    });

    // TryItOut component should be rendered (test will pass if component doesn't throw)
    expect(screen.queryByText(/select an endpoint to begin/i)).not.toBeInTheDocument();
  });

  it('applies correct styling to vertical menu', () => {
    const { container } = render(<RightPanel />);
    
    const verticalMenu = container.querySelector('.vertical-menu');
    expect(verticalMenu).toBeInTheDocument();
    expect(verticalMenu).toHaveStyle({ width: '48px' });
  });

  it('shows variables section when clicked', async () => {
    const user = userEvent.setup();
    
    render(<RightPanel />, {
      initialStoreState: {
        api: {
          currentPath: '/api/test',
          currentMethod: 'get',
        },
      },
    });

    const variablesButton = screen.getByTitle('Variables');
    await user.click(variablesButton);

    await waitFor(() => {
      expect(variablesButton).toHaveClass('active');
    });
  });

  it('shows collection runner section when clicked', async () => {
    const user = userEvent.setup();
    
    render(<RightPanel />, {
      initialStoreState: {
        api: {
          currentPath: '/api/test',
          currentMethod: 'get',
        },
      },
    });

    const collectionButton = screen.getByTitle('Collection Runner');
    await user.click(collectionButton);

    await waitFor(() => {
      expect(collectionButton).toHaveClass('active');
    });
  });

  it('shows code snippets section when clicked', async () => {
    const user = userEvent.setup();
    
    render(<RightPanel />, {
      initialStoreState: {
        api: {
          currentPath: '/api/test',
          currentMethod: 'get',
        },
      },
    });

    const codeButton = screen.getByTitle('Code Snippets');
    await user.click(codeButton);

    await waitFor(() => {
      expect(codeButton).toHaveClass('active');
    });
  });
});
