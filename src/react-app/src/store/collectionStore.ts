import { create } from 'zustand';
import type { CollectionRequest, CollectionResult, SavedCollection } from '../types/openapi';
import { useApiStore } from './apiStore';
import { useAuthStore } from './authStore';
import { useVariablesStore } from './variablesStore';

interface CollectionState {
  collection: CollectionRequest[];
  results: CollectionResult[];
  isRunning: boolean;
  currentIndex: number;
  delay: number;
  currentCollectionName: string | null;
  
  // Actions
  addRequest: (request: Omit<CollectionRequest, 'id' | 'enabled'>) => void;
  removeRequest: (id: string) => void;
  updateRequest: (id: string, request: Partial<CollectionRequest>) => void;
  toggleRequest: (id: string) => void;
  reorderRequests: (oldIndex: number, newIndex: number) => void;
  setDelay: (delay: number) => void;
  clearCollection: () => void;
  runCollection: () => Promise<CollectionResult[]>;
  saveCollection: (name: string) => void;
  loadCollection: (name: string) => boolean;
  deleteCollection: (name: string) => boolean;
  getSavedCollections: () => { name: string; requestCount: number; updatedAt: string }[];
  setCurrentCollectionName: (name: string | null) => void;
}

const getStorageKey = (): string => {
  const prefix = useApiStore.getState().getStoragePrefix();
  return `${prefix}_collections`;
};

