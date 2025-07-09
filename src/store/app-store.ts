import { create } from 'zustand';
import { MODULES, WORKFLOW_STEPS } from '@/lib/config';

interface AppStore {
  currentModule: string;
  currentWorkflowStep: number;
  sidebarOpen: boolean;
  isLoading: boolean;
  setCurrentModule: (module: string) => void;
  setCurrentWorkflowStep: (step: number) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  getModuleById: (id: string) => typeof MODULES[number] | undefined;
  getWorkflowStepById: (id: number) => typeof WORKFLOW_STEPS[number] | undefined;
  getNextWorkflowStep: () => typeof WORKFLOW_STEPS[number] | undefined;
  getPreviousWorkflowStep: () => typeof WORKFLOW_STEPS[number] | undefined;
  getWorkflowProgress: () => number;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentModule: 'dashboard',
  currentWorkflowStep: 1,
  sidebarOpen: true,
  isLoading: false,

  setCurrentModule: (module) => {
    set({ currentModule: module });
  },

  setCurrentWorkflowStep: (step) => {
    set({ currentWorkflowStep: step });
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  getModuleById: (id) => {
    return MODULES.find((module) => module.id === id);
  },

  getWorkflowStepById: (id) => {
    return WORKFLOW_STEPS.find((step) => step.id === id);
  },

  getNextWorkflowStep: () => {
    const currentStep = get().currentWorkflowStep;
    return WORKFLOW_STEPS.find((step) => step.id === currentStep + 1);
  },

  getPreviousWorkflowStep: () => {
    const currentStep = get().currentWorkflowStep;
    return WORKFLOW_STEPS.find((step) => step.id === currentStep - 1);
  },

  getWorkflowProgress: () => {
    const currentStep = get().currentWorkflowStep;
    return Math.round((currentStep / WORKFLOW_STEPS.length) * 100);
  },
})); 