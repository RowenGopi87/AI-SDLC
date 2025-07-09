import { create } from 'zustand';
import { TestCase, mockTestCases } from '@/lib/mock-data';

interface TestCaseStore {
  testCases: TestCase[];
  selectedTestCase: TestCase | null;
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt'>) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  selectTestCase: (id: string) => void;
  clearSelection: () => void;
  getTestCaseById: (id: string) => TestCase | undefined;
  getTestCasesByWorkItemId: (workItemId: string) => TestCase[];
  getTestCasesByType: (type: TestCase['type']) => TestCase[];
  getTestCasesByStatus: (status: TestCase['status']) => TestCase[];
  executeTestCase: (id: string, result: 'passed' | 'failed' | 'blocked', actualResult?: string) => void;
}

export const useTestCaseStore = create<TestCaseStore>((set, get) => ({
  testCases: mockTestCases,
  selectedTestCase: null,

  addTestCase: (testCase) => {
    const newTestCase: TestCase = {
      ...testCase,
      id: `tc-${Date.now().toString(36)}`,
      createdAt: new Date(),
    };
    set((state) => ({
      testCases: [...state.testCases, newTestCase],
    }));
  },

  updateTestCase: (id, updates) => {
    set((state) => ({
      testCases: state.testCases.map((testCase) =>
        testCase.id === id ? { ...testCase, ...updates } : testCase
      ),
    }));
  },

  deleteTestCase: (id) => {
    set((state) => ({
      testCases: state.testCases.filter((testCase) => testCase.id !== id),
      selectedTestCase: state.selectedTestCase?.id === id ? null : state.selectedTestCase,
    }));
  },

  selectTestCase: (id) => {
    const testCase = get().testCases.find((tc) => tc.id === id);
    set({ selectedTestCase: testCase || null });
  },

  clearSelection: () => {
    set({ selectedTestCase: null });
  },

  getTestCaseById: (id) => {
    return get().testCases.find((testCase) => testCase.id === id);
  },

  getTestCasesByWorkItemId: (workItemId) => {
    return get().testCases.filter((testCase) => testCase.workItemId === workItemId);
  },

  getTestCasesByType: (type) => {
    return get().testCases.filter((testCase) => testCase.type === type);
  },

  getTestCasesByStatus: (status) => {
    return get().testCases.filter((testCase) => testCase.status === status);
  },

  executeTestCase: (id, result, actualResult) => {
    set((state) => ({
      testCases: state.testCases.map((testCase) =>
        testCase.id === id
          ? {
              ...testCase,
              status: result,
              actualResult,
              lastExecuted: new Date(),
            }
          : testCase
      ),
    }));
  },
})); 