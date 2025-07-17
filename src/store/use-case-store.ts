import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UseCase, mockUseCases } from '@/lib/mock-data';

interface UseCaseStore {
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  addUseCase: (useCase: Omit<UseCase, 'id' | 'businessBriefId' | 'submittedAt'>) => void;
  updateUseCase: (id: string, updates: Partial<UseCase>) => void;
  deleteUseCase: (id: string) => void;
  selectUseCase: (id: string) => void;
  clearSelection: () => void;
  getUseCaseById: (id: string) => UseCase | undefined;
  getUseCasesByStatus: (status: UseCase['status']) => UseCase[];
}

export const useUseCaseStore = create<UseCaseStore>()(
  persist(
    (set, get) => ({
  useCases: mockUseCases,
  selectedUseCase: null,

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
}),
{
  name: 'use-case-storage',
  // Persist all use case data
}
)
); 