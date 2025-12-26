'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const showLoading = useCallback((customMessage?: string) => {
    if (customMessage) {
      setMessage(customMessage);
    }
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingMessage = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  const value: LoadingContextType = {
    isLoading,
    message,
    showLoading,
    hideLoading,
    setLoadingMessage
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
