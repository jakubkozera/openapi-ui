import { create } from 'zustand';
import type { OpenAPISpec, EndpointInfo, HttpMethod } from '../types/openapi';

interface ApiState {
  spec: OpenAPISpec | null;
  isLoading: boolean;
  error: string | null;
  currentPath: string | null;
  currentMethod: HttpMethod | null;
  currentOperation: EndpointInfo | null;
  baseUrl: string;
  selectedServer: number;
  searchTerm: string;
  selectedHttpVerbs: string[];
  
  // Actions
  loadSpec: (url: string) => Promise<void>;
  setSpec: (spec: OpenAPISpec) => void;
  setCurrentEndpoint: (path: string, method: HttpMethod) => void;
  setBaseUrl: (url: string) => void;
  setSelectedServer: (index: number) => void;
  setSearchTerm: (term: string) => void;
  setSelectedHttpVerbs: (verbs: string[]) => void;
  getStoragePrefix: () => string;
}

export const useApiStore = create<ApiState>((set, get) => ({
  spec: null,
  isLoading: false,
  error: null,
  currentPath: null,
  currentMethod: null,
  currentOperation: null,
  baseUrl: '',
  selectedServer: 0,
  searchTerm: '',
  selectedHttpVerbs: [],

  loadSpec: async (url: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: OpenAPISpec = await response.json();
      
      // Set base URL from servers
      let baseUrl = '';
      if (data.servers && data.servers.length > 0) {
        baseUrl = data.servers[0].url;
        // Handle relative URLs
        if (baseUrl.startsWith('/')) {
          baseUrl = window.location.origin + baseUrl;
        }
      }
      
      set({ 
        spec: data, 
        isLoading: false,
        baseUrl,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load spec',
        isLoading: false 
      });
    }
  },

  setSpec: (spec: OpenAPISpec) => {
    let baseUrl = '';
    if (spec.servers && spec.servers.length > 0) {
      baseUrl = spec.servers[0].url;
      if (baseUrl.startsWith('/')) {
        baseUrl = window.location.origin + baseUrl;
      }
    }
    set({ spec, baseUrl });
  },

  setCurrentEndpoint: (path: string, method: HttpMethod) => {
    const { spec } = get();
    if (!spec || !spec.paths[path] || !spec.paths[path][method]) {
      return;
    }
    
    const operation = spec.paths[path][method]!;
    const tag = operation.tags?.[0] || 'default';
    
    set({
      currentPath: path,
      currentMethod: method,
      currentOperation: {
        path,
        method,
        operation,
        tag,
      },
    });
  },

  setBaseUrl: (url: string) => set({ baseUrl: url }),
  
  setSelectedServer: (index: number) => {
    const { spec } = get();
    if (spec?.servers && spec.servers[index]) {
      let baseUrl = spec.servers[index].url;
      if (baseUrl.startsWith('/')) {
        baseUrl = window.location.origin + baseUrl;
      }
      set({ selectedServer: index, baseUrl });
    }
  },

  setSearchTerm: (term: string) => set({ searchTerm: term }),
  
  setSelectedHttpVerbs: (verbs: string[]) => set({ selectedHttpVerbs: verbs }),

  getStoragePrefix: () => {
    const { spec } = get();
    if (!spec?.info?.title || !spec?.info?.version) {
      return 'openapi_ui_default';
    }
    const title = spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const version = spec.info.version.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${title}_${version}`;
  },
}));
