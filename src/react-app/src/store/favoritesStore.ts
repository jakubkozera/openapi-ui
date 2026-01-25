import { create } from 'zustand';
import type { FavoriteEndpoint } from '../types/openapi';
import { useApiStore } from './apiStore';

interface FavoritesState {
  favorites: FavoriteEndpoint[];
  
  // Actions
  toggleFavorite: (path: string, method: string, summary?: string) => boolean;
  isFavorite: (path: string, method: string) => boolean;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const getStorageKey = (): string => {
  const prefix = useApiStore.getState().getStoragePrefix();
  return `${prefix}_favorites`;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  toggleFavorite: (path: string, method: string, summary?: string) => {
    const { favorites } = get();
    const index = favorites.findIndex(
      (f) => f.path === path && f.method.toLowerCase() === method.toLowerCase()
    );
    
    if (index !== -1) {
      // Remove from favorites
      set({ favorites: favorites.filter((_, i) => i !== index) });
      get().saveToStorage();
      return false;
    } else {
      // Add to favorites
      set({ 
        favorites: [...favorites, { path, method, summary }] 
      });
      get().saveToStorage();
      return true;
    }
  },

  isFavorite: (path: string, method: string) => {
    return get().favorites.some(
      (f) => f.path === path && f.method.toLowerCase() === method.toLowerCase()
    );
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const data = JSON.parse(stored);
        set({ favorites: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
    }
  },

  saveToStorage: () => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(get().favorites));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  },
}));