const getStatusText = (status: number): string => {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };
  return statusTexts[status] || '';
};

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collection: [],
  results: [],
  isRunning: false,
  currentIndex: 0,
  delay: 0,
  currentCollectionName: null,

  addRequest: (request) => {
    const newRequest: CollectionRequest = {
      ...request,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      enabled: true,
    };
    set((state) => ({ collection: [...state.collection, newRequest] }));
  },

  removeRequest: (id: string) => {
    set((state) => ({
      collection: state.collection.filter((r) => r.id !== id),
    }));
  },

  updateRequest: (id: string, request: Partial<CollectionRequest>) => {
    set((state) => ({
      collection: state.collection.map((r) =>
        r.id === id ? { ...r, ...request } : r
      ),
    }));
  },

  toggleRequest: (id: string) => {
    set((state) => ({
      collection: state.collection.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  },

  reorderRequests: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const newCollection = [...state.collection];
      const [removed] = newCollection.splice(oldIndex, 1);
      newCollection.splice(newIndex, 0, removed);
      return { collection: newCollection };
    });
  },

  setDelay: (delay: number) => set({ delay }),

  clearCollection: () => set({ collection: [], results: [], currentCollectionName: null }),

  runCollection: async () => {
    const { collection, delay } = get();
    const enabledRequests = collection.filter((r) => r.enabled);
    
    if (enabledRequests.length === 0) {
      return [];
    }
    
    set({ isRunning: true, results: [], currentIndex: 0 });
    const results: CollectionResult[] = [];
    const baseUrl = useApiStore.getState().baseUrl;
    const replaceVariables = useVariablesStore.getState().replaceVariables;
    
    for (let i = 0; i < enabledRequests.length; i++) {
      const request = enabledRequests[i];
      set({ currentIndex: i });
      
      const startTime = performance.now();
      let result: CollectionResult;
      
      try {
        // Apply variable replacement
        let path = replaceVariables(request.path);
        
        // Replace path parameters
        if (request.pathParams) {
          Object.entries(request.pathParams).forEach(([name, value]) => {
            path = path.replace(`{${name}}`, replaceVariables(value));
          });
        }
        
        // Build URL with query parameters
        let url = path.startsWith('http') ? path : `${baseUrl}${path}`;
        
        if (request.queryParams) {
          const params = new URLSearchParams();
          Object.entries(request.queryParams).forEach(([name, value]) => {
            params.append(name, replaceVariables(value));
          });
          const queryString = params.toString();
          if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
          }
        }
        
        // Build headers
        const headers = useAuthStore.getState().getAuthHeaders();
        if (request.headers) {
          Object.entries(request.headers).forEach(([name, value]) => {
            headers.append(name, replaceVariables(value));
          });
        }
        
        // Build fetch options
        const fetchOptions: RequestInit = {
          method: request.method.toUpperCase(),
          headers,
        };
        
        if (['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase()) && request.body) {
          fetchOptions.body = replaceVariables(request.body);
        }
        
        const response = await fetch(url, fetchOptions);
        const responseText = await response.text();
        
        let responseBody;
        try {
          responseBody = JSON.parse(responseText);
        } catch {
          responseBody = responseText;
        }
        
        result = {
          request,
          response: {
            status: response.status,
            statusText: getStatusText(response.status),
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
          },
          duration: performance.now() - startTime,
          timestamp: new Date().toISOString(),
        };
        
        // Extract output parameters
        if (request.outputParameters && response.ok && typeof responseBody === 'object') {
          request.outputParameters.forEach((param) => {
            try {
              const value = evaluateJsonPath(responseBody, param.jsonPath);
              if (value !== undefined) {
                useVariablesStore.getState().setOutput(param.name, String(value));
              }
            } catch (e) {
              console.warn(`Failed to extract ${param.name}:`, e);
            }
          });
        }
      } catch (error) {
        result = {
          request,
          response: {
            status: 'Error',
            statusText: error instanceof Error ? error.message : 'Unknown error',
            headers: {},
            body: null,
          },
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: performance.now() - startTime,
          timestamp: new Date().toISOString(),
        };
      }
      
      results.push(result);
      set({ results: [...results] });
      
      // Wait for delay before next request
      if (delay > 0 && i < enabledRequests.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    
    set({ isRunning: false });
    return results;
  },

  saveCollection: (name: string) => {
    const { collection, delay } = get();
    const storageKey = getStorageKey();
    
    const collectionsStr = localStorage.getItem(storageKey) || '{}';
    const collections = JSON.parse(collectionsStr);
    
    collections[name] = {
      requests: collection,
      delay,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(storageKey, JSON.stringify(collections));
    set({ currentCollectionName: name });
  },

  loadCollection: (name: string) => {
    const storageKey = getStorageKey();
    const collectionsStr = localStorage.getItem(storageKey) || '{}';
    const collections = JSON.parse(collectionsStr);
    
    if (collections[name]) {
      set({
        collection: collections[name].requests || [],
        delay: collections[name].delay || 0,
        currentCollectionName: name,
        results: [],
      });
      return true;
    }
    return false;
  },

  deleteCollection: (name: string) => {
    const storageKey = getStorageKey();
    const collectionsStr = localStorage.getItem(storageKey) || '{}';
    const collections = JSON.parse(collectionsStr);
    
    if (collections[name]) {
      delete collections[name];
      localStorage.setItem(storageKey, JSON.stringify(collections));
      return true;
    }
    return false;
  },

  getSavedCollections: () => {
    const storageKey = getStorageKey();
    const collectionsStr = localStorage.getItem(storageKey) || '{}';
    const collections = JSON.parse(collectionsStr);
    
    return Object.entries(collections).map(([name, data]: [string, unknown]) => {
      const collection = data as SavedCollection;
      return {
        name,
        requestCount: collection.requests?.length || 0,
        updatedAt: collection.updatedAt || '',
      };
    });
  },

  setCurrentCollectionName: (name: string | null) => set({ currentCollectionName: name }),
}));

// Simple JSONPath evaluator
function evaluateJsonPath(obj: unknown, path: string): unknown {
  if (!path || !path.startsWith('$.')) {
    throw new Error('JSONPath must start with $.');
  }
  
  const parts = path.substring(2).split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, propName, index] = arrayMatch;
      if (propName) {
        current = (current as Record<string, unknown>)[propName];
      }
      if (Array.isArray(current)) {
        current = current[parseInt(index, 10)];
      } else {
        return undefined;
      }
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }
  
  return current;
}
