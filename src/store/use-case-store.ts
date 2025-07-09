import { create } from 'zustand';
import { UseCase, mockUseCases } from '@/lib/mock-data';

interface UseCaseStore {
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  addUseCase: (useCase: Omit<UseCase, 'id' | 'submittedAt'>) => void;
  updateUseCase: (id: string, updates: Partial<UseCase>) => void;
  deleteUseCase: (id: string) => void;
  selectUseCase: (id: string) => void;
  clearSelection: () => void;
  getUseCaseById: (id: string) => UseCase | undefined;
  getUseCasesByStatus: (status: UseCase['status']) => UseCase[];
}

export const useUseCaseStore = create<UseCaseStore>((set, get) => ({
  useCases: mockUseCases,
  selectedUseCase: null,

  addUseCase: (useCase) => {
    const newUseCase: UseCase = {
      ...useCase,
      id: `uc-${Date.now().toString(36)}`,
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
})); 