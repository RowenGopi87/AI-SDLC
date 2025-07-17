import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TestCase {
  id: string;
  workItemId: string;
  workItemType: 'initiative' | 'feature' | 'epic' | 'story';
  title: string;
  summary: string;
  description: string;
  type: 'positive' | 'negative' | 'edge';
  testPyramidType: 'unit' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security';
  status: 'not_run' | 'passed' | 'failed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  assignee?: string;
  createdBy: string;
  createdAt: Date;
  lastExecuted?: Date;
  estimatedTime?: number; // in minutes
  tags: string[];
}

interface TestCaseStore {
  testCases: TestCase[];
  selectedTestCase: TestCase | null;
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt'>) => TestCase;
  addGeneratedTestCases: (workItemId: string, testCases: Omit<TestCase, 'id' | 'createdAt' | 'workItemId'>[]) => TestCase[];
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  selectTestCase: (id: string) => void;
  clearSelection: () => void;
  getTestCaseById: (id: string) => TestCase | undefined;
  getTestCasesByWorkItemId: (workItemId: string) => TestCase[];
  getTestCasesByType: (type: TestCase['type']) => TestCase[];
  getTestCasesByStatus: (status: TestCase['status']) => TestCase[];
  executeTestCase: (id: string, result: 'passed' | 'failed' | 'blocked', actualResult?: string) => void;
  updateTestCaseStatus: (id: string, status: TestCase['status']) => void;
}

export const useTestCaseStore = create<TestCaseStore>()(
  persist(
    (set, get) => ({
  testCases: [],
  selectedTestCase: null,

  addTestCase: (testCase) => {
    const newTestCase: TestCase = {
      ...testCase,
      id: `TC-${String(get().testCases.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
    };
    set((state) => ({
      testCases: [...state.testCases, newTestCase],
    }));
    return newTestCase;
  },

  addGeneratedTestCases: (workItemId, testCases) => {
    const currentCount = get().testCases.length;
    const newTestCases: TestCase[] = testCases.map((testCase, index) => ({
      ...testCase,
      id: `TC-${String(currentCount + index + 1).padStart(3, '0')}`,
      workItemId,
      createdAt: new Date(),
    }));
    
    set((state) => ({
      testCases: [...state.testCases, ...newTestCases],
    }));
    return newTestCases;
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

  updateTestCaseStatus: (id, status) => {
    set((state) => ({
      testCases: state.testCases.map((testCase) =>
        testCase.id === id
          ? {
              ...testCase,
              status,
              lastExecuted: new Date(),
            }
          : testCase
      ),
    }));
  },
}),
{
  name: 'test-case-storage',
  // Persist all test case data
}
)
); 