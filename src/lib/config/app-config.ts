// AuraV2 Configuration - Easily replaceable app naming and settings
export const APP_CONFIG = {
  // Application Naming (easily replaceable)
  APP_NAME: 'AuraV2',
  APP_FULL_NAME: 'AURA Version 2',
  APP_DESCRIPTION: '',
  
  // Version Management
  VERSION: '2.0.0',
  API_VERSION: 'v2',
  
  // Feature Flags
  FEATURES: {
    LEGACY_MODE: true, // Keep old application accessible
    AI_CONSOLIDATION: true, // Enable AI-powered workflow consolidation
    ROLE_ACCESS_CONTROL: true, // Basic role-based access
    WORKFLOW_AUTOMATION: true, // Automated stage transitions
  },
  
  // Workflow Configuration
  WORKFLOW_TYPES: {
    NEW_SYSTEM: 'new_system',
    ENHANCEMENT: 'enhancement'
  },
  
  // Roles Configuration
  ROLES: {
    PRODUCT_OWNER: 'product_owner',
    PRODUCT_MANAGER: 'product_manager', 
    PORTFOLIO_MANAGER: 'portfolio_manager',
    DELIVERY_MANAGER: 'delivery_manager',
    BUSINESS_OWNER: 'business_owner',
    ART_LEADERSHIP: 'art_leadership',
    INITIATIVE_LEAD: 'initiative_lead'
  },
  
  // Stage Access Matrix
  STAGE_ACCESS: {
    idea: ['product_owner', 'product_manager', 'portfolio_manager', 'business_owner'],
    qualify: ['product_manager', 'portfolio_manager', 'business_owner'],
    prioritize: ['portfolio_manager', 'delivery_manager', 'art_leadership'],
    discovery: ['portfolio_manager', 'initiative_lead', 'art_leadership'],
    execution: ['art_leadership', 'delivery_manager']
  },
  
  // AI Configuration
  AI_FEATURES: {
    STAGE_CONSOLIDATION: true,
    SMART_RECOMMENDATIONS: true,
    AUTO_QUALITY_ASSESSMENT: true,
    INTELLIGENT_ROUTING: true
  }
} as const;

// Type definitions for configuration
export type AppRole = typeof APP_CONFIG.ROLES[keyof typeof APP_CONFIG.ROLES];
export type WorkflowType = typeof APP_CONFIG.WORKFLOW_TYPES[keyof typeof APP_CONFIG.WORKFLOW_TYPES];
export type WorkflowStage = keyof typeof APP_CONFIG.STAGE_ACCESS;

// Helper functions
export const hasStageAccess = (userRole: AppRole, stage: WorkflowStage): boolean => {
  return APP_CONFIG.STAGE_ACCESS[stage]?.includes(userRole) || false;
};

export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.FEATURES): boolean => {
  return APP_CONFIG.FEATURES[feature];
};
