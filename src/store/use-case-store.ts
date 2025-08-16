import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UseCase, mockUseCases } from '@/lib/mock-data';

interface UseCaseStore {
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  isLoading: boolean;
  error: string | null;
  addUseCase: (useCase: Omit<UseCase, 'id' | 'businessBriefId' | 'submittedAt'>) => void;
  updateUseCase: (id: string, updates: Partial<UseCase>) => void;
  deleteUseCase: (id: string) => void;
  selectUseCase: (id: string) => void;
  clearSelection: () => void;
  getUseCaseById: (id: string) => UseCase | undefined;
  getUseCasesByStatus: (status: UseCase['status']) => UseCase[];
  loadFromDatabase: () => Promise<void>;
  deleteFromDatabase: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUseCaseStore = create<UseCaseStore>()(
  persist(
    (set, get) => ({
  useCases: [],
  selectedUseCase: null,
  isLoading: false,
  error: null,

  addUseCase: (useCase) => {
    const existingIds = get().useCases.map(uc => uc.businessBriefId || '');
    const maxNumber = Math.max(
      ...existingIds
        .filter(id => id.startsWith('BB-'))
        .map(id => parseInt(id.split('-')[1]) || 0),
      0
    );
    const nextNumber = maxNumber + 1;
    
    const newUseCase: UseCase = {
      ...useCase,
      id: `uc-${Date.now().toString(36)}`,
      businessBriefId: `BB-${nextNumber.toString().padStart(3, '0')}`,
      submittedAt: new Date(),
    };
    set((state) => ({
      useCases: [...state.useCases, newUseCase],
    }));
  },

  updateUseCase: (id, updates) => {
    set((state) => ({
      useCases: state.useCases.map((useCase) =>
        useCase.id === id ? { ...useCase, ...updates } : useCase
      ),
    }));
  },

  deleteUseCase: (id) => {
    set((state) => ({
      useCases: state.useCases.filter((useCase) => useCase.id !== id),
      selectedUseCase: state.selectedUseCase?.id === id ? null : state.selectedUseCase,
    }));
  },

  selectUseCase: (id) => {
    const useCase = get().useCases.find((uc) => uc.id === id);
    set({ selectedUseCase: useCase || null });
  },

  clearSelection: () => {
    set({ selectedUseCase: null });
  },

  getUseCaseById: (id) => {
    return get().useCases.find((useCase) => useCase.id === id);
  },

  getUseCasesByStatus: (status) => {
    return get().useCases.filter((useCase) => useCase.status === status);
  },

  loadFromDatabase: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('📋 Loading business briefs from database...');
      
      const response = await fetch('/api/business-briefs/list');
      if (!response.ok) {
        throw new Error(`Failed to load business briefs: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to load business briefs');
      }
      
      console.log('✅ Loaded business briefs from database:', result.data.length);
      set({ 
        useCases: result.data, 
        isLoading: false, 
        error: null 
      });
      
    } catch (error: any) {
      console.error('❌ Failed to load business briefs from database:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        // Keep existing mock data as fallback if database load fails
        useCases: get().useCases.length === 0 ? mockUseCases : get().useCases
      });
    }
  },

  setError: (error) => {
    set({ error });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  deleteFromDatabase: async (id: string) => {
    try {
      console.log('🗑️ Deleting business brief from database:', id);
      
      const response = await fetch(`/api/business-briefs/delete?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete business brief');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete business brief');
      }
      
      console.log('✅ Business brief deleted from database successfully');
      
      // Remove from local store
      set((state) => ({
        useCases: state.useCases.filter((useCase) => useCase.id !== id),
        selectedUseCase: state.selectedUseCase?.id === id ? null : state.selectedUseCase,
      }));
      
    } catch (error: any) {
      console.error('❌ Failed to delete business brief from database:', error);
      throw error; // Re-throw so calling component can handle the error
    }
  },
}),
{
  name: 'use-case-storage',
  // Persist all use case data
}
)
); 