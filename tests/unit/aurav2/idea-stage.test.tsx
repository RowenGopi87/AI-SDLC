import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-helpers';
import AuraV2IdeaPage from '@/app/aurav2/idea/page';
import { mockBusinessBriefs, mockWorkflowStages, mockAIAssessments, createMockFetchResponse } from '../../mocks/aurav2-data';
import { setupMockFetch, setupMockFetchError } from '../../utils/test-helpers';

describe('AuraV2 Idea Stage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  describe('Component Rendering', () => {
    it('should render the idea stage header correctly', async () => {
      setupMockFetch([]);
      
      render(<AuraV2IdeaPage />);
      
      expect(screen.getByText('Idea Stage • Business Brief')).toBeInTheDocument();
      expect(screen.getByText('Stage 1 of AuraV2 Workflow')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render all tab options', async () => {
      setupMockFetch([]);
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /briefs/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /ai quality/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /activities/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /reference/i })).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      setupMockFetch([]);
      
      render(<AuraV2IdeaPage />);
      
      expect(screen.getByText(/loading.*idea stage/i)).toBeInTheDocument();
    });

    it('should render navigation buttons', async () => {
      setupMockFetch([]);
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /new brief/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load business briefs on mount', async () => {
      setupMockFetch(mockBusinessBriefs);
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/business-briefs/list');
        expect(fetch).toHaveBeenCalledWith('/api/aurav2/workflow/stages');
      });
    });

    it('should display business briefs when loaded', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Customer Portal Enhancement')).toBeInTheDocument();
        expect(screen.getByText('Test Mobile App Redesign')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      setupMockFetchError('Network error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load business briefs:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('AI Assessment Functionality', () => {
    it('should load AI assessments for business briefs', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockAIAssessments['BB-TEST-001']) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockAIAssessments['BB-TEST-002']) as any);

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/aurav2/ai/assess-quality?businessBriefId=')
        );
      });
    });

    it('should trigger AI assessment when button is clicked', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse(null) as any) // No existing assessment
        .mockResolvedValueOnce(createMockFetchResponse(null) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockAIAssessments['BB-TEST-001']) as any); // New assessment

      render(<AuraV2IdeaPage />);

      // Switch to business briefs tab
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      // Wait for business briefs to load and click AI Assessment button
      await waitFor(() => {
        const assessmentButton = screen.getByText(/ai assessment/i);
        fireEvent.click(assessmentButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/aurav2/ai/assess-quality', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('BB-TEST-001')
        }));
      });
    });

    it('should display assessment results correctly', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockAIAssessments['BB-TEST-001']) as any);

      render(<AuraV2IdeaPage />);

      // Switch to AI assessment tab
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /ai quality/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('AI Quality Assessment')).toBeInTheDocument();
        expect(screen.getByText('Assessment Criteria:')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Functionality', () => {
    it('should open view modal when view button is clicked', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      // Switch to business briefs tab
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      // Click view button
      await waitFor(() => {
        const viewButtons = screen.getAllByText(/view/i);
        fireEvent.click(viewButtons[0]);
      });

      // Check if modal elements appear
      await waitFor(() => {
        expect(screen.getByText('Test Customer Portal Enhancement')).toBeInTheDocument();
      });
    });

    it('should open edit modal when edit button is clicked', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      // Switch to business briefs tab
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      // Click edit button
      await waitFor(() => {
        const editButtons = screen.getAllByText(/edit/i);
        fireEvent.click(editButtons[0]);
      });

      // Check if edit modal elements appear
      await waitFor(() => {
        expect(screen.getByText('Edit Business Brief')).toBeInTheDocument();
      });
    });

    it('should open delete modal when delete button is clicked', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      // Switch to business briefs tab
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      // Click delete button
      await waitFor(() => {
        const deleteButtons = screen.getAllByText(/delete/i);
        fireEvent.click(deleteButtons[0]);
      });

      // Check if delete modal elements appear
      await waitFor(() => {
        expect(screen.getByText('Delete Business Brief')).toBeInTheDocument();
        expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      });
    });
  });

  describe('Status and Priority Display', () => {
    it('should display correct status badges', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('APPROVED')).toBeInTheDocument();
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      });
    });

    it('should show empty state when no briefs exist', async () => {
      setupMockFetch([]);
      
      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('No Business Briefs Yet')).toBeInTheDocument();
        expect(screen.getByText('Create your first business brief to get started')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      setupMockFetch(mockBusinessBriefs);
      
      render(<AuraV2IdeaPage />);

      // Start with overview tab (default)
      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('data-state', 'active');

      // Switch to business briefs tab
      fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      expect(screen.getByRole('tab', { name: /briefs/i })).toHaveAttribute('data-state', 'active');

      // Switch to AI quality tab
      fireEvent.click(screen.getByRole('tab', { name: /ai quality/i }));
      expect(screen.getByRole('tab', { name: /ai quality/i })).toHaveAttribute('data-state', 'active');

      // Switch to activities tab
      fireEvent.click(screen.getByRole('tab', { name: /activities/i }));
      expect(screen.getByRole('tab', { name: /activities/i })).toHaveAttribute('data-state', 'active');

      // Switch to reference tab
      fireEvent.click(screen.getByRole('tab', { name: /reference/i }));
      expect(screen.getByRole('tab', { name: /reference/i })).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors when loading data', async () => {
      setupMockFetchError();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle AI assessment failures', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse(null) as any)
        .mockRejectedValueOnce(new Error('AI service unavailable'));

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        const assessmentButton = screen.getByText(/ai assessment/i);
        fireEvent.click(assessmentButton);
      });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('An error occurred while running AI assessment');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      setupMockFetch(mockBusinessBriefs);
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getAllByRole('tab')).toHaveLength(5);
        expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      setupMockFetch(mockBusinessBriefs);
      
      render(<AuraV2IdeaPage />);
      
      const tablist = await screen.findByRole('tablist');
      const firstTab = screen.getByRole('tab', { name: /overview/i });
      
      // Focus should be manageable
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      fireEvent.keyDown(tablist, { key: 'Enter' });
      
      // Should not throw errors
      expect(firstTab).toBeInTheDocument();
    });
  });

  describe('Stage Progress Indicator', () => {
    it('should display correct stage information', async () => {
      setupMockFetch(mockBusinessBriefs);
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Stage: Idea')).toBeInTheDocument();
        expect(screen.getByText('Capture and outline business ideas')).toBeInTheDocument();
        expect(screen.getByText('Stage 1')).toBeInTheDocument();
      });
    });

    it('should show brief count in stage indicator', async () => {
      setupMockFetch(mockBusinessBriefs);
      
      render(<AuraV2IdeaPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/\d+ Active Briefs/)).toBeInTheDocument();
      });
    });
  });
});

