import { create } from 'zustand';
import type { SecurityScheme, SecurityRequirement } from '../types/openapi';
import { useApiStore } from './apiStore';

interface AuthCredentials {
  type: 'bearer' | 'basic' | 'apiKey' | 'oauth2';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
}

interface AuthState {
  securitySchemes: Record<string, SecurityScheme>;
  credentials: Record<string, AuthCredentials>;
  currentOperationSecurity: SecurityRequirement[] | null;
  
  // Actions
  initializeFromSpec: (schemes: Record<string, SecurityScheme>) => void;
  setCredentials: (schemeKey: string, credentials: AuthCredentials) => void;
  clearCredentials: (schemeKey: string) => void;
  setCurrentOperationSecurity: (security: SecurityRequirement[] | null) => void;
  getAuthHeaders: () => Headers;
  isSchemeAuthenticated: (schemeKey: string) => boolean;
  isOperationAuthorized: () => boolean;
  loadStoredCredentials: () => void;
  saveCredentials: (schemeKey: string, credentials: AuthCredentials) => void;
}

const getStorageKey = (schemeKey: string, type: string): string => {
  const prefix = useApiStore.getState().getStoragePrefix();
  return `${prefix}_${type}_${schemeKey}`;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  securitySchemes: {},
  credentials: {},
  currentOperationSecurity: null,

  initializeFromSpec: (schemes: Record<string, SecurityScheme>) => {
    set({ securitySchemes: schemes });
    get().loadStoredCredentials();
  },

  setCredentials: (schemeKey: string, credentials: AuthCredentials) => {
    set((state) => ({
      credentials: {
        ...state.credentials,
        [schemeKey]: credentials,
      },
    }));
    get().saveCredentials(schemeKey, credentials);
  },

  clearCredentials: (schemeKey: string) => {
    set((state) => {
      const newCredentials = { ...state.credentials };
      delete newCredentials[schemeKey];
      return { credentials: newCredentials };
    });
    
    // Clear from storage
    const scheme = get().securitySchemes[schemeKey];
    if (scheme) {
      if (scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'basic') {
        localStorage.removeItem(getStorageKey(schemeKey, 'basic_auth'));
      } else if (scheme.type === 'apiKey') {
        localStorage.removeItem(getStorageKey(schemeKey, 'api_key'));
      } else {
        localStorage.removeItem(getStorageKey(schemeKey, 'access_token'));
      }
    }
  },

  setCurrentOperationSecurity: (security: SecurityRequirement[] | null) => {
    set({ currentOperationSecurity: security });
  },

  getAuthHeaders: () => {
    const headers = new Headers();
    const { credentials, securitySchemes, currentOperationSecurity } = get();
    
    if (!currentOperationSecurity || currentOperationSecurity.length === 0) {
      return headers;
    }
    
    // Find first satisfied security requirement
    for (const requirement of currentOperationSecurity) {
      const schemeKeys = Object.keys(requirement);
      const allSatisfied = schemeKeys.every((key) => get().isSchemeAuthenticated(key));
      
      if (allSatisfied) {
        for (const schemeKey of schemeKeys) {
          const scheme = securitySchemes[schemeKey];
          const cred = credentials[schemeKey];
          
          if (!scheme || !cred) continue;
          
          if (scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'bearer') {
            if (cred.token) {
              headers.append('Authorization', `Bearer ${cred.token}`);
            }
          } else if (scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'basic') {
            if (cred.username && cred.password) {
              const encoded = btoa(`${cred.username}:${cred.password}`);
              headers.append('Authorization', `Basic ${encoded}`);
            }
          } else if (scheme.type === 'apiKey' && scheme.in === 'header' && scheme.name) {
            if (cred.apiKey) {
              headers.append(scheme.name, cred.apiKey);
            }
          } else if (scheme.type === 'oauth2') {
            if (cred.token) {
              headers.append('Authorization', `Bearer ${cred.token}`);
            }
          }
        }
        break;
      }
    }
    
    return headers;
  },

  isSchemeAuthenticated: (schemeKey: string) => {
    const { credentials, securitySchemes } = get();
    const cred = credentials[schemeKey];
    const scheme = securitySchemes[schemeKey];
    
    if (!scheme || !cred) return false;
    
    if (scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'basic') {
      return !!(cred.username && cred.password);
    } else if (scheme.type === 'apiKey') {
      return !!cred.apiKey;
    } else {
      return !!cred.token;
    }
  },

  isOperationAuthorized: () => {
    const { currentOperationSecurity } = get();
    
    if (!currentOperationSecurity || currentOperationSecurity.length === 0) {
      return true;
    }
    
    return currentOperationSecurity.some((requirement) => {
      const schemeKeys = Object.keys(requirement);
      if (schemeKeys.length === 0) return true;
      return schemeKeys.every((key) => get().isSchemeAuthenticated(key));
    });
  },

  loadStoredCredentials: () => {
    const { securitySchemes } = get();
    const loadedCredentials: Record<string, AuthCredentials> = {};
    
    Object.entries(securitySchemes).forEach(([schemeKey, scheme]) => {
      if (scheme.type === 'http' && scheme.scheme?.toLowerCase() === 'basic') {
        const stored = localStorage.getItem(getStorageKey(schemeKey, 'basic_auth'));
        if (stored) {
          try {
            const { username, password } = JSON.parse(stored);
            loadedCredentials[schemeKey] = { type: 'basic', username, password };
          } catch (e) {
            console.error('Error loading basic auth credentials:', e);
          }
        }
      } else if (scheme.type === 'apiKey') {
        const apiKey = localStorage.getItem(getStorageKey(schemeKey, 'api_key'));
        if (apiKey) {
          loadedCredentials[schemeKey] = { type: 'apiKey', apiKey };
        }
      } else {
        const token = localStorage.getItem(getStorageKey(schemeKey, 'access_token'));
        if (token) {
          loadedCredentials[schemeKey] = { 
            type: scheme.type === 'oauth2' ? 'oauth2' : 'bearer', 
            token 
          };
        }
      }
    });
    
    set({ credentials: loadedCredentials });
  },

  saveCredentials: (schemeKey: string, credentials: AuthCredentials) => {
    const { securitySchemes } = get();
    const scheme = securitySchemes[schemeKey];
    
    if (!scheme) return;
    
    if (credentials.type === 'basic' && credentials.username && credentials.password) {
      localStorage.setItem(
        getStorageKey(schemeKey, 'basic_auth'),
        JSON.stringify({ username: credentials.username, password: credentials.password })
      );
    } else if (credentials.type === 'apiKey' && credentials.apiKey) {
      localStorage.setItem(getStorageKey(schemeKey, 'api_key'), credentials.apiKey);
    } else if (credentials.token) {
      localStorage.setItem(getStorageKey(schemeKey, 'access_token'), credentials.token);
    }
  },
}));
