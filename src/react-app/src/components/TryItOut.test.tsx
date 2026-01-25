import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, resetStores } from '../test/test-utils';
import { TryItOut } from './TryItOut';

describe('TryItOut', () => {
  beforeEach(() => {
    resetStores();
  });

  it('renders endpoint method and path', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users': {
                get: {
                  summary: 'Get all users',
                },
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('/api/users')).toBeInTheDocument();
  });

  it('displays endpoint summary', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users/{id}',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users/{id}': {
                get: {
                  summary: 'Get user by ID',
                },
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByText('Get user by ID')).toBeInTheDocument();
  });

  it('renders path parameters', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users/{id}',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users/{id}': {
                get: {
                  parameters: [
                    {
                      name: 'id',
                      in: 'path',
                      required: true,
                      schema: { type: 'string' },
                      description: 'User identifier',
                    },
                  ],
                },
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByText(/Path Parameters/i)).toBeInTheDocument();
    expect(screen.getByLabelText('id')).toBeInTheDocument();
    expect(screen.getByText('User identifier')).toBeInTheDocument();
  });

  it('renders query parameters', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'page',
                      in: 'query',
                      schema: { type: 'integer' },
                      description: 'Page number',
                    },
                    {
                      name: 'limit',
                      in: 'query',
                      schema: { type: 'integer' },
                      description: 'Items per page',
                    },
                  ],
                },
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByText(/Query Parameters/i)).toBeInTheDocument();
    expect(screen.getByLabelText('page')).toBeInTheDocument();
    expect(screen.getByLabelText('limit')).toBeInTheDocument();
  });

  it('renders header parameters', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'X-Request-ID',
                      in: 'header',
                      schema: { type: 'string' },
                      description: 'Unique request identifier',
                    },
                  ],
                },
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByText(/Headers/i)).toBeInTheDocument();
    expect(screen.getByLabelText('X-Request-ID')).toBeInTheDocument();
  });

  it('shows request body editor for POST request', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'post',
          spec: {
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

    expect(screen.getByText(/Request Body/i)).toBeInTheDocument();
  });

  it('displays execute button', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users': {
                get: {},
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
  });

  it('updates parameter value when input changes', async () => {
    const user = userEvent.setup();
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users/{id}',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users/{id}': {
                get: {
                  parameters: [
                    {
                      name: 'id',
                      in: 'path',
                      required: true,
                      schema: { type: 'string' },
                    },
                  ],
                },
              },
            },
          } as any,
        },
      },
    });

    const input = screen.getByLabelText('id');
    await user.type(input, '123');

    expect(input).toHaveValue('123');
  });

  it('shows required badge for required parameters', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users/{id}',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users/{id}': {
                get: {
                  parameters: [
                    {
                      name: 'id',
                      in: 'path',
                      required: true,
                      schema: { type: 'string' },
                    },
                  ],
                },
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('displays response section', () => {
    render(<TryItOut />, {
      initialStoreState: {
        api: {
          currentPath: '/api/users',
          currentMethod: 'get',
          spec: {
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: 'Successful response',
                    },
                  },
                },
              },
            },
          } as any,
        },
      },
    });

    expect(screen.getByText(/Responses/i)).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Successful response')).toBeInTheDocument();
  });
});
