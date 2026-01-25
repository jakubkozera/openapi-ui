import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, resetStores } from '../test/test-utils';
import { CodeSnippets } from './CodeSnippets';

describe('CodeSnippets', () => {
  beforeEach(() => {
    resetStores();
  });

  it('renders code snippets title', () => {
    render(<CodeSnippets />);
    
    expect(screen.getByText('Code Snippets')).toBeInTheDocument();
  });

  it('shows language selector', () => {
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
        },
      },
    });

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders JavaScript option by default', () => {
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
        },
      },
    });

    expect(screen.getByText(/JavaScript/i)).toBeInTheDocument();
  });

  it('shows copy button', () => {
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
        },
      },
    });

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('displays code snippet for current endpoint', () => {
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
          spec: {
            servers: [{ url: 'https://api.example.com' }],
          } as any,
        },
      },
    });

    // Code editor should be present
    const codeEditor = screen.getByRole('textbox', { hidden: true });
    expect(codeEditor).toBeInTheDocument();
  });

  it('changes language when selector is changed', async () => {
    const user = userEvent.setup();
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
        },
      },
    });

    const selector = screen.getByRole('combobox');
    await user.selectOptions(selector, 'curl');

    expect(screen.getByText(/cURL/i)).toBeInTheDocument();
  });

  it('shows multiple language options', () => {
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
        },
      },
    });

    const selector = screen.getByRole('combobox');
    expect(selector).toHaveTextContent(/JavaScript/i);
    
    // Check if options exist in the select
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
  });

  it('generates code for POST request with body', () => {
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'post',
          spec: {
            servers: [{ url: 'https://api.example.com' }],
            paths: {
              '/api/users': {
                post: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          } as any,
        },
      },
    });

    const codeEditor = screen.getByRole('textbox', { hidden: true });
    expect(codeEditor).toBeInTheDocument();
  });

  it('displays empty state when no endpoint selected', () => {
    render(<CodeSnippets />, {
      initialStoreState: {
        api: {
          currentPath: null,
          currentMethod: null,
        },
      },
    });

    expect(screen.getByText(/select an endpoint/i)).toBeInTheDocument();
  });
});
