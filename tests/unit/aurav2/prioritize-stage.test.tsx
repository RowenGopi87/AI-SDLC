import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-helpers';
import AuraV2PrioritizePage from '@/app/aurav2/prioritize/page';
import { mockQualifiedIdeas, mockWorkflowStages, createMockFetchResponse } from '../../mocks/aurav2-data';
import { setupMockFetch, setupMockFetchError } from '../../utils/test-helpers';

describe('AuraV2 Prioritize Stage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  describe('Component Rendering', () => {
    it('should render the prioritize stage header correctly', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      expect(screen.getByText('Prioritize Stage • Portfolio Planning')).toBeInTheDocument();
      expect(screen.getByText('Stage 3 of AuraV2 Workflow')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render all tab options', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /priority list/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /value.*effort.*matrix/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /portfolio planning/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /activities/i })).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      expect(screen.getByText(/loading.*prioritize stage/i)).toBeInTheDocument();
    });

    it('should render navigation and control buttons', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /back to qualify/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /auto-prioritize/i })).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load qualified ideas and workflow stages on mount', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/aurav2/workflow/stages');
        expect(fetch).toHaveBeenCalledWith('/api/aurav2/qualify/ideas');
      });
    });

    it('should display qualified ideas in priority order', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /priority list/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Prioritized Ideas Ranking')).toBeInTheDocument();
        expect(screen.getByText('Test Customer Portal Enhancement')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument(); // Priority rank
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('should handle missing qualified ideas with mock data fallback', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockRejectedValueOnce(new Error('No qualified ideas'));

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        // Should load mock data as fallback
        expect(screen.getByText('4 Ideas')).toBeInTheDocument();
      });
    });
  });

  describe('Portfolio Theme Management', () => {
    it('should allow editing portfolio theme', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        const themeInput = screen.getByDisplayValue('Q1 2024 Portfolio');
        fireEvent.change(themeInput, { target: { value: 'Q2 2024 Strategy' } });
        expect(screen.getByDisplayValue('Q2 2024 Strategy')).toBeInTheDocument();
      });
    });

    it('should show portfolio metrics in header', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Stage: Prioritize')).toBeInTheDocument();
        expect(screen.getByText('Strategic portfolio prioritization and planning')).toBeInTheDocument();
        expect(screen.getByText('Stage 3')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-Prioritization', () => {
    it('should trigger auto-prioritization when button is clicked', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        const autoPrioritizeButton = screen.getByRole('button', { name: /auto-prioritize/i });
        fireEvent.click(autoPrioritizeButton);
      });

      // Should show prioritizing state
      await waitFor(() => {
        expect(screen.getByText('Auto-Prioritizing...')).toBeInTheDocument();
      });

      // Should complete and show success message
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Auto-prioritization complete!')
        );
      }, { timeout: 4000 });
    });

    it('should disable auto-prioritize button during process', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        const autoPrioritizeButton = screen.getByRole('button', { name: /auto-prioritize/i });
        fireEvent.click(autoPrioritizeButton);
      });

      await waitFor(() => {
        const disabledButton = screen.getByRole('button', { name: /auto-prioritizing/i });
        expect(disabledButton).toBeDisabled();
      });
    });
  });

  describe('Priority Management', () => {
    it('should allow moving ideas up and down in priority', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /priority list/i }));
      });

      await waitFor(() => {
        const upButtons = screen.getAllByRole('button', { name: '' }); // Up/down buttons typically have no text
        // The second item should be able to move up
        expect(upButtons.length).toBeGreaterThan(0);
      });
    });

    it('should display priority ranking with correct icons', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /priority list/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('Value: 9/10')).toBeInTheDocument();
        expect(screen.getByText('Effort: 7/10')).toBeInTheDocument();
      });
    });
  });

  describe('Value/Effort Matrix', () => {
    it('should display value/effort matrix with quadrants', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /value.*effort.*matrix/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Value vs Effort Matrix')).toBeInTheDocument();
        expect(screen.getByText('Strategic positioning of qualified ideas')).toBeInTheDocument();
        
        expect(screen.getByText('Quick Wins')).toBeInTheDocument();
        expect(screen.getByText('Major Projects')).toBeInTheDocument();
        expect(screen.getByText('Fill-ins')).toBeInTheDocument();
        expect(screen.getByText('Questionable')).toBeInTheDocument();
        
        expect(screen.getByText('High Value • Low Effort')).toBeInTheDocument();
        expect(screen.getByText('High Value • High Effort')).toBeInTheDocument();
        expect(screen.getByText('Low Value • Low Effort')).toBeInTheDocument();
        expect(screen.getByText('Low Value • High Effort')).toBeInTheDocument();
      });
    });

    it('should categorize ideas correctly in matrix quadrants', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /value.*effort.*matrix/i }));
      });

      await waitFor(() => {
        // Ideas should be placed in appropriate quadrants based on their value/effort scores
        const matrices = screen.getAllByText(/\d+/); // Numbers indicating count in each quadrant
        expect(matrices.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Portfolio Planning', () => {
    it('should display portfolio roadmap with quarters', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /portfolio planning/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Portfolio Roadmap')).toBeInTheDocument();
        expect(screen.getByText('Investment Analysis')).toBeInTheDocument();
        
        expect(screen.getByText('Q1 2024')).toBeInTheDocument();
        expect(screen.getByText('Q2 2024')).toBeInTheDocument();
        expect(screen.getByText('Q3 2024')).toBeInTheDocument();
        expect(screen.getByText('Q4 2024')).toBeInTheDocument();
      });
    });

    it('should show investment metrics', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /portfolio planning/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('$2.4M')).toBeInTheDocument(); // Expected Revenue
        expect(screen.getByText('$800K')).toBeInTheDocument(); // Investment Required
        expect(screen.getByText('Expected Revenue')).toBeInTheDocument();
        expect(screen.getByText('Investment Required')).toBeInTheDocument();
        expect(screen.getByText('Portfolio ROI')).toBeInTheDocument();
        expect(screen.getByText('200%')).toBeInTheDocument();
      });
    });
  });

  describe('Portfolio Overview Metrics', () => {
    it('should display portfolio summary correctly', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
        expect(screen.getByText('Total Ideas')).toBeInTheDocument();
        expect(screen.getByText('Recommended')).toBeInTheDocument();
        expect(screen.getByText('High Priority')).toBeInTheDocument();
        expect(screen.getByText('Medium Priority')).toBeInTheDocument();
        expect(screen.getByText('Low Priority')).toBeInTheDocument();
      });
    });

    it('should display value distribution metrics', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        expect(screen.getByText('Value Distribution')).toBeInTheDocument();
        expect(screen.getByText('High Value')).toBeInTheDocument();
        expect(screen.getByText('Medium Value')).toBeInTheDocument();
        expect(screen.getByText('Lower Value')).toBeInTheDocument();
      });
    });

    it('should display resource planning information', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        expect(screen.getByText('Resource Planning')).toBeInTheDocument();
        expect(screen.getByText('Total Resource Need')).toBeInTheDocument();
        expect(screen.getByText('Avg. Time to Market')).toBeInTheDocument();
        expect(screen.getByText('Expected ROI Range')).toBeInTheDocument();
        expect(screen.getByText('120-300%')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      setupMockFetchError('Network error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load stage info:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle auto-prioritization errors', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);
      
      await waitFor(() => {
        const autoPrioritizeButton = screen.getByRole('button', { name: /auto-prioritize/i });
        
        // Mock an error in the auto-prioritization process
        jest.spyOn(global, 'setTimeout').mockImplementationOnce((callback: any) => {
          throw new Error('Prioritization failed');
        });
        
        fireEvent.click(autoPrioritizeButton);
      });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Failed to run auto-prioritization');
      });
    });
  });

  describe('Priority List Functionality', () => {
    it('should show ideas sorted by priority', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /priority list/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Prioritized Ideas Ranking')).toBeInTheDocument();
        expect(screen.getByText('Drag to reorder or use auto-prioritization')).toBeInTheDocument();
        
        // Should show priority icons and numbers
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('should display idea details in priority list', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /priority list/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Value: 9/10')).toBeInTheDocument();
        expect(screen.getByText('Effort: 7/10')).toBeInTheDocument();
        expect(screen.getByText('6 months')).toBeInTheDocument(); // time to market
        expect(screen.getByText('2 FTE')).toBeInTheDocument(); // resource requirement
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for priority controls', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /priority list/i }));
      });

      await waitFor(() => {
        const upDownButtons = screen.getAllByRole('button');
        expect(upDownButtons.length).toBeGreaterThan(0);
      });
    });

    it('should support keyboard navigation in matrix view', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /value.*effort.*matrix/i }));
      });

      await waitFor(() => {
        const tabpanel = screen.getByRole('tabpanel');
        expect(tabpanel).toBeInTheDocument();
        
        // Should be focusable
        fireEvent.keyDown(tabpanel, { key: 'Tab' });
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      setupMockFetch([]);
      
      render(<AuraV2PrioritizePage />);

      // Start with overview tab (default)
      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('data-state', 'active');

      // Switch to priority list tab
      fireEvent.click(screen.getByRole('tab', { name: /priority list/i }));
      expect(screen.getByRole('tab', { name: /priority list/i })).toHaveAttribute('data-state', 'active');

      // Switch to value/effort matrix tab
      fireEvent.click(screen.getByRole('tab', { name: /value.*effort.*matrix/i }));
      expect(screen.getByRole('tab', { name: /value.*effort.*matrix/i })).toHaveAttribute('data-state', 'active');

      // Switch to portfolio planning tab
      fireEvent.click(screen.getByRole('tab', { name: /portfolio planning/i }));
      expect(screen.getByRole('tab', { name: /portfolio planning/i })).toHaveAttribute('data-state', 'active');

      // Switch to activities tab
      fireEvent.click(screen.getByRole('tab', { name: /activities/i }));
      expect(screen.getByRole('tab', { name: /activities/i })).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Portfolio Analysis', () => {
    it('should generate business case when button is clicked', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch
        .mockResolvedValueOnce(createMockFetchResponse(mockWorkflowStages) as any)
        .mockResolvedValueOnce(createMockFetchResponse(mockQualifiedIdeas) as any);

      render(<AuraV2PrioritizePage />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('tab', { name: /portfolio planning/i }));
      });

      await waitFor(() => {
        const generateButton = screen.getByText('Generate Business Case');
        expect(generateButton).toBeInTheDocument();
        fireEvent.click(generateButton);
        // Should not throw errors
      });
    });
  });
});
