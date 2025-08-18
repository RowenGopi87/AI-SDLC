import { jest } from '@jest/globals';

// Mock the database connection
jest.mock('@/lib/database/connection', () => ({
  db: {
    execute: jest.fn(),
  }
}));

// Create mock service instance
const mockAuraV2Service = {
  getWorkflowStages: jest.fn(),
  getQualifiedIdeas: jest.fn(),
  createQualifiedIdea: jest.fn(),
  getPortfolioPrioritization: jest.fn(),
  updateQualifiedIdeaPriority: jest.fn(),
  assessBusinessBriefQuality: jest.fn(),
  getBusinessBriefExtension: jest.fn(),
};

jest.mock('@/lib/database/aurav2-service', () => ({
  auraV2Service: mockAuraV2Service,
  getAuraV2Service: jest.fn().mockResolvedValue(mockAuraV2Service),
}));

import { GET as getWorkflowStages } from '@/app/api/aurav2/workflow/stages/route';
import { GET as getQualifiedIdeas, POST as createQualifiedIdea } from '@/app/api/aurav2/qualify/ideas/route';
import { GET as getPortfolio, POST as updatePortfolio } from '@/app/api/aurav2/prioritize/portfolio/route';
import { GET as getQualityAssessment, POST as runQualityAssessment } from '@/app/api/aurav2/ai/assess-quality/route';
import { getAuraV2Service } from '@/lib/database/aurav2-service';

