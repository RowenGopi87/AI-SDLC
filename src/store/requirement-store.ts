import { create } from 'zustand';
import { Requirement, mockRequirements } from '@/lib/mock-data';

interface RequirementStore {
  requirements: Requirement[];
  selectedRequirement: Requirement | null;
  addRequirement: (requirement: Omit<Requirement, 'id'>) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  selectRequirement: (id: string) => void;
  clearSelection: () => void;
  getRequirementById: (id: string) => Requirement | undefined;
  getRequirementsByUseCaseId: (useCaseId: string) => Requirement[];
  getRequirementsByStatus: (status: Requirement['status']) => Requirement[];
}

export const useRequirementStore = create<RequirementStore>((set, get) => ({
  requirements: mockRequirements,
  selectedRequirement: null,

  addRequirement: (requirement) => {
    const newRequirement: Requirement = {
      ...requirement,
      id: `req-${Date.now().toString(36)}`,
    };
    set((state) => ({
      requirements: [...state.requirements, newRequirement],
    }));
  },

  updateRequirement: (id, updates) => {
    set((state) => ({
      requirements: state.requirements.map((requirement) =>
        requirement.id === id ? { ...requirement, ...updates } : requirement
      ),
    }));
  },

  deleteRequirement: (id) => {
    set((state) => ({
      requirements: state.requirements.filter((requirement) => requirement.id !== id),
      selectedRequirement: state.selectedRequirement?.id === id ? null : state.selectedRequirement,
    }));
  },

  selectRequirement: (id) => {
    const requirement = get().requirements.find((req) => req.id === id);
    set({ selectedRequirement: requirement || null });
  },

  clearSelection: () => {
    set({ selectedRequirement: null });
  },

  getRequirementById: (id) => {
    return get().requirements.find((requirement) => requirement.id === id);
  },

  getRequirementsByUseCaseId: (useCaseId) => {
    return get().requirements.filter((requirement) => requirement.useCaseId === useCaseId);
  },

  getRequirementsByStatus: (status) => {
    return get().requirements.filter((requirement) => requirement.status === status);
  },
})); 