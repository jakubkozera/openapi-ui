import { create } from 'zustand';
import { useApiStore } from './apiStore';

interface VariablesState {
  variables: Map<string, string>;
  outputVariables: Map<string, string>;
  
  // Actions
  set: (name: string, value: string) => void;
  get: (name: string) => string | undefined;
  delete: (name: string) => void;
  clear: () => void;
  getAll: () => Record<string, string>;
  setOutput: (name: string, value: string) => void;
  getOutput: (name: string) => string | undefined;
  clearOutputs: () => void;
  replaceVariables: (text: string) => string;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const getStorageKey = (): string => {
  const prefix = useApiStore.getState().getStoragePrefix();
  return `${prefix}_variables`;
};

const getOutputStorageKey = (): string => {
  const prefix = useApiStore.getState().getStoragePrefix();
  return `${prefix}_output_variables`;
};

export const useVariablesStore = create<VariablesState>((set, get) => ({
  variables: new Map<string, string>(),
  outputVariables: new Map<string, string>(),

  set: (name: string, value: string) => {
    set((state) => {
      const newVars = new Map(state.variables);
      newVars.set(name, value);
      return { variables: newVars };
    });
    get().saveToStorage();
  },

  get: (name: string) => {
    return get().variables.get(name);
  },

  delete: (name: string) => {
    set((state) => {
      const newVars = new Map(state.variables);
      newVars.delete(name);
      return { variables: newVars };
    });
    get().saveToStorage();
  },

  clear: () => {
    set({ variables: new Map(), outputVariables: new Map() });
    localStorage.removeItem(getStorageKey());
    localStorage.removeItem(getOutputStorageKey());
  },

  getAll: () => {
    return Object.fromEntries(get().variables);
  },

  setOutput: (name: string, value: string) => {
    set((state) => {
      const newOutputs = new Map(state.outputVariables);
      newOutputs.set(name, value);
      return { outputVariables: newOutputs };
    });
    get().saveToStorage();
  },

  getOutput: (name: string) => {
    return get().outputVariables.get(name);
  },

  clearOutputs: () => {
    set({ outputVariables: new Map() });
    localStorage.removeItem(getOutputStorageKey());
  },

  replaceVariables: (text: string) => {
    if (!text || typeof text !== 'string') return text;
    
    // Replace output variables first {{@varName}}
    let result = text.replace(/\{\{@([^}]+)\}\}/g, (match, varName) => {
      const value = get().outputVariables.get(varName.trim());
      return value !== undefined ? value : match;
    });
    
    // Replace regular variables {{varName}}
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const cleanName = varName.trim();
      if (cleanName.startsWith('@')) return match;
      const value = get().variables.get(cleanName);
      return value !== undefined ? value : match;
    });
    
    return result;
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const data = JSON.parse(stored);
        set({ variables: new Map(Object.entries(data)) });
      }
      
      const outputStored = localStorage.getItem(getOutputStorageKey());
      if (outputStored) {
        const outputData = JSON.parse(outputStored);
        set({ outputVariables: new Map(Object.entries(outputData)) });
      }
    } catch (error) {
      console.error('Error loading variables from storage:', error);
    }
  },

  saveToStorage: () => {
    try {
      const { variables, outputVariables } = get();
      localStorage.setItem(getStorageKey(), JSON.stringify(Object.fromEntries(variables)));
      localStorage.setItem(getOutputStorageKey(), JSON.stringify(Object.fromEntries(outputVariables)));
    } catch (error) {
      console.error('Error saving variables to storage:', error);
    }
  },
}));
