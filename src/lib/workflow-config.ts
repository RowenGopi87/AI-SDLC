// Workflow Configuration System for Multi-Tenant Support

export interface WorkflowLevel {
  id: string;
  name: string;
  pluralName: string;
  description: string;
  parentLevel?: string;
  childLevel?: string;
  icon: string;
  color: string;
  maxItems?: number; // Optional limit on items at this level
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  organization: string;
  levels: WorkflowLevel[];
  mappings: {
    // Maps current AURA concepts to this workflow
    businessBrief: string; // Which level represents business briefs
    requirements: string; // Which level represents requirements  
    workItems: string; // Which level represents decomposed work
    testableItems: string; // Which level can have test cases
  };
  aiPromptContext: {
    // Context for AI to understand this workflow
    topLevel: string;
    decompositionFlow: string[];
    requirementGeneration: string;
  };
}

// Your specific workflow configuration
export const USER_WORKFLOW: WorkflowConfig = {
  id: "initiative-feature-epic-story",
  name: "Initiative → Feature → Epic → Story",
  description: "Business initiatives broken down into features, then epics, then stories",
  organization: "Custom Organization",
  levels: [
    {
      id: "initiative",
      name: "Initiative",
      pluralName: "Initiatives", 
      description: "High-level business initiatives that drive value",
      childLevel: "feature",
      icon: "Target",
      color: "purple",
    },
    {
      id: "feature",
      name: "Feature",
      pluralName: "Features",
      description: "Major features that comprise an initiative",
      parentLevel: "initiative",
      childLevel: "epic", 
      icon: "Layers",
      color: "blue",
    },
    {
      id: "epic",
      name: "Epic",
      pluralName: "Epics",
      description: "Large bodies of work that can be broken down into stories",
      parentLevel: "feature",
      childLevel: "story",
      icon: "BookOpen", 
      color: "green",
    },
    {
      id: "story",
      name: "Story",
      pluralName: "Stories",
      description: "Small, testable pieces of functionality",
      parentLevel: "epic",
      icon: "FileText",
      color: "orange",
    }
  ],
  mappings: {
    businessBrief: "initiative", // Business briefs map to initiatives
    requirements: "feature", // Requirements map to features
    workItems: "story", // Work items map to stories
    testableItems: "story", // Stories are testable
  },
  aiPromptContext: {
    topLevel: "initiative", 
    decompositionFlow: ["initiative", "feature", "epic", "story"],
    requirementGeneration: "Generate features for the given business initiative, then break features into epics, and epics into stories",
  }
};

// Alternative workflow for other organizations
export const ALTERNATIVE_WORKFLOW: WorkflowConfig = {
  id: "initiative-epic-feature-story", 
  name: "Initiative → Epic → Feature → Story",
  description: "Business initiatives broken down into epics, then features, then stories",
  organization: "Alternative Organization",
  levels: [
    {
      id: "initiative",
      name: "Initiative", 
      pluralName: "Initiatives",
      description: "High-level business initiatives",
      childLevel: "epic",
      icon: "Target",
      color: "purple",
    },
    {
      id: "epic",
      name: "Epic",
      pluralName: "Epics", 
      description: "Large themes of work within an initiative",
      parentLevel: "initiative",
      childLevel: "feature",
      icon: "BookOpen",
      color: "green", 
    },
    {
      id: "feature",
      name: "Feature",
      pluralName: "Features",
      description: "Specific features within an epic", 
      parentLevel: "epic",
      childLevel: "story",
      icon: "Layers",
      color: "blue",
    },
    {
      id: "story", 
      name: "Story",
      pluralName: "Stories",
      description: "Small, testable pieces of functionality",
      parentLevel: "feature",
      icon: "FileText",
      color: "orange",
    }
  ],
  mappings: {
    businessBrief: "initiative",
    requirements: "epic", 
    workItems: "story",
    testableItems: "story",
  },
  aiPromptContext: {
    topLevel: "initiative",
    decompositionFlow: ["initiative", "epic", "feature", "story"], 
    requirementGeneration: "Generate epics for the given business initiative, then break epics into features, and features into stories",
  }
};

