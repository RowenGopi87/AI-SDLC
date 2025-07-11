import { create } from 'zustand';
import { Requirement, mockRequirements } from '@/lib/mock-data';
import { GeneratedRequirement } from '@/lib/services/llm-service';

interface RequirementStore {
  requirements: Requirement[];
  selectedRequirement: Requirement | null;
  addRequirement: (requirement: Omit<Requirement, 'id'>) => void;
  addGeneratedRequirements: (useCaseId: string, generatedRequirements: GeneratedRequirement[]) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  selectRequirement: (id: string) => void;
  clearSelection: () => void;
  getRequirementById: (id: string) => Requirement | undefined;
  getRequirementsByUseCaseId: (useCaseId: string) => Requirement[];
  getRequirementsByStatus: (status: Requirement['status']) => Requirement[];
  getGeneratedRequirementsByUseCaseId: (useCaseId: string) => Requirement[];
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

  addGeneratedRequirements: (useCaseId, generatedRequirements) => {
    const newRequirements: Requirement[] = generatedRequirements.map((genReq, index) => ({
      id: genReq.id || `req-gen-${Date.now().toString(36)}-${index}`,
      useCaseId,
      originalText: genReq.text,
      enhancedText: genReq.text, // Start with the same text since LLM already refined it
      isUnambiguous: genReq.clearPrinciples.unambiguous,
      isTestable: genReq.clearPrinciples.testable,
      hasAcceptanceCriteria: genReq.acceptanceCriteria.length > 0,
      status: 'enhanced' as const, // Generated requirements start as enhanced
      reviewedBy: 'AI System',
      reviewedAt: new Date(),
      workflowStage: 'enhancement' as const,
      completionPercentage: 80, // 80% since they're AI-generated but may need human review
    }));

    set((state) => ({
      requirements: [...state.requirements, ...newRequirements],
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

  getGeneratedRequirementsByUseCaseId: (useCaseId) => {
    return get().requirements.filter((requirement) => 
      requirement.useCaseId === useCaseId && requirement.reviewedBy === 'AI System'
    );
  },
})); 