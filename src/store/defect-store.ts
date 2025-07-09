import { create } from 'zustand';
import { Defect, mockDefects } from '@/lib/mock-data';

interface DefectStore {
  defects: Defect[];
  selectedDefect: Defect | null;
  addDefect: (defect: Omit<Defect, 'id' | 'createdAt'>) => void;
  updateDefect: (id: string, updates: Partial<Defect>) => void;
  deleteDefect: (id: string) => void;
  selectDefect: (id: string) => void;
  clearSelection: () => void;
  getDefectById: (id: string) => Defect | undefined;
  getDefectsByTestCaseId: (testCaseId: string) => Defect[];
  getDefectsByStatus: (status: Defect['status']) => Defect[];
  getDefectsBySeverity: (severity: Defect['severity']) => Defect[];
  resolveDefect: (id: string) => void;
  reopenDefect: (id: string) => void;
}

export const useDefectStore = create<DefectStore>((set, get) => ({
  defects: mockDefects,
  selectedDefect: null,

  addDefect: (defect) => {
    const newDefect: Defect = {
      ...defect,
      id: `def-${Date.now().toString(36)}`,
      createdAt: new Date(),
    };
    set((state) => ({
      defects: [...state.defects, newDefect],
    }));
  },

  updateDefect: (id, updates) => {
    set((state) => ({
      defects: state.defects.map((defect) =>
        defect.id === id ? { ...defect, ...updates } : defect
      ),
    }));
  },

  deleteDefect: (id) => {
    set((state) => ({
      defects: state.defects.filter((defect) => defect.id !== id),
      selectedDefect: state.selectedDefect?.id === id ? null : state.selectedDefect,
    }));
  },

  selectDefect: (id) => {
    const defect = get().defects.find((d) => d.id === id);
    set({ selectedDefect: defect || null });
  },

  clearSelection: () => {
    set({ selectedDefect: null });
  },

  getDefectById: (id) => {
    return get().defects.find((defect) => defect.id === id);
  },

  getDefectsByTestCaseId: (testCaseId) => {
    return get().defects.filter((defect) => defect.testCaseId === testCaseId);
  },

  getDefectsByStatus: (status) => {
    return get().defects.filter((defect) => defect.status === status);
  },

  getDefectsBySeverity: (severity) => {
    return get().defects.filter((defect) => defect.severity === severity);
  },

  resolveDefect: (id) => {
    set((state) => ({
      defects: state.defects.map((defect) =>
        defect.id === id
          ? { ...defect, status: 'resolved', resolvedAt: new Date() }
          : defect
      ),
    }));
  },

  reopenDefect: (id) => {
    set((state) => ({
      defects: state.defects.map((defect) =>
        defect.id === id
          ? { ...defect, status: 'reopened', resolvedAt: undefined }
          : defect
      ),
    }));
  },
})); 