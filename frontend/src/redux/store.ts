import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';

// This creates a Redux store, and also auto-detects the Redux DevTools
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      movies: movieReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;

// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Client-side store
let clientStore: AppStore | undefined;

// Get or create the client-side store (singleton pattern for CSR)
export const getClientStore = () => {
  // For SSR, always create a new store for each request
  if (typeof window === 'undefined') {
    return makeStore();
  }
  
  // Create store if unavailable on the client
  if (!clientStore) {
    clientStore = makeStore();
  }
  
  return clientStore;
};

// For backwards compatibility
export const store = getClientStore(); 