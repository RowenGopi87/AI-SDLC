// Mock API utilities for testing
import { mockBusinessBriefs, mockQualifiedIdeas, mockWorkflowStages, mockAIAssessments } from '../mocks/aurav2-data';

export class MockAPI {
  private static businessBriefs = [...mockBusinessBriefs];
  private static qualifiedIdeas = [...mockQualifiedIdeas];
  private static workflowStages = [...mockWorkflowStages];

  static setupMockFetch() {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    return mockFetch;
  }

  static mockBusinessBriefsAPI(fetch: jest.MockedFunction<typeof global.fetch>) {
    fetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = url.toString();
      
      if (urlStr.includes('/api/business-briefs/list')) {
        const urlObj = new URL(urlStr, 'http://localhost:3000');
        const status = urlObj.searchParams.get('status');
        
        let filteredBriefs = this.businessBriefs;
        if (status) {
          filteredBriefs = filteredBriefs.filter(brief => brief.status === status);
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: filteredBriefs,
            message: 'Business briefs retrieved successfully'
          })
        } as Response);
      }
      
      if (urlStr.includes('/api/business-briefs/') && options?.method === 'PUT') {
        const briefId = urlStr.split('/').pop();
        const updateData = JSON.parse(options.body as string);
        
        const briefIndex = this.businessBriefs.findIndex(b => b.id === briefId);
        if (briefIndex !== -1) {
          this.businessBriefs[briefIndex] = { ...this.businessBriefs[briefIndex], ...updateData };
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: this.businessBriefs[briefIndex],
            message: 'Business brief updated successfully'
          })
        } as Response);
      }
      
      if (urlStr.includes('/api/business-briefs/') && options?.method === 'DELETE') {
        const briefId = urlStr.split('/').pop();
        this.businessBriefs = this.businessBriefs.filter(b => b.id !== briefId);
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: 'Business brief deleted successfully'
          })
        } as Response);
      }
      
      return Promise.reject(new Error('Unhandled API call: ' + urlStr));
    });
  }

  static mockQualifyAPI(fetch: jest.MockedFunction<typeof global.fetch>) {
    fetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = url.toString();
      
      if (urlStr.includes('/api/aurav2/qualify/ideas') && options?.method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: this.qualifiedIdeas,
            message: 'Qualified ideas retrieved successfully'
          })
        } as Response);
      }
      
      if (urlStr.includes('/api/aurav2/qualify/ideas') && options?.method === 'POST') {
        const newIdea = JSON.parse(options.body as string);
        const qualifiedIdea = {
          id: `QI-${Date.now()}`,
          ...newIdea,
          qualifiedAt: new Date().toISOString(),
          qualifiedBy: 'Test User'
        };
        
        this.qualifiedIdeas.push(qualifiedIdea);
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: qualifiedIdea,
            message: 'Qualified idea created successfully'
          })
        } as Response);
      }
      
      return Promise.reject(new Error('Unhandled API call: ' + urlStr));
    });
  }

  static mockPrioritizeAPI(fetch: jest.MockedFunction<typeof global.fetch>) {
    fetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = url.toString();
      
      if (urlStr.includes('/api/aurav2/prioritize/portfolio') && options?.method === 'GET') {
        const portfolioData = {
          portfolioSummary: {
            theme: 'Q1 2024 Portfolio',
            totalIdeas: this.qualifiedIdeas.length,
            qualifiedIdeas: this.qualifiedIdeas.filter(q => q.recommendedAction === 'proceed').length,
            averageQualificationScore: 8.2,
            estimatedTotalROI: '550%',
            totalResourceRequirement: '6 FTE',
            portfolioValue: 'High'
          },
          prioritizedIdeas: this.qualifiedIdeas.sort((a, b) => a.priority - b.priority),
          valueEffortMatrix: this.generateValueEffortMatrix(),
          roadmapQuarters: this.generateRoadmapQuarters()
        };
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: portfolioData,
            message: 'Portfolio prioritization retrieved successfully'
          })
        } as Response);
      }
      
      if (urlStr.includes('/api/aurav2/prioritize/portfolio') && options?.method === 'POST') {
        const updateData = JSON.parse(options.body as string);
        
        // Update priorities
        updateData.qualifiedIdeas.forEach((update: any) => {
          const ideaIndex = this.qualifiedIdeas.findIndex(idea => idea.id === update.id);
          if (ideaIndex !== -1) {
            this.qualifiedIdeas[ideaIndex].priority = update.priority;
            if (update.portfolioQuarter) {
              this.qualifiedIdeas[ideaIndex].portfolioQuarter = update.portfolioQuarter;
            }
          }
        });
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: 'Portfolio prioritization updated successfully'
          })
        } as Response);
      }
      
      return Promise.reject(new Error('Unhandled API call: ' + urlStr));
    });
  }

  static mockWorkflowAPI(fetch: jest.MockedFunction<typeof global.fetch>) {
    fetch.mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString();
      
      if (urlStr.includes('/api/aurav2/workflow/stages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: this.workflowStages,
            message: 'Workflow stages retrieved successfully'
          })
        } as Response);
      }
      
      return Promise.reject(new Error('Unhandled API call: ' + urlStr));
    });
  }

  static mockAIAssessmentAPI(fetch: jest.MockedFunction<typeof global.fetch>) {
    fetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = url.toString();
      
      if (urlStr.includes('/api/aurav2/ai/assess-quality') && options?.method === 'GET') {
        const urlObj = new URL(urlStr, 'http://localhost:3000');
        const businessBriefId = urlObj.searchParams.get('businessBriefId');
        const assessment = mockAIAssessments[businessBriefId as keyof typeof mockAIAssessments];
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: assessment || null,
            message: assessment ? 'Quality assessment found' : 'No assessment found'
          })
        } as Response);
      }
      
      if (urlStr.includes('/api/aurav2/ai/assess-quality') && options?.method === 'POST') {
        const requestData = JSON.parse(options.body as string);
        
        const newAssessment = {
          summary: {
            score: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
            level: 'Good',
            recommendations: Math.floor(Math.random() * 5) + 1
          },
          assessment: {
            recommendations: [
              'Consider adding more specific KPIs',
              'Include timeline estimates',
              'Add risk mitigation strategies'
            ]
          }
        };
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: newAssessment,
            message: 'AI assessment completed successfully'
          })
        } as Response);
      }
      
      return Promise.reject(new Error('Unhandled API call: ' + urlStr));
    });
  }

  static setupAllMockAPIs(fetch: jest.MockedFunction<typeof global.fetch>) {
    fetch.mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = url.toString();
      
      // Business Briefs API
      if (urlStr.includes('/api/business-briefs/')) {
        return this.mockBusinessBriefsAPI(fetch);
      }
      
      // Qualified Ideas API
      if (urlStr.includes('/api/aurav2/qualify/ideas')) {
        return this.mockQualifyAPI(fetch);
      }
      
      // Portfolio API
      if (urlStr.includes('/api/aurav2/prioritize/portfolio')) {
        return this.mockPrioritizeAPI(fetch);
      }
      
      // Workflow API
      if (urlStr.includes('/api/aurav2/workflow/stages')) {
        return this.mockWorkflowAPI(fetch);
      }
      
      // AI Assessment API
      if (urlStr.includes('/api/aurav2/ai/assess-quality')) {
        return this.mockAIAssessmentAPI(fetch);
      }
      
      // Default fallback
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'API not mocked',
          message: 'Unhandled API endpoint: ' + urlStr
        })
      } as Response);
    });
  }

  private static generateValueEffortMatrix() {
    return {
      matrix: {
        high_value_low_effort: this.qualifiedIdeas.filter(idea => idea.businessValue >= 7 && idea.effort < 7),
        high_value_high_effort: this.qualifiedIdeas.filter(idea => idea.businessValue >= 7 && idea.effort >= 7),
        low_value_low_effort: this.qualifiedIdeas.filter(idea => idea.businessValue < 7 && idea.effort < 7),
        low_value_high_effort: this.qualifiedIdeas.filter(idea => idea.businessValue < 7 && idea.effort >= 7)
      },
      insights: {
        quickWins: this.qualifiedIdeas.filter(idea => idea.businessValue >= 7 && idea.effort < 7).length,
        majorProjects: this.qualifiedIdeas.filter(idea => idea.businessValue >= 7 && idea.effort >= 7).length,
        fillIns: this.qualifiedIdeas.filter(idea => idea.businessValue < 7 && idea.effort < 7).length,
        questionable: this.qualifiedIdeas.filter(idea => idea.businessValue < 7 && idea.effort >= 7).length
      }
    };
  }

  private static generateRoadmapQuarters() {
    const sortedIdeas = this.qualifiedIdeas.sort((a, b) => a.priority - b.priority);
    return {
      'Q1 2024': sortedIdeas.slice(0, 2),
      'Q2 2024': sortedIdeas.slice(2, 4),
      'Q3 2024': sortedIdeas.slice(4, 6),
      'Q4 2024': sortedIdeas.slice(6, 8)
    };
  }

  // Reset all mock data to initial state
  static resetMockData() {
    this.businessBriefs = [...mockBusinessBriefs];
    this.qualifiedIdeas = [...mockQualifiedIdeas];
    this.workflowStages = [...mockWorkflowStages];
  }

  // Add test data
  static addTestBusinessBrief(brief: any) {
    this.businessBriefs.push(brief);
  }

  static addTestQualifiedIdea(idea: any) {
    this.qualifiedIdeas.push(idea);
  }
}