describe('Business Brief Modals', () => {
  describe('View Modal', () => {
    it('should display business brief details correctly', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        const viewButtons = screen.getAllByText(/view/i);
        fireEvent.click(viewButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Customer Portal Enhancement')).toBeInTheDocument();
        expect(screen.getByText('APPROVED')).toBeInTheDocument();
        expect(screen.getByText('HIGH PRIORITY')).toBeInTheDocument();
      });
    });

    it('should close modal when X button is clicked', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        const viewButtons = screen.getAllByText(/view/i);
        fireEvent.click(viewButtons[0]);
      });

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: '' }); // X button typically has no name
        fireEvent.click(closeButton);
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Edit Business Brief')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Modal', () => {
    it('should allow editing business brief fields', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs[0]) as any); // Save response

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText(/edit/i);
        fireEvent.click(editButtons[0]);
      });

      await waitFor(() => {
        const titleInput = screen.getByDisplayValue('Test Customer Portal Enhancement');
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        
        const saveButton = screen.getByText(/save changes/i);
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/business-briefs/BB-TEST-001',
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });
  });

  describe('Delete Modal', () => {
    it('should show confirmation dialog before deletion', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any);

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        const deleteButtons = screen.getAllByText(/delete/i);
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Delete Business Brief')).toBeInTheDocument();
        expect(screen.getByText('You are about to delete:')).toBeInTheDocument();
        expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('should perform deletion when confirmed', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce({ ok: true } as any); // Delete response

      render(<AuraV2IdeaPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /briefs/i }));
      });

      await waitFor(() => {
        const deleteButtons = screen.getAllByText(/delete/i);
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText(/delete business brief/i);
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/business-briefs/BB-TEST-001',
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });
});
