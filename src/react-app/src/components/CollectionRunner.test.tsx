import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, resetStores } from '../test/test-utils';
import { CollectionRunner } from './CollectionRunner';
import { useCollectionStore } from '../store';

describe('CollectionRunner', () => {
  beforeEach(() => {
    resetStores();
  });

  it('renders collection runner title', () => {
    render(<CollectionRunner />);
    
    expect(screen.getByText('Collection Runner')).toBeInTheDocument();
  });

  it('shows empty state when no requests in collection', () => {
    render(<CollectionRunner />);
    
    expect(screen.getByText(/no requests in collection/i)).toBeInTheDocument();
  });

  it('shows add to collection button', () => {
    render(<CollectionRunner />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
        },
      },
    });

    expect(screen.getByRole('button', { name: /add to collection/i })).toBeInTheDocument();
  });

  it('displays collection requests', () => {
    render(<CollectionRunner />, {
      initialStoreState: {
        collection: {
          requests: [
            {
              id: '1',
              name: 'Get Users',
              method: 'get',
              path: '/api/users',
              enabled: true,
            },
            {
              id: '2',
              name: 'Create User',
              method: 'post',
              path: '/api/users',
              enabled: true,
            },
          ],
          folders: [],
        },
      },
    });

    expect(screen.getByText('Get Users')).toBeInTheDocument();
    expect(screen.getByText('Create User')).toBeInTheDocument();
    expect(screen.getByText('2 requests')).toBeInTheDocument();
  });

  it('adds current endpoint to collection', async () => {
    const user = userEvent.setup();
    render(<CollectionRunner />, {
      initialStoreState: {
        api: {
          currentPath: '/api/test',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/test': {
                get: {
                  summary: 'Test endpoint',
                },
              },
            },
          } as any,
        },
      },
    });

    const addButton = screen.getByRole('button', { name: /add to collection/i });
    await user.click(addButton);

    const state = useCollectionStore.getState();
    expect(state.requests).toHaveLength(1);
    expect(state.requests[0].path).toBe('/api/test');
    expect(state.requests[0].method).toBe('get');
  });

  it('toggles request enabled state', async () => {
    const user = userEvent.setup();
    render(<CollectionRunner />, {
      initialStoreState: {
        collection: {
          requests: [
            {
              id: '1',
              name: 'Test Request',
              method: 'get',
              path: '/api/test',
              enabled: true,
            },
          ],
          folders: [],
        },
      },
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const state = useCollectionStore.getState();
    expect(state.requests[0].enabled).toBe(false);
  });

  it('removes request from collection', async () => {
    const user = userEvent.setup();
    render(<CollectionRunner />, {
      initialStoreState: {
        collection: {
          requests: [
            {
              id: '1',
              name: 'Test Request',
              method: 'get',
              path: '/api/test',
              enabled: true,
            },
          ],
          folders: [],
        },
      },
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    const state = useCollectionStore.getState();
    expect(state.requests).toHaveLength(0);
  });

  it('shows run collection button when requests exist', () => {
    render(<CollectionRunner />, {
      initialStoreState: {
        collection: {
          requests: [
            {
              id: '1',
              name: 'Test',
              method: 'get',
              path: '/test',
              enabled: true,
            },
          ],
          folders: [],
        },
      },
    });

    expect(screen.getByRole('button', { name: /run collection/i })).toBeInTheDocument();
  });

  it('clears all requests when clear collection clicked', async () => {
    const user = userEvent.setup();
    render(<CollectionRunner />, {
      initialStoreState: {
        collection: {
          requests: [
            {
              id: '1',
              name: 'Test 1',
              method: 'get',
              path: '/test1',
              enabled: true,
            },
            {
              id: '2',
              name: 'Test 2',
              method: 'post',
              path: '/test2',
              enabled: true,
            },
          ],
          folders: [],
        },
      },
    });

    const clearButton = screen.getByRole('button', { name: /clear collection/i });
    await user.click(clearButton);

    const state = useCollectionStore.getState();
    expect(state.requests).toHaveLength(0);
  });
});
