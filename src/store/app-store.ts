import { create } from 'zustand';
import { MODULES, WORKFLOW_STEPS } from '@/lib/config';

interface AppStore {
  currentModule: string;
  currentWorkflowStep: number;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  rightPanelOpen: boolean;
  rightPanelCollapsed: boolean;
  rightPanelWidth: number;
  isLoading: boolean;
  setCurrentModule: (module: string) => void;
  setCurrentWorkflowStep: (step: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelWidth: (width: number) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  toggleRightPanel: () => void;
  toggleRightPanelCollapsed: () => void;
  setLoading: (loading: boolean) => void;
  getModuleById: (id: string) => typeof MODULES[number] | undefined;
  getWorkflowStepById: (id: number) => typeof WORKFLOW_STEPS[number] | undefined;
  getNextWorkflowStep: () => typeof WORKFLOW_STEPS[number] | undefined;
  getPreviousWorkflowStep: () => typeof WORKFLOW_STEPS[number] | undefined;
  getWorkflowProgress: () => number;
  getSidebarWidth: () => number;
  getRightPanelWidth: () => number;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentModule: 'dashboard',
  currentWorkflowStep: 1,
  sidebarOpen: true,
  sidebarCollapsed: false,
  sidebarWidth: 200, // Default expanded width
  rightPanelOpen: false,
  rightPanelCollapsed: false,
  rightPanelWidth: 400, // Default right panel width
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

  setSidebarWidth: (width) => {
    // Constrain width between 200px and 600px
    const constrainedWidth = Math.max(200, Math.min(600, width));
    set({ sidebarWidth: constrainedWidth });
  },

  setRightPanelOpen: (open) => {
    set({ rightPanelOpen: open });
  },

  setRightPanelCollapsed: (collapsed) => {
    set({ rightPanelCollapsed: collapsed });
  },

  setRightPanelWidth: (width) => {
    // Constrain width between 300px and 800px
    const constrainedWidth = Math.max(300, Math.min(800, width));
    set({ rightPanelWidth: constrainedWidth });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  toggleSidebarCollapsed: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  toggleRightPanel: () => {
    set((state) => ({ rightPanelOpen: !state.rightPanelOpen }));
  },

  toggleRightPanelCollapsed: () => {
    set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed }));
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
    const { sidebarOpen, sidebarCollapsed, sidebarWidth } = get();
    if (!sidebarOpen) return 0;
    return sidebarCollapsed ? 80 : sidebarWidth; // Changed from 64 to 80 (w-20)
  },

  getRightPanelWidth: () => {
    const { rightPanelOpen, rightPanelCollapsed, rightPanelWidth } = get();
    if (!rightPanelOpen) return 0;
    return rightPanelCollapsed ? 80 : rightPanelWidth; // Changed from 64 to 80 (w-20)
  },
})); 