describe('AuraV2 API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Workflow Stages API', () => {
    it('should return workflow stages successfully', async () => {
      const mockStages = [
        { id: 'idea', name: 'Idea Stage', stageOrder: 1 },
        { id: 'qualify', name: 'Qualify Stage', stageOrder: 2 },
        { id: 'prioritize', name: 'Prioritize Stage', stageOrder: 3 }
      ];
      
      mockAuraV2Service.getWorkflowStages.mockResolvedValue(mockStages);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/workflow/stages');
      const response = await getWorkflowStages(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStages);
      expect(mockAuraV2Service.getWorkflowStages).toHaveBeenCalledWith(undefined);
    });

    it('should handle workflow type parameter', async () => {
      const mockStages = [{ id: 'idea', name: 'Idea Stage', workflowType: 'new_system' }];
      mockAuraV2Service.getWorkflowStages.mockResolvedValue(mockStages);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/workflow/stages?workflowType=new_system');
      const response = await getWorkflowStages(mockRequest);
      
      expect(mockAuraV2Service.getWorkflowStages).toHaveBeenCalledWith('new_system');
    });

    it('should handle database errors', async () => {
      mockAuraV2Service.getWorkflowStages.mockRejectedValue(new Error('Database connection failed'));
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/workflow/stages');
      const response = await getWorkflowStages(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to retrieve workflow stages');
    });
  });

  describe('Qualified Ideas API', () => {
    it('should get qualified ideas successfully', async () => {
      const mockIdeas = [
        { id: 'QI-001', title: 'Test Idea 1', qualificationScore: 8.5 },
        { id: 'QI-002', title: 'Test Idea 2', qualificationScore: 7.2 }
      ];
      
      mockAuraV2Service.getQualifiedIdeas.mockResolvedValue(mockIdeas);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/qualify/ideas');
      const response = await getQualifiedIdeas(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockIdeas);
    });

    it('should create qualified idea successfully', async () => {
      const newIdea = {
        businessBriefId: 'BB-001',
        title: 'New Qualified Idea',
        qualificationScore: 8.0,
        criteria: { marketDemand: 8, technicalFeasibility: 7 }
      };
      
      const createdIdea = { id: 'QI-NEW', ...newIdea };
      mockAuraV2Service.createQualifiedIdea.mockResolvedValue(createdIdea);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/qualify/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea)
      });
      
      const response = await createQualifiedIdea(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('QI-NEW');
    });

    it('should validate required fields when creating qualified idea', async () => {
      const invalidData = { title: 'Test' }; // Missing businessBriefId
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/qualify/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });
      
      const response = await createQualifiedIdea(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Business brief ID is required');
    });
  });

  describe('Portfolio Prioritization API', () => {
    it('should get portfolio data successfully', async () => {
      const mockPortfolio = {
        portfolioSummary: { totalIdeas: 5, qualifiedIdeas: 3 },
        prioritizedIdeas: [],
        valueEffortMatrix: { matrix: {}, insights: {} },
        roadmapQuarters: {}
      };
      
      mockAuraV2Service.getPortfolioPrioritization.mockResolvedValue(mockPortfolio);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/prioritize/portfolio');
      const response = await getPortfolio(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPortfolio);
    });

    it('should update portfolio priorities successfully', async () => {
      const updateData = {
        qualifiedIdeas: [
          { id: 'QI-001', priority: 1, portfolioQuarter: 'Q1 2024' },
          { id: 'QI-002', priority: 2, portfolioQuarter: 'Q1 2024' }
        ]
      };
      
      mockAuraV2Service.updateQualifiedIdeaPriority.mockResolvedValue(undefined);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/prioritize/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const response = await updatePortfolio(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockAuraV2Service.updateQualifiedIdeaPriority).toHaveBeenCalledTimes(2);
    });

    it('should validate qualified ideas array', async () => {
      const invalidData = { qualifiedIdeas: 'not-an-array' };
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/prioritize/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });
      
      const response = await updatePortfolio(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Qualified ideas array is required');
    });
  });

  describe('AI Quality Assessment API', () => {
    it('should get existing quality assessment', async () => {
      const mockExtension = {
        id: 'EXT-001',
        businessBriefId: 'BB-001',
        qualityScore: 0.85,
        aiAnalysis: {
          estimatedQualityLevel: 'Very Good',
          recommendations: ['Test recommendation 1', 'Test recommendation 2', 'Test recommendation 3'],
          requiredActions: ['Action 1'],
          assessedAt: '2024-01-01T00:00:00Z'
        }
      };
      
      mockAuraV2Service.getBusinessBriefExtension.mockResolvedValue(mockExtension);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/ai/assess-quality?businessBriefId=BB-001');
      const response = await getQualityAssessment(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary.score).toBe(0.85);
      expect(data.data.summary.level).toBe('Very Good');
      expect(data.data.summary.recommendations).toBe(3);
    });

    it('should run new quality assessment', async () => {
      const requestData = { businessBriefId: 'BB-001', userId: 'user123' };
      const mockAssessment = {
        id: 'ASSESS-001',
        overallScore: 0.75,
        estimatedQualityLevel: 'Good',
        recommendations: ['Improve clarity', 'Add metrics'],
        requiredActions: ['Review scope']
      };
      
      mockAuraV2Service.assessBusinessBriefQuality.mockResolvedValue(mockAssessment);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/ai/assess-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const response = await runQualityAssessment(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary.score).toBe(0.75);
      expect(data.data.summary.level).toBe('Good');
      expect(data.data.summary.recommendations).toBe(2);
      expect(mockAuraV2Service.assessBusinessBriefQuality).toHaveBeenCalledWith('BB-001');
    });

    it('should validate business brief ID parameter', async () => {
      const mockRequest = new Request('http://localhost:3000/api/aurav2/ai/assess-quality');
      const response = await getQualityAssessment(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required parameter');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      (getAuraV2Service as jest.Mock).mockRejectedValue(new Error('Database connection failed'));
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/workflow/stages');
      const response = await getWorkflowStages(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Database connection failed');
    });

    it('should handle service method errors', async () => {
      mockAuraV2Service.getWorkflowStages.mockRejectedValue(new Error('Service method failed'));
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/workflow/stages');
      const response = await getWorkflowStages(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Service method failed');
    });
  });

  describe('Request Parameter Handling', () => {
    it('should handle query parameters correctly', async () => {
      // Reset mocks to ensure clean state
      jest.clearAllMocks();
      mockAuraV2Service.getQualifiedIdeas.mockResolvedValue([]);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/qualify/ideas?status=proceed&limit=10&offset=5');
      await getQualifiedIdeas(mockRequest);
      
      expect(mockAuraV2Service.getQualifiedIdeas).toHaveBeenCalledWith({
        status: 'proceed',
        limit: 10,
        offset: 5
      });
    });

    it('should handle missing optional parameters', async () => {
      // Reset mocks to ensure clean state
      jest.clearAllMocks();
      mockAuraV2Service.getQualifiedIdeas.mockResolvedValue([]);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/qualify/ideas');
      await getQualifiedIdeas(mockRequest);
      
      expect(mockAuraV2Service.getQualifiedIdeas).toHaveBeenCalledWith({
        status: undefined,
        limit: undefined,
        offset: undefined
      });
    });

    it('should parse numeric parameters correctly', async () => {
      // Reset mocks to ensure clean state
      jest.clearAllMocks();
      mockAuraV2Service.getQualifiedIdeas.mockResolvedValue([]);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/qualify/ideas?limit=invalid&offset=abc');
      await getQualifiedIdeas(mockRequest);
      
      expect(mockAuraV2Service.getQualifiedIdeas).toHaveBeenCalledWith({
        status: undefined,
        limit: NaN,
        offset: NaN
      });
    });
  });

  describe('Response Format Validation', () => {
    it('should return consistent response format for successful requests', async () => {
      const mockData = [{ id: 'test', name: 'Test Stage' }];
      mockAuraV2Service.getWorkflowStages.mockResolvedValue(mockData);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/workflow/stages');
      const response = await getWorkflowStages(mockRequest);
      const data = await response.json();
      
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data', mockData);
      expect(data).toHaveProperty('message', expect.stringContaining('Retrieved'));
    });

    it('should return consistent error format for failed requests', async () => {
      mockAuraV2Service.getWorkflowStages.mockRejectedValue(new Error('Test error'));
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/workflow/stages');
      const response = await getWorkflowStages(mockRequest);
      const data = await response.json();
      
      expect(data).toHaveProperty('success', false);
              expect(data).toHaveProperty('error', 'Failed to retrieve workflow stages');
      expect(data).toHaveProperty('message', 'Test error');
    });
  });

  describe('AI Quality Assessment Integration', () => {
    it('should process quality assessment data correctly', async () => {
      const mockAssessment = {
        id: 'ASSESS-001',
        overallScore: 0.85,
        estimatedQualityLevel: 'Very Good',
        criteria: {
          clarity: { score: 0.9, feedback: 'Clear and well-defined' },
          completeness: { score: 0.8, feedback: 'Most fields completed' }
        },
        recommendations: ['Add more KPIs', 'Include timeline'],
        requiredActions: ['Review criteria']
      };
      
      mockAuraV2Service.assessBusinessBriefQuality.mockResolvedValue(mockAssessment);
      
      const mockRequest = new Request('http://localhost:3000/api/aurav2/ai/assess-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessBriefId: 'BB-001', userId: 'user123' })
      });
      
      const response = await runQualityAssessment(mockRequest);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary.score).toBe(0.85);
      expect(data.data.summary.level).toBe('Very Good');
      expect(data.data.summary.recommendations).toBe(2);
    });
  });
});
