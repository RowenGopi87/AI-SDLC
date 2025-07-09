import { create } from 'zustand';
import { mockDashboardData, mockTraceabilityData } from '@/lib/mock-data';

interface DashboardStore {
  dashboardData: typeof mockDashboardData;
  traceabilityData: typeof mockTraceabilityData;
  currentModule: string;
  updateDashboardData: (updates: Partial<typeof mockDashboardData>) => void;
  setCurrentModule: (module: string) => void;
  getTestCoveragePercentage: () => number;
  getDefectResolutionRate: () => number;
  getUseCaseCompletionRate: () => number;
  getWorkItemProgressRate: () => number;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboardData: mockDashboardData,
  traceabilityData: mockTraceabilityData,
  currentModule: 'dashboard',

  updateDashboardData: (updates) => {
    set((state) => ({
      dashboardData: { ...state.dashboardData, ...updates },
    }));
  },

  setCurrentModule: (module) => {
    set({ currentModule: module });
  },

  getTestCoveragePercentage: () => {
    const { testCoverage } = get().dashboardData;
    return Math.round((testCoverage.passed / testCoverage.total) * 100);
  },

  getDefectResolutionRate: () => {
    const { defectTrends } = get().dashboardData;
    const total = defectTrends.open + defectTrends.inProgress + defectTrends.resolved + defectTrends.closed;
    const resolved = defectTrends.resolved + defectTrends.closed;
    return Math.round((resolved / total) * 100);
  },

  getUseCaseCompletionRate: () => {
    const { useCaseStatus } = get().dashboardData;
    return Math.round((useCaseStatus.approved / useCaseStatus.total) * 100);
  },

  getWorkItemProgressRate: () => {
    const { workItemProgress } = get().dashboardData;
    return Math.round((workItemProgress.done / workItemProgress.total) * 100);
  },
})); 