'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeAuraDatabase, checkAuraDatabaseHealth } from '@/lib/database';

interface DatabaseContextType {
  isInitialized: boolean;
  isConnected: boolean;
  error: string | null;
  services: {
    database: boolean;
    embeddings: boolean;
    vectorStore: boolean;
  };
  reinitialize: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState({
    database: false,
    embeddings: false,
    vectorStore: false
  });

  const initializeDatabase = async () => {
    try {
      console.log('🔄 Initializing Aura Database...');
      setError(null);

      // Initialize the database system
      const result = await initializeAuraDatabase();
      
      if (result.success) {
        setServices(result.services);
        setIsInitialized(true);
        setIsConnected(true);
        console.log('✅ Aura Database initialized successfully');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
      setError(errorMessage);
      setIsInitialized(false);
      setIsConnected(false);
      console.error('❌ Database initialization failed:', errorMessage);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Periodic health check
  useEffect(() => {
    if (!isInitialized) return;

    const healthCheck = async () => {
      try {
        const health = await checkAuraDatabaseHealth();
        setIsConnected(health.healthy);
        setServices({
          database: health.services.database.connected,
          embeddings: health.services.embeddings.enabled,
          vectorStore: health.services.vectorStore.available
        });
      } catch (err) {
        console.warn('Database health check failed:', err);
        setIsConnected(false);
      }
    };

    // Check health every 30 seconds
    const interval = setInterval(healthCheck, 30000);
    return () => clearInterval(interval);
  }, [isInitialized]);

  const value: DatabaseContextType = {
    isInitialized,
    isConnected,
    error,
    services,
    reinitialize: initializeDatabase
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
}

export function DatabaseStatus() {
  const { isInitialized, isConnected, error, services } = useDatabaseContext();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-red-500">❌</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Database Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-yellow-500">🔄</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Initializing Database</h3>
            <p className="text-sm text-yellow-700 mt-1">Setting up Aura database system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 m-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-green-500">✅</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">Database Connected</h3>
          <div className="text-sm text-green-700 mt-1">
            Services: Database {services.database ? '✅' : '❌'} | 
            Embeddings {services.embeddings ? '✅' : '⚠️'} | 
            Vector Store {services.vectorStore ? '✅' : '⚠️'}
          </div>
        </div>
      </div>
    </div>
  );
}

