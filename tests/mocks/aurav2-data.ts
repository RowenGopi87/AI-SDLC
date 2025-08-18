// Mock data for AuraV2 testing
export const mockBusinessBriefs = [
  {
    id: 'BB-TEST-001',
    title: 'Test Customer Portal Enhancement',
    description: 'Enhance the customer portal with modern UI and improved functionality for better user experience',
    businessOwner: 'Test Owner',
    status: 'approved' as const,
    priority: 'high' as const,
    workflowStage: 'idea',
    createdAt: '2024-01-15T10:00:00Z',
    leadBusinessUnit: 'Digital Products',
    primaryStrategicTheme: 'Digital Transformation',
    businessObjective: 'Improve customer satisfaction and reduce support calls by 30%',
    quantifiableBusinessOutcomes: 'Increase customer satisfaction scores by 25%, reduce support tickets by 30%',
    inScope: 'Customer portal UI/UX redesign, self-service capabilities, mobile optimization',
    outOfScope: 'Backend API changes, third-party integrations',
    impactOfDoNothing: 'Customer satisfaction will continue to decline, support costs will increase'
  },
  {
    id: 'BB-TEST-002',
    title: 'Test Mobile App Redesign',
    description: 'Complete redesign of mobile application with modern UX principles',
    businessOwner: 'Mobile Team Lead',
    status: 'approved' as const,
    priority: 'medium' as const,
    workflowStage: 'idea',
    createdAt: '2024-01-16T14:30:00Z',
    leadBusinessUnit: 'Mobile Development',
    primaryStrategicTheme: 'Mobile First',
    businessObjective: 'Increase mobile app engagement and user retention',
    quantifiableBusinessOutcomes: 'Increase daily active users by 40%, improve app store rating to 4.5+',
    inScope: 'UI/UX redesign, performance optimization, new features',
    outOfScope: 'Backend infrastructure changes',
    impactOfDoNothing: 'Mobile market share will decline, user acquisition costs will increase'
  }
];

export const mockQualifiedIdeas = [
  {
    id: 'QI-TEST-001',
    businessBriefId: 'BB-TEST-001',
    title: 'Test Customer Portal Enhancement',
    description: 'Qualified idea for customer portal enhancement',
    qualificationScore: 8.5,
    businessValue: 9,
    complexity: 6,
    effort: 7,
    riskLevel: 3,
    strategicAlignment: 9,
    marketImpact: 8,
    priority: 1,
    recommendedAction: 'proceed' as const,
    qualifiedAt: '2024-01-17T09:00:00Z',
    qualifiedBy: 'Test Analyst',
    estimatedROI: '300%',
    timeToMarket: '6 months',
    resourceRequirement: '2 FTE',
    criteria: {
      marketDemand: 8,
      technicalFeasibility: 7,
      businessValue: 9,
      resourceAvailability: 6,
      strategicAlignment: 9,
      riskLevel: 3
    }
  },
  {
    id: 'QI-TEST-002',
    businessBriefId: 'BB-TEST-002',
    title: 'Test Mobile App Redesign',
    description: 'Qualified idea for mobile app redesign',
    qualificationScore: 7.8,
    businessValue: 8,
    complexity: 8,
    effort: 9,
    riskLevel: 5,
    strategicAlignment: 7,
    marketImpact: 9,
    priority: 2,
    recommendedAction: 'proceed' as const,
    qualifiedAt: '2024-01-17T11:00:00Z',
    qualifiedBy: 'Test Analyst',
    estimatedROI: '250%',
    timeToMarket: '9 months',
    resourceRequirement: '4 FTE',
    criteria: {
      marketDemand: 9,
      technicalFeasibility: 6,
      businessValue: 8,
      resourceAvailability: 5,
      strategicAlignment: 7,
      riskLevel: 5
    }
  }
];

export const mockWorkflowStages = [
  {
    id: 'idea',
    name: 'Capture Idea as Business Brief',
    description: 'Outlines a new business idea and facilitating effective decision-making',
    icon: 'lightbulb',
    definitionOfReady: [
      'Idea to be pursued identified',
      'Business features or tech enablers defined',
      'Business Sponsor identified'
    ],
    keyPlayers: [
      { role: 'business_owner', name: 'Business Owner (BO)' },
      { role: 'business_sponsor', name: 'Business Sponsor' },
      { role: 'portfolio_leadership', name: 'Portfolio Leadership' }
    ],
    definitionOfDone: [
      'Idea captured as Business Brief',
      'High level impact analysis completed',
      'Ready to be Qualified'
    ],
    activities: [
      { owner: 'BO', activity: 'Raise and submit the Idea via the Idea Management tool' },
      { owner: 'BO', activity: 'Present the idea to stakeholders' }
    ],
    referenceDocuments: ['Idea Management App', 'Idea Management Workflow']
  },
  {
    id: 'qualify',
    name: 'Qualify the Idea',
    description: 'Research, filter and assess new business ideas against available products',
    icon: 'search',
    definitionOfReady: [
      'Business brief captured',
      'Idea impact assessment completed'
    ],
    keyPlayers: [
      { role: 'business_owner', name: 'Business Owner (BO)' },
      { role: 'portfolio_leadership', name: 'Portfolio Leadership' }
    ],
    definitionOfDone: [
      'Idea qualification complete',
      'Owning ART identified',
      'Business brief qualified'
    ],
    activities: [
      { owner: 'MPD', activity: 'Manage the Idea Backlog and lifecycle' },
      { owner: 'BO', activity: 'Present the business brief to IT stakeholders' }
    ],
    referenceDocuments: ['Idea Management App']
  }
];

export const mockAIAssessments = {
  'BB-TEST-001': {
    summary: {
      score: 0.85,
      level: 'Very Good',
      recommendations: 3
    },
    assessment: {
      recommendations: [
        'Consider adding more specific KPIs',
        'Define clearer success metrics',
        'Include technical architecture overview'
      ]
    }
  },
  'BB-TEST-002': {
    summary: {
      score: 0.72,
      level: 'Good',
      recommendations: 2
    },
    assessment: {
      recommendations: [
        'Add more detailed resource requirements',
        'Include risk mitigation strategies'
      ]
    }
  }
};

// Helper function to create mock fetch responses
export const createMockFetchResponse = (data: any, success = true) => ({
  ok: success,
  json: () => Promise.resolve({
    success,
    data,
    message: success ? 'Success' : 'Error'
  })
});

// Common test utilities
export const testUtils = {
  // Simulate user interaction delay
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create mock event
  createMockEvent: (value: string) => ({
    target: { value },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  }),
  
  // Mock localStorage
  mockLocalStorage: () => {
    const store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      })
    };
  }
};
