import { create } from 'zustand';

export interface Initiative {
  id: string;
  businessBriefId: string; // Links back to the business brief
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  acceptanceCriteria: string[];
  businessValue: string;
  workflowLevel: string;
  status: 'draft' | 'active' | 'completed' | 'on-hold';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  assignedTo?: string;
}

interface InitiativeState {
  initiatives: Initiative[];
  addInitiative: (initiative: Initiative) => void;
  addGeneratedInitiatives: (businessBriefId: string, generatedInitiatives: any[]) => void;
  updateInitiative: (id: string, updates: Partial<Initiative>) => void;
  deleteInitiative: (id: string) => void;
  getInitiativesByBusinessBrief: (businessBriefId: string) => Initiative[];
  getInitiativeById: (id: string) => Initiative | undefined;
}

export const useInitiativeStore = create<InitiativeState>((set, get) => ({
  initiatives: [],

  addInitiative: (initiative) =>
    set((state) => ({
      initiatives: [...state.initiatives, initiative],
    })),

  addGeneratedInitiatives: (businessBriefId, generatedInitiatives) => {
    const newInitiatives: Initiative[] = generatedInitiatives.map((gen, index) => ({
      id: gen.id || `init-gen-${Date.now().toString(36)}-${index}`,
      businessBriefId,
      title: gen.text || gen.title || `Initiative ${index + 1}`,
      description: gen.rationale || gen.description || 'Generated initiative',
      category: gen.category || 'strategic',
      priority: gen.priority || 'medium',
      rationale: gen.rationale || 'Generated from business brief analysis',
      acceptanceCriteria: gen.acceptanceCriteria || ['To be defined'],
      businessValue: gen.businessValue || 'Business value to be determined',
      workflowLevel: gen.workflowLevel || 'initiative',
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'AI System',
    }));

    set((state) => ({
      initiatives: [...state.initiatives, ...newInitiatives],
    }));

    return newInitiatives;
  },

  updateInitiative: (id, updates) =>
    set((state) => ({
      initiatives: state.initiatives.map((initiative) =>
        initiative.id === id
          ? { ...initiative, ...updates, updatedAt: new Date() }
          : initiative
      ),
    })),

  deleteInitiative: (id) =>
    set((state) => ({
      initiatives: state.initiatives.filter((initiative) => initiative.id !== id),
    })),

  getInitiativesByBusinessBrief: (businessBriefId) => {
    const state = get();
    return state.initiatives.filter((initiative) => initiative.businessBriefId === businessBriefId);
  },

  getInitiativeById: (id) => {
    const state = get();
    return state.initiatives.find((initiative) => initiative.id === id);
  },
})); 