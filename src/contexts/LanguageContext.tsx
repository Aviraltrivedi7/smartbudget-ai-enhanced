import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { getTranslation } from '@/utils/languages';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  useEffect(() => {
    localStorage.setItem('app_language', 'en');
  }, []);

  const setLanguage = () => {};

  const t = (key: string): string => {
    return getTranslation(key, 'en');
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage: 'en', setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
