// context/UserContext.js
import React, { createContext, useContext } from 'react';

// Create the context object
export const UserContext = createContext(null);

// Custom hook for easier consumption (optional but good practice)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};