import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Simple mock implementations without requiring actual store imports
const mockUseRoleStore = jest.fn();
const mockUseAppStore = jest.fn();

// Mock store implementations

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Set up default mock values for stores
  mockUseRoleStore.mockReturnValue({
    currentRole: 'product_manager',
    isRoleSelected: true,
    setRole: jest.fn(),
    clearRole: jest.fn(),
    hasAccess: jest.fn().mockReturnValue(true),
    getAccessibleRoutes: jest.fn().mockReturnValue(['/aurav2/idea', '/aurav2/qualify', '/aurav2/prioritize']),
    getCurrentRole: jest.fn().mockReturnValue({
      id: 'product_manager',
      name: 'Product Manager',
      description: 'Manages full AuraV2 workflow',
      color: 'purple',
      icon: 'Target',
      permissions: {
        aurav2: {
          dashboard: true,
          idea_stage: true,
          qualify_stage: true,
          prioritize_stage: true,
          settings: false,
        },
        legacy: {
          idea: false,
          work_items: false,
          design: false,
          code: false,
          test_cases: false,
          execution: false,
          defects: false,
          traceability: false,
          dashboard: false,
          requirements: false,
          decomposition: false,
          use_cases: false,
          migrate_data: false,
        },
        admin: {
          user_management: false,
          system_settings: false,
          data_migration: false,
          reports: true,
        }
      }
    }),
  });

  mockUseAppStore.mockReturnValue({
    sidebarOpen: true,
    sidebarCollapsed: false,
    currentWorkflowStep: 1,
    toggleSidebar: jest.fn(),
    toggleSidebarCollapsed: jest.fn(),
    setCurrentWorkflowStep: jest.fn(),
    getWorkflowProgress: jest.fn().mockReturnValue(11),
  });

  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper functions for common test scenarios
export const setupMockFetch = (mockData: any, success = true) => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  mockFetch.mockResolvedValue({
    ok: success,
    json: () => Promise.resolve({
      success,
      data: mockData,
      message: success ? 'Success' : 'Error'
    }),
    status: success ? 200 : 500,
    statusText: success ? 'OK' : 'Internal Server Error'
  } as Response);
};

export const setupMockFetchError = (errorMessage = 'Network error') => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  mockFetch.mockRejectedValue(new Error(errorMessage));
};

export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to resolve
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Test data factory functions
export const createTestBusinessBrief = (overrides = {}) => ({
  id: 'BB-TEST-' + Math.random().toString(36).substr(2, 9),
  title: 'Test Business Brief',
  description: 'Test description for business brief',
  businessOwner: 'Test Owner',
  status: 'draft' as const,
  priority: 'medium' as const,
  workflowStage: 'idea',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createTestQualifiedIdea = (overrides = {}) => ({
  id: 'QI-TEST-' + Math.random().toString(36).substr(2, 9),
  businessBriefId: 'BB-TEST-001',
  title: 'Test Qualified Idea',
  qualificationScore: 8.0,
  businessValue: 8,
  complexity: 6,
  effort: 7,
  riskLevel: 3,
  strategicAlignment: 8,
  marketImpact: 7,
  priority: 1,
  recommendedAction: 'proceed' as const,
  qualifiedAt: new Date().toISOString(),
  qualifiedBy: 'Test User',
  estimatedROI: '200%',
  timeToMarket: '6 months',
  resourceRequirement: '2 FTE',
  criteria: {
    marketDemand: 8,
    technicalFeasibility: 7,
    businessValue: 8,
    resourceAvailability: 6,
    strategicAlignment: 8,
    riskLevel: 3
  },
  ...overrides
});
