'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuraDatabaseHealth {
  healthy: boolean;
  services: {
    database: { connected: boolean; error?: string };
    embeddings: { enabled: boolean; provider?: string | null; error?: string };
    vectorStore: { available: boolean; error?: string };
  };
  timestamp: string;
  message: string;
}

interface DatabaseContextType {
  health: AuraDatabaseHealth | null;
  isLoading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [health, setHealth] = useState<AuraDatabaseHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/database/health');
      const currentHealth = await response.json();
      setHealth(currentHealth);
      if (!currentHealth.healthy) {
        setError(currentHealth.message);
      } else {
        setError(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch database health:', err);
      setError(`Failed to fetch database health: ${err.message || err}`);
      setHealth({
        healthy: false,
        services: {
          database: { connected: false, error: err.message || String(err) },
          embeddings: { enabled: false },
          vectorStore: { available: false }
        },
        timestamp: new Date().toISOString(),
        message: 'Database health check failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Initializing Database Provider (API-based)...');
    fetchHealth();

    const interval = setInterval(fetchHealth, 30000); // Check health every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <DatabaseContext.Provider value={{ health, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
