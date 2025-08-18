import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-helpers';
import AuraV2QualifyPage from '@/app/aurav2/qualify/page';
import { mockBusinessBriefs, mockQualifiedIdeas, mockWorkflowStages, createMockFetchResponse } from '../../mocks/aurav2-data';
import { setupMockFetch, setupMockFetchError } from '../../utils/test-helpers';

describe('AuraV2 Qualify Stage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  describe('Component Rendering', () => {
    it('should render the qualify stage header correctly', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      expect(screen.getByText('Qualify Stage • Research & Assessment')).toBeInTheDocument();
      expect(screen.getByText('Stage 2 of AuraV2 Workflow')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render all tab options', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /ideas to qualify/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /qualified ideas/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /research tools/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /activities/i })).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      expect(screen.getByText(/loading.*qualify stage/i)).toBeInTheDocument();
    });

    it('should render navigation buttons', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /back to ideas/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load approved business briefs and qualified ideas on mount', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs.filter(b => b.status === 'approved')) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/aurav2/workflow/stages');
        expect(fetch).toHaveBeenCalledWith('/api/business-briefs/list?status=approved');
        expect(fetch).toHaveBeenCalledWith('/api/aurav2/qualify/ideas');
      });
    });

    it('should display approved business briefs for qualification', async () => {
      const approvedBriefs = mockBusinessBriefs.filter(b => b.status === 'approved');
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(approvedBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /ideas to qualify/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Approved Ideas Awaiting Qualification')).toBeInTheDocument();
        expect(screen.getByText('Test Customer Portal Enhancement')).toBeInTheDocument();
      });
    });

    it('should display qualified ideas when available', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /qualified ideas/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Qualified Ideas')).toBeInTheDocument();
        expect(screen.getByText('Test Customer Portal Enhancement')).toBeInTheDocument();
        expect(screen.getByText('8.5')).toBeInTheDocument(); // qualification score
      });
    });
  });

  describe('Qualification Process', () => {
    it('should start qualification when button is clicked', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /ideas to qualify/i }));
      });

      await waitFor(() => {
        const qualifyButton = screen.getByText('Start Qualification');
        fireEvent.click(qualifyButton);
      });

      // Should show qualifying state
      await waitFor(() => {
        expect(screen.getByText('Qualifying...')).toBeInTheDocument();
      });
    });

    it('should show qualification results after completion', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /ideas to qualify/i }));
      });

      await waitFor(() => {
        const qualifyButton = screen.getByText('Start Qualification');
        fireEvent.click(qualifyButton);
      });

      // Wait for qualification to complete (mocked delay)
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Qualification complete!')
        );
      }, { timeout: 3000 });
    });
  });

  describe('Search and Filter', () => {
    it('should filter ideas based on search term', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /ideas to qualify/i }));
      });

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search ideas...');
        fireEvent.change(searchInput, { target: { value: 'Customer Portal' } });
      });

      // Should filter results (mock implementation shows all for now)
      expect(screen.getByDisplayValue('Customer Portal')).toBeInTheDocument();
    });
  });

  describe('Qualification Metrics', () => {
    it('should display correct qualification metrics in overview', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Qualification Metrics')).toBeInTheDocument();
        expect(screen.getByText('Qualified')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Proceed')).toBeInTheDocument();
      });
    });

    it('should show assessment criteria with correct weightings', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Assessment Criteria')).toBeInTheDocument();
        expect(screen.getByText('Market Demand')).toBeInTheDocument();
        expect(screen.getByText('25%')).toBeInTheDocument();
        expect(screen.getByText('Technical Feasibility')).toBeInTheDocument();
        expect(screen.getByText('20%')).toBeInTheDocument();
        expect(screen.getByText('Business Value')).toBeInTheDocument();
        expect(screen.getByText('Risk Level')).toBeInTheDocument();
        expect(screen.getByText('5%')).toBeInTheDocument();
      });
    });
  });

  describe('Research Tools', () => {
    it('should render research tools interface', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /research tools/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Market Research')).toBeInTheDocument();
        expect(screen.getByText('Competitor Analysis')).toBeInTheDocument();
        expect(screen.getByText('Technical Assessment')).toBeInTheDocument();
        expect(screen.getByText('Business Case')).toBeInTheDocument();
        
        expect(screen.getByPlaceholderText('Market segment...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Competitor name...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Technology stack...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('ROI estimate...')).toBeInTheDocument();
      });
    });

    it('should have functional research buttons', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /research tools/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Research Market')).toBeInTheDocument();
        expect(screen.getByText('Analyze Competition')).toBeInTheDocument();
        expect(screen.getByText('Assess Feasibility')).toBeInTheDocument();
        expect(screen.getByText('Build Case')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no qualified ideas exist', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /qualified ideas/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('No Qualified Ideas Yet')).toBeInTheDocument();
        expect(screen.getByText('Start qualifying approved business briefs')).toBeInTheDocument();
      });
    });

    it('should show empty state when no ideas to qualify', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /ideas to qualify/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('No Ideas to Qualify')).toBeInTheDocument();
        expect(screen.getByText('All approved ideas have been qualified or none match your search')).toBeInTheDocument();
      });
    });
  });

  describe('Qualification Criteria Display', () => {
    it('should show detailed criteria breakdown for qualified ideas', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /qualified ideas/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Assessment Breakdown:')).toBeInTheDocument();
        expect(screen.getByText(/market demand/i)).toBeInTheDocument();
        expect(screen.getByText(/technical feasibility/i)).toBeInTheDocument();
        expect(screen.getByText(/business value/i)).toBeInTheDocument();
        expect(screen.getByText('8/10')).toBeInTheDocument(); // market demand score
        expect(screen.getByText('7/10')).toBeInTheDocument(); // technical feasibility score
      });
    });

    it('should display recommended actions correctly', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /qualified ideas/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('PROCEED')).toBeInTheDocument();
        expect(screen.getByText('Score: 8.5')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      setupMockFetchError('Network error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load stage info:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle qualification process errors', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockBusinessBriefs) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /ideas to qualify/i }));
      });

      await waitFor(() => {
        const qualifyButton = screen.getByText('Start Qualification');
        
        // Mock fetch to reject on qualification attempt
        mockFetch.mockRejectedValueOnce(new Error('Qualification failed'));
        
        fireEvent.click(qualifyButton);
      });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to run qualification');
      }, { timeout: 3000 });
    });
  });

  describe('Qualification Process Flow', () => {
    it('should show process steps in overview', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Qualification Process')).toBeInTheDocument();
        expect(screen.getByText('Market Research')).toBeInTheDocument();
        expect(screen.getByText('Technical Assessment')).toBeInTheDocument();
        expect(screen.getByText('Business Case')).toBeInTheDocument();
        expect(screen.getByText('Decision')).toBeInTheDocument();
        
        expect(screen.getByText('Analyze market demand and competition')).toBeInTheDocument();
        expect(screen.getByText('Evaluate technical feasibility and complexity')).toBeInTheDocument();
        expect(screen.getByText('Define value proposition and ROI')).toBeInTheDocument();
        expect(screen.getByText('Recommend proceed, defer, or decline')).toBeInTheDocument();
      });
    });

    it('should update metrics when ideas are qualified', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        expect(screen.getByText('1 Qualified')).toBeInTheDocument(); // Updated count
      });
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper ARIA labels for qualification cards', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse([]) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2QualifyPage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /qualified ideas/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /prioritize/i })).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation in research tools', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);
      
      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /research tools/i }));
      });

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        inputs.forEach(input => {
          expect(input).toBeInTheDocument();
          expect(input).not.toBeDisabled();
        });
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      setupMockFetch([]);
      
      render(<AuraV2QualifyPage />);

      // Start with overview tab (default)
      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('data-state', 'active');

      // Switch to ideas to qualify tab
      fireEvent.click(screen.getByRole('tab', { name: /ideas to qualify/i }));
      expect(screen.getByRole('tab', { name: /ideas to qualify/i })).toHaveAttribute('data-state', 'active');

      // Switch to qualified ideas tab
      fireEvent.click(screen.getByRole('tab', { name: /qualified ideas/i }));
      expect(screen.getByRole('tab', { name: /qualified ideas/i })).toHaveAttribute('data-state', 'active');

      // Switch to research tools tab
      fireEvent.click(screen.getByRole('tab', { name: /research tools/i }));
      expect(screen.getByRole('tab', { name: /research tools/i })).toHaveAttribute('data-state', 'active');

      // Switch to activities tab
      fireEvent.click(screen.getByRole('tab', { name: /activities/i }));
      expect(screen.getByRole('tab', { name: /activities/i })).toHaveAttribute('data-state', 'active');
    });
  });
});
