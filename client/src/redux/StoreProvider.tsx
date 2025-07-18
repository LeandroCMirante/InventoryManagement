"use client";

import { useRef, ReactNode } from "react";
// This is the most important import to fix the error
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import the function that creates the store and the store's type
import { makeStore, AppStore } from "./store";

export default function StoreProvider({ children }: { children: ReactNode }) {
  // useRef ensures the store is only created once per user session
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // If the store doesn't exist, create a new one
    storeRef.current = makeStore();

    // Set up RTK Query listeners for features like refetchOnFocus
    setupListeners(storeRef.current.dispatch);
  }

  // Create the persistor object, which saves and rehydrates the state
  const persistor = persistStore(storeRef.current);

  return (
    // The <Provider> component makes the store available to the entire app
    <Provider store={storeRef.current}>
      {/* The <PersistGate> delays rendering the UI until the persisted state is loaded */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
