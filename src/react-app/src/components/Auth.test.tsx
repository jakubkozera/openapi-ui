import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, resetStores } from '../test/test-utils';
import { Auth } from './Auth';

describe('Auth', () => {
  beforeEach(() => {
    resetStores();
  });

  it('renders auth section title', () => {
    render(<Auth />);
    
    expect(screen.getByText('Authentication')).toBeInTheDocument();
  });

  it('shows empty state when no security schemes defined', () => {
    render(<Auth />, {
      initialStoreState: {
        auth: {
          schemes: {},
        },
      },
    });

    expect(screen.getByText(/no authentication configured/i)).toBeInTheDocument();
  });

  it('renders API key authentication scheme', () => {
    render(<Auth />, {
      initialStoreState: {
        auth: {
          schemes: {
            apiKey: {
              type: 'apiKey',
              name: 'X-API-Key',
              in: 'header',
              value: '',
            },
          },
        },
      },
    });

    expect(screen.getByText(/API Key/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter API key/i)).toBeInTheDocument();
  });

  it('renders HTTP bearer authentication scheme', () => {
    render(<Auth />, {
      initialStoreState: {
        auth: {
          schemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              value: '',
            },
          },
        },
      },
    });

    expect(screen.getByText(/Bearer Token/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter bearer token/i)).toBeInTheDocument();
  });

  it('renders HTTP basic authentication scheme', () => {
    render(<Auth />, {
      initialStoreState: {
        auth: {
          schemes: {
            basicAuth: {
              type: 'http',
              scheme: 'basic',
              username: '',
              password: '',
            },
          },
        },
      },
    });

    expect(screen.getByText(/Basic Auth/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  it('updates API key value when input changes', async () => {
    const user = userEvent.setup();
    render(<Auth />, {
      initialStoreState: {
        auth: {
          schemes: {
            apiKey: {
              type: 'apiKey',
              name: 'X-API-Key',
              in: 'header',
              value: '',
            },
          },
        },
      },
    });

    const input = screen.getByPlaceholderText(/Enter API key/i);
    await user.type(input, 'test-api-key-123');

    expect(input).toHaveValue('test-api-key-123');
  });

  it('displays multiple authentication schemes', () => {
    render(<Auth />, {
      initialStoreState: {
        auth: {
          schemes: {
            apiKey: {
              type: 'apiKey',
              name: 'X-API-Key',
              in: 'header',
              value: '',
            },
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              value: '',
            },
          },
        },
      },
    });

    expect(screen.getByText(/API Key/i)).toBeInTheDocument();
    expect(screen.getByText(/Bearer Token/i)).toBeInTheDocument();
  });

  it('shows OAuth2 authentication scheme', () => {
    render(<Auth />, {
      initialStoreState: {
        auth: {
          schemes: {
            oauth2: {
              type: 'oauth2',
              flows: {
                authorizationCode: {
                  authorizationUrl: 'https://example.com/oauth/authorize',
                  tokenUrl: 'https://example.com/oauth/token',
                  scopes: {},
                },
              },
            },
          },
        },
      },
    });

    expect(screen.getByText(/OAuth2/i)).toBeInTheDocument();
  });
});
