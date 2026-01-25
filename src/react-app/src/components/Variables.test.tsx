import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, resetStores } from '../test/test-utils';
import { Variables } from './Variables';
import { useVariablesStore } from '../store';

describe('Variables', () => {
  beforeEach(() => {
    resetStores();
  });

  it('renders empty state when no variables exist', () => {
    render(<Variables />);
    
    expect(screen.getByText(/no variables defined yet/i)).toBeInTheDocument();
    expect(screen.getByText('0 variables defined')).toBeInTheDocument();
  });

  it('shows add variable button', () => {
    render(<Variables />);
    
    const addButton = screen.getByRole('button', { name: /add variable/i });
    expect(addButton).toBeInTheDocument();
  });

  it('displays variable format hint', () => {
    render(<Variables />);
    
    expect(screen.getByText(/{{variableName}}/)).toBeInTheDocument();
  });

  it('renders existing variables', () => {
    render(<Variables />, {
      initialStoreState: {
        variables: {
          variables: [
            { name: 'apiKey', value: 'test-key-123', enabled: true },
            { name: 'baseUrl', value: 'https://api.example.com', enabled: true },
          ],
        },
      },
    });

    expect(screen.getByDisplayValue('apiKey')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-key-123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('baseUrl')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://api.example.com')).toBeInTheDocument();
    expect(screen.getByText('2 variables defined')).toBeInTheDocument();
  });

  it('shows clear all button when variables exist', () => {
    render(<Variables />, {
      initialStoreState: {
        variables: {
          variables: [
            { name: 'test', value: 'value', enabled: true },
          ],
        },
      },
    });

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('adds new variable when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<Variables />);

    const addButton = screen.getByRole('button', { name: /add variable/i });
    await user.click(addButton);

    const state = useVariablesStore.getState();
    expect(state.variables).toHaveLength(1);
    expect(state.variables[0]).toEqual({
      name: '',
      value: '',
      enabled: true,
    });
  });

  it('updates variable name', async () => {
    const user = userEvent.setup();
    render(<Variables />, {
      initialStoreState: {
        variables: {
          variables: [
            { name: '', value: '', enabled: true },
          ],
        },
      },
    });

    const nameInput = screen.getAllByPlaceholderText(/variable name/i)[0];
    await user.type(nameInput, 'myVar');

    const state = useVariablesStore.getState();
    expect(state.variables[0].name).toBe('myVar');
  });

  it('updates variable value', async () => {
    const user = userEvent.setup();
    render(<Variables />, {
      initialStoreState: {
        variables: {
          variables: [
            { name: 'test', value: '', enabled: true },
          ],
        },
      },
    });

    const valueInput = screen.getByPlaceholderText(/variable value/i);
    await user.type(valueInput, 'myValue');

    const state = useVariablesStore.getState();
    expect(state.variables[0].value).toBe('myValue');
  });

  it('toggles variable enabled state', async () => {
    const user = userEvent.setup();
    render(<Variables />, {
      initialStoreState: {
        variables: {
          variables: [
            { name: 'test', value: 'value', enabled: true },
          ],
        },
      },
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const state = useVariablesStore.getState();
    expect(state.variables[0].enabled).toBe(false);
  });

  it('deletes variable when delete button clicked', async () => {
    const user = userEvent.setup();
    render(<Variables />, {
      initialStoreState: {
        variables: {
          variables: [
            { name: 'test1', value: 'value1', enabled: true },
            { name: 'test2', value: 'value2', enabled: true },
          ],
        },
      },
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    const state = useVariablesStore.getState();
    expect(state.variables).toHaveLength(1);
    expect(state.variables[0].name).toBe('test2');
  });

  it('clears all variables when clear all clicked', async () => {
    const user = userEvent.setup();
    render(<Variables />, {
      initialStoreState: {
        variables: {
          variables: [
            { name: 'test1', value: 'value1', enabled: true },
            { name: 'test2', value: 'value2', enabled: true },
          ],
        },
      },
    });

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearButton);

    const state = useVariablesStore.getState();
    expect(state.variables).toHaveLength(0);
  });

  it('hides clear all button when no variables', () => {
    render(<Variables />);
    
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
  });
});
