import { create } from 'zustand';
import { MODULES, WORKFLOW_STEPS } from '@/lib/config';

interface AppStore {
  currentModule: string;
  currentWorkflowStep: number;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  setCurrentModule: (module: string) => void;
  setCurrentWorkflowStep: (step: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setLoading: (loading: boolean) => void;
  getModuleById: (id: string) => typeof MODULES[number] | undefined;
  getWorkflowStepById: (id: number) => typeof WORKFLOW_STEPS[number] | undefined;
  getNextWorkflowStep: () => typeof WORKFLOW_STEPS[number] | undefined;
  getPreviousWorkflowStep: () => typeof WORKFLOW_STEPS[number] | undefined;
  getWorkflowProgress: () => number;
  getSidebarWidth: () => number;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentModule: 'dashboard',
  currentWorkflowStep: 1,
  sidebarOpen: true,
  sidebarCollapsed: false,
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

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
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

  getSidebarWidth: () => {
    const { sidebarOpen, sidebarCollapsed } = get();
    if (!sidebarOpen) return 0;
    return sidebarCollapsed ? 64 : 320; // 16 * 4 = 64px (w-16), 80 * 4 = 320px (w-80)
  },
})); 