// Default/Current AURA workflow for backward compatibility
export const DEFAULT_AURA_WORKFLOW: WorkflowConfig = {
  id: "usecase-requirement-workitem",
  name: "Use Case → Requirement → Work Item", 
  description: "Traditional AURA workflow",
  organization: "Default AURA",
  levels: [
    {
      id: "use-case",
      name: "Use Case",
      pluralName: "Use Cases",
      description: "Business use cases and scenarios",
      childLevel: "requirement", 
      icon: "FileText",
      color: "blue",
    },
    {
      id: "requirement", 
      name: "Requirement",
      pluralName: "Requirements",
      description: "Functional and non-functional requirements",
      parentLevel: "use-case",
      childLevel: "work-item",
      icon: "Settings", 
      color: "purple",
    },
    {
      id: "work-item",
      name: "Work Item", 
      pluralName: "Work Items",
      description: "Implementation work items",
      parentLevel: "requirement",
      icon: "GitBranch",
      color: "green",
    }
  ],
  mappings: {
    businessBrief: "use-case",
    requirements: "requirement",
    workItems: "work-item", 
    testableItems: "work-item",
  },
  aiPromptContext: {
    topLevel: "use-case",
    decompositionFlow: ["use-case", "requirement", "work-item"],
    requirementGeneration: "Generate requirements for the given use case, then break requirements into work items",
  }
};

// Available workflow configurations
export const AVAILABLE_WORKFLOWS: WorkflowConfig[] = [
  USER_WORKFLOW,
  ALTERNATIVE_WORKFLOW, 
  DEFAULT_AURA_WORKFLOW,
];

// Current active workflow (can be configured per organization)
export const CURRENT_WORKFLOW = USER_WORKFLOW;

// Utility functions
export function getWorkflowLevel(levelId: string): WorkflowLevel | undefined {
  return CURRENT_WORKFLOW.levels.find(level => level.id === levelId);
}

export function getWorkflowLevelByMapping(mapping: keyof WorkflowConfig['mappings']): WorkflowLevel | undefined {
  const levelId = CURRENT_WORKFLOW.mappings[mapping];
  return getWorkflowLevel(levelId);
}

export function getChildLevels(parentLevelId: string): WorkflowLevel[] {
  return CURRENT_WORKFLOW.levels.filter(level => level.parentLevel === parentLevelId);
}

export function getParentLevel(childLevelId: string): WorkflowLevel | undefined {
  const childLevel = getWorkflowLevel(childLevelId);
  return childLevel?.parentLevel ? getWorkflowLevel(childLevel.parentLevel) : undefined;
}

export function getWorkflowHierarchy(): WorkflowLevel[] {
  // Return levels in hierarchical order (top to bottom)
  const result: WorkflowLevel[] = [];
  const processed = new Set<string>();
  
  // Find root level (no parent)
  const rootLevel = CURRENT_WORKFLOW.levels.find(level => !level.parentLevel);
  if (!rootLevel) return CURRENT_WORKFLOW.levels; // Fallback
  
  // Build hierarchy recursively
  function addLevel(level: WorkflowLevel) {
    if (processed.has(level.id)) return;
    processed.add(level.id);
    result.push(level);
    
    const children = getChildLevels(level.id);
    children.forEach(addLevel);
  }
  
  addLevel(rootLevel);
  return result;
}

export function isTestableLevel(levelId: string): boolean {
  return CURRENT_WORKFLOW.mappings.testableItems === levelId;
}

export function getAIPromptContext(): string {
  const context = CURRENT_WORKFLOW.aiPromptContext;
  return `
Current workflow: ${CURRENT_WORKFLOW.name}
Decomposition flow: ${context.decompositionFlow.join(' → ')}
Requirement generation approach: ${context.requirementGeneration}

Level definitions:
${CURRENT_WORKFLOW.levels.map(level => 
  `- ${level.name}: ${level.description}`
).join('\n')}
  `.trim();
} 