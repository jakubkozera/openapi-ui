import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { useApiStore, useUIStore, useAuthStore, useFavoritesStore, useVariablesStore, useCollectionStore } from '../store';

// Reset all stores before each test
export function resetStores() {
  useApiStore.setState({
    spec: null,
    currentPath: null,
    currentMethod: null,
    isLoading: false,
    error: null,
  });

  useUIStore.setState({
    leftSidebarOpen: true,
    rightSidebarOpen: false,
    activeRightPanelSection: 'try-it-out',
    theme: 'dark',
  });

  useAuthStore.setState({
    schemes: {},
  });

  useFavoritesStore.setState({
    favorites: [],
  });

  useVariablesStore.setState({
    variables: [],
  });

  useCollectionStore.setState({
    requests: [],
    folders: [],
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialStoreState?: {
    api?: Partial<ReturnType<typeof useApiStore.getState>>;
    ui?: Partial<ReturnType<typeof useUIStore.getState>>;
    auth?: Partial<ReturnType<typeof useAuthStore.getState>>;
    favorites?: Partial<ReturnType<typeof useFavoritesStore.getState>>;
    variables?: Partial<ReturnType<typeof useVariablesStore.getState>>;
    collection?: Partial<ReturnType<typeof useCollectionStore.getState>>;
  };
}

export function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { initialStoreState, ...renderOptions } = options || {};

  // Reset stores
  resetStores();

  // Apply initial state if provided
  if (initialStoreState?.api) {
    useApiStore.setState(initialStoreState.api);
  }
  if (initialStoreState?.ui) {
    useUIStore.setState(initialStoreState.ui);
  }
  if (initialStoreState?.auth) {
    useAuthStore.setState(initialStoreState.auth);
  }
  if (initialStoreState?.favorites) {
    useFavoritesStore.setState(initialStoreState.favorites);
  }
  if (initialStoreState?.variables) {
    useVariablesStore.setState(initialStoreState.variables);
  }
  if (initialStoreState?.collection) {
    useCollectionStore.setState(initialStoreState.collection);
  }

  return render(ui, renderOptions);
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
