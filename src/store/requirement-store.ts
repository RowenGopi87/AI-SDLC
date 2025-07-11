import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Requirement, mockRequirements } from '@/lib/mock-data';
import { GeneratedRequirement } from '@/lib/services/llm-service';

interface RequirementStore {
  requirements: Requirement[];
  selectedRequirement: Requirement | null;
  addRequirement: (requirement: Omit<Requirement, 'id'>) => void;
  addGeneratedRequirements: (useCaseId: string, generatedRequirements: GeneratedRequirement[]) => void;
  addGeneratedRequirementsFromJSON: (useCaseId: string, jsonContent: string) => { success: boolean; requirementsCount: number; };
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  selectRequirement: (id: string) => void;
  clearSelection: () => void;
  getRequirementById: (id: string) => Requirement | undefined;
  getRequirementsByUseCaseId: (useCaseId: string) => Requirement[];
  getRequirementsByStatus: (status: Requirement['status']) => Requirement[];
  getGeneratedRequirementsByUseCaseId: (useCaseId: string) => Requirement[];
}

// Smart JSON parser that can extract requirements from various JSON formats
const parseRequirementsFromJSON = (jsonContent: string): any[] => {
  console.log('Parsing requirements from JSON:', jsonContent.substring(0, 200) + '...');
  
  try {
    // First, try to parse as standard JSON
    const parsed = JSON.parse(jsonContent);
    
    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      console.log('Found array of requirements:', parsed.length);
      return parsed;
    }
    
    if (parsed.requirements && Array.isArray(parsed.requirements)) {
      console.log('Found requirements array in object:', parsed.requirements.length);
      return parsed.requirements;
    }
    
    if (parsed.features && Array.isArray(parsed.features)) {
      console.log('Found features array:', parsed.features.length);
      return parsed.features;
    }
    
    // If it's a single requirement object
    if (parsed.id || parsed.text || parsed.title) {
      console.log('Found single requirement object');
      return [parsed];
    }
    
    // If there are numbered items (1. Feature:, 2. Feature:, etc.)
    if (typeof parsed === 'object') {
      const entries = Object.entries(parsed);
      const requirements = [];
      
      for (const [key, value] of entries) {
        if (typeof value === 'object' && value !== null && 
            ((value as any).text || (value as any).title || (value as any).id)) {
          requirements.push(value);
        }
      }
      
      if (requirements.length > 0) {
        console.log('Found requirements from object entries:', requirements.length);
        return requirements;
      }
    }
    
    console.log('Could not extract requirements from JSON structure');
    return [];
    
  } catch (error) {
    console.log('JSON parse failed, trying to extract from text...');
    
    // If JSON parsing fails, try to extract structured data from text
    const requirements: any[] = [];
    
    // NEW: Try to extract numbered features in text format (handle both single-line and multi-line)
    // First try simple feature splitting by number pattern
    const simpleFeatureSplit = jsonContent.split(/(?=\d+\.\s*Feature:)/).filter(f => f.trim());
    
    if (simpleFeatureSplit.length > 1) {
      console.log('Found', simpleFeatureSplit.length, 'features using simple split');
      
      simpleFeatureSplit.forEach((featureText, index) => {
        const featureMatch = featureText.match(/(\d+)\.\s*Feature:\s*(.+)/);
        if (featureMatch) {
          const featureNum = featureMatch[1];
          const fullText = featureMatch[2];
          
          // Extract properties using more flexible regex
          const getName = (text: string) => {
            const nameMatch = text.match(/^([^-]+)/);
            return nameMatch ? nameMatch[1].trim() : `Feature ${featureNum}`;
          };
          
          const getProperty = (text: string, property: string) => {
            const regex = new RegExp(`-\\s*${property}:\\s*([^-]+?)(?=\\s*-\\s*\\w+:|$)`, 'i');
            const match = text.match(regex);
            return match ? match[1].trim() : null;
          };
          
          const featureName = getName(fullText);
          const description = getProperty(fullText, 'Description') || featureName;
          const category = getProperty(fullText, 'Category') || 'functional';
          const priority = getProperty(fullText, 'Priority') || 'medium';
          const rationale = getProperty(fullText, 'Rationale') || 'Generated from business brief';
          const acceptanceCriteriaText = getProperty(fullText, 'Acceptance Criteria');
          const workflowLevel = getProperty(fullText, 'Workflow Level') || 'feature';
          const businessValue = getProperty(fullText, 'Business Value') || 'Provides business value';
          
          // Parse acceptance criteria
          let parsedCriteria = ['To be defined'];
          if (acceptanceCriteriaText) {
            try {
              parsedCriteria = JSON.parse(acceptanceCriteriaText);
            } catch (e) {
              // If JSON parsing fails, split by commas and clean up
              parsedCriteria = acceptanceCriteriaText
                .replace(/[\[\]"]/g, '')
                .split(',')
                .map(c => c.trim())
                .filter(c => c);
            }
          }
          
          requirements.push({
            id: `FEA-${featureNum.padStart(3, '0')}`,
            text: description,
            title: featureName,
            description: description,
            category: category.toLowerCase(),
            priority: priority.toLowerCase(),
            rationale: rationale,
            acceptanceCriteria: parsedCriteria,
            workflowLevel: workflowLevel.toLowerCase(),
            businessValue: businessValue
          });
        }
      });
      
      if (requirements.length > 0) {
        console.log('Successfully extracted features using simple split:', requirements.length);
        return requirements;
      }
    }
    
    // Fallback: More complex regex for edge cases
    const textFeatureRegex = /(\d+)\.\s*Feature:\s*([^-]+)(?:\s*-\s*Description:\s*([^-]+?))?(?:\s*-\s*Category:\s*([^-]+?))?(?:\s*-\s*Priority:\s*([^-]+?))?(?:\s*-\s*Rationale:\s*([^-]+?))?(?:\s*-\s*Acceptance Criteria:\s*(\[[^\]]*\]))?(?:\s*-\s*Workflow Level:\s*([^-]+?))?(?:\s*-\s*Business Value:\s*([^-]*?))?(?=\s*\d+\.\s*Feature:|\s*$)/gi;
    let textMatch;
    
    while ((textMatch = textFeatureRegex.exec(jsonContent)) !== null) {
      const featureNum = textMatch[1];
      const featureName = textMatch[2]?.trim();
      const description = textMatch[3]?.trim();
      const category = textMatch[4]?.trim() || 'functional';
      const priority = textMatch[5]?.trim() || 'medium';
      const rationale = textMatch[6]?.trim() || 'Generated from business brief';
      const acceptanceCriteria = textMatch[7]?.trim();
      const workflowLevel = textMatch[8]?.trim() || 'feature';
      const businessValue = textMatch[9]?.trim() || 'Provides business value';
      
      // Parse acceptance criteria if available
      let parsedCriteria = ['To be defined'];
      if (acceptanceCriteria) {
        try {
          parsedCriteria = JSON.parse(acceptanceCriteria);
        } catch (e) {
          // If JSON parsing fails, split by commas
          parsedCriteria = acceptanceCriteria.replace(/[\[\]"]/g, '').split(',').map(c => c.trim()).filter(c => c);
        }
      }
      
      requirements.push({
        id: `FEA-${featureNum.padStart(3, '0')}`,
        text: description || featureName,
        title: featureName,
        description: description,
        category: category.toLowerCase(),
        priority: priority.toLowerCase(),
        rationale: rationale,
        acceptanceCriteria: parsedCriteria,
        workflowLevel: workflowLevel.toLowerCase(),
        businessValue: businessValue
      });
    }
    
    if (requirements.length > 0) {
      console.log('Extracted numbered text features:', requirements.length);
      return requirements;
    }
    
    // Try to extract numbered feature blocks in JSON format (1. Feature: {content})
    const numberedFeatureRegex = /(\d+)\.\s*Feature:\s*\{([^}]+)\}/gi;
    let match;
    
    while ((match = numberedFeatureRegex.exec(jsonContent)) !== null) {
      try {
        const featureData = JSON.parse(`{${match[2]}}`);
        featureData.id = featureData.id || `FEA-${match[1].padStart(3, '0')}`;
        requirements.push(featureData);
      } catch (e) {
        console.log('Failed to parse numbered feature block:', match[2]);
      }
    }
    
    if (requirements.length > 0) {
      console.log('Extracted numbered JSON features:', requirements.length);
      return requirements;
    }
    
    // Try to extract general feature blocks with regex
    const featureRegex = /(?:Feature|Requirement)\s*(?:\d+)?[:\-]?\s*\{([^}]+)\}/gi;
    
    while ((match = featureRegex.exec(jsonContent)) !== null) {
      try {
        const featureData = JSON.parse(`{${match[1]}}`);
        requirements.push(featureData);
      } catch (e) {
        console.log('Failed to parse feature block:', match[1]);
      }
    }
    
    if (requirements.length > 0) {
      console.log('Extracted features from text:', requirements.length);
      return requirements;
    }
    
    // Try to extract features based on the specific format from your images
    // Pattern: "id": "FEA-001", "text": "description", etc.
    const structuredFeatureRegex = /"id":\s*"([^"]+)"[^}]*"text":\s*"([^"]+)"[^}]*(?:"category":\s*"([^"]+)")?[^}]*(?:"priority":\s*"([^"]+)")?/gi;
    
    while ((match = structuredFeatureRegex.exec(jsonContent)) !== null) {
      requirements.push({
        id: match[1],
        text: match[2],
        category: match[3] || 'functional',
        priority: match[4] || 'medium',
        rationale: 'Extracted from JSON response',
        acceptanceCriteria: ['To be defined']
      });
    }
    
    if (requirements.length > 0) {
      console.log('Extracted structured features:', requirements.length);
      return requirements;
    }
    
    // Try to extract simple feature patterns
    const simpleFeatureRegex = /"([^"]+)"\s*[:\-]\s*"([^"]+)"/g;
    const simpleFeatures = [];
    
    while ((match = simpleFeatureRegex.exec(jsonContent)) !== null) {
      simpleFeatures.push({
        id: `FEAT-${simpleFeatures.length + 1}`,
        text: match[2],
        title: match[1],
        category: 'functional',
        priority: 'medium'
      });
    }
    
    if (simpleFeatures.length > 0) {
      console.log('Extracted simple features:', simpleFeatures.length);
      return simpleFeatures;
    }
    
    console.log('Could not extract any requirements from content');
    return [];
  }
};

// Convert parsed requirement data to standard format
const normalizeRequirement = (rawReq: any, index: number): any => {
  return {
    id: rawReq.id || rawReq.identifier || `FEAT-${String(index + 1).padStart(3, '0')}`,
    text: rawReq.text || rawReq.description || rawReq.requirement || rawReq.title || 'Requirement text not found',
    category: rawReq.category || 'functional',
    priority: (rawReq.priority || 'medium').toLowerCase(),
    rationale: rawReq.rationale || rawReq.businessValue || 'Generated from business brief',
    acceptanceCriteria: rawReq.acceptanceCriteria || rawReq.acceptance_criteria || ['To be defined'],
    workflowLevel: rawReq.workflowLevel || 'feature',
    businessValue: rawReq.businessValue || rawReq.business_value || 'Provides business value',
    clearPrinciples: rawReq.clearPrinciples || {
      clear: true,
      concise: true,
      correct: true,
      complete: true,
      feasible: true,
      testable: true,
      unambiguous: true,
      atomic: true,
    }
  };
};

export const useRequirementStore = create<RequirementStore>()(
  persist(
    (set, get) => ({
      requirements: mockRequirements,
      selectedRequirement: null,

  addRequirement: (requirement) => {
    const newRequirement: Requirement = {
      ...requirement,
      id: `req-${Date.now().toString(36)}`,
    };
    set((state) => ({
      requirements: [...state.requirements, newRequirement],
    }));
  },

  addGeneratedRequirements: (useCaseId, generatedRequirements) => {
    console.log('Adding generated requirements:', { useCaseId, count: generatedRequirements.length });
    
    const newRequirements: Requirement[] = generatedRequirements.map((genReq, index) => {
      const newReq: Requirement = {
        id: genReq.id || `req-gen-${Date.now().toString(36)}-${index}`,
        useCaseId,
        originalText: genReq.text,
        enhancedText: genReq.text, // Start with the same text since LLM already refined it
        isUnambiguous: genReq.clearPrinciples?.unambiguous || true,
        isTestable: genReq.clearPrinciples?.testable || true,
        hasAcceptanceCriteria: (genReq.acceptanceCriteria?.length || 0) > 0,
        status: 'enhanced' as const, // Generated requirements start as enhanced
        reviewedBy: 'AI System',
        reviewedAt: new Date(),
        workflowStage: 'enhancement' as const,
        completionPercentage: 80, // 80% since they're AI-generated but may need human review
      };
      console.log('Created requirement:', newReq.id, newReq.originalText.substring(0, 50) + '...');
      return newReq;
    });

    set((state) => {
      const updatedRequirements = [...state.requirements, ...newRequirements];
      console.log('Updated requirements count:', updatedRequirements.length);
      return {
        requirements: updatedRequirements,
      };
    });
  },

  addGeneratedRequirementsFromJSON: (useCaseId, jsonContent) => {
    console.log('Adding requirements from JSON blob for use case:', useCaseId);
    
    // Parse the JSON content to extract individual requirements
    const parsedRequirements = parseRequirementsFromJSON(jsonContent);
    
    if (parsedRequirements.length === 0) {
      console.log('No requirements found in JSON, creating fallback requirement');
      // Create a single requirement with the raw content
      const fallbackReq: Requirement = {
        id: `req-fallback-${Date.now().toString(36)}`,
        useCaseId,
        originalText: jsonContent,
        enhancedText: jsonContent,
        isUnambiguous: false,
        isTestable: false,
        hasAcceptanceCriteria: false,
        status: 'draft' as const,
        reviewedBy: 'AI System',
        reviewedAt: new Date(),
        workflowStage: 'analysis' as const,
        completionPercentage: 30,
      };
      
      set((state) => ({
        requirements: [...state.requirements, fallbackReq],
      }));
      return { success: false, requirementsCount: 1 };
    }
    
    // Convert parsed requirements to the standard format
    const newRequirements: Requirement[] = parsedRequirements.map((parsedReq, index) => {
      const normalizedReq = normalizeRequirement(parsedReq, index);
      
      const newReq: Requirement = {
        id: `req-gen-${Date.now().toString(36)}-${index}`,
        useCaseId,
        originalText: normalizedReq.text,
        enhancedText: normalizedReq.text,
        isUnambiguous: normalizedReq.clearPrinciples?.unambiguous || true,
        isTestable: normalizedReq.clearPrinciples?.testable || true,
        hasAcceptanceCriteria: Array.isArray(normalizedReq.acceptanceCriteria) && normalizedReq.acceptanceCriteria.length > 0,
        status: 'enhanced' as const,
        reviewedBy: 'AI System',
        reviewedAt: new Date(),
        workflowStage: 'enhancement' as const,
        completionPercentage: 80,
      };
      
      console.log(`Created requirement ${index + 1}/${parsedRequirements.length}:`, newReq.id, newReq.originalText.substring(0, 50) + '...');
      return newReq;
    });

    set((state) => {
      const updatedRequirements = [...state.requirements, ...newRequirements];
      console.log(`Successfully added ${newRequirements.length} requirements. Total: ${updatedRequirements.length}`);
      return {
        requirements: updatedRequirements,
      };
    });
    
    return { success: true, requirementsCount: newRequirements.length };
  },

  updateRequirement: (id, updates) => {
    set((state) => ({
      requirements: state.requirements.map((requirement) =>
        requirement.id === id ? { ...requirement, ...updates } : requirement
      ),
    }));
  },

  deleteRequirement: (id) => {
    set((state) => ({
      requirements: state.requirements.filter((requirement) => requirement.id !== id),
      selectedRequirement: state.selectedRequirement?.id === id ? null : state.selectedRequirement,
    }));
  },

  selectRequirement: (id) => {
    const requirement = get().requirements.find((req) => req.id === id);
    set({ selectedRequirement: requirement || null });
  },

  clearSelection: () => {
    set({ selectedRequirement: null });
  },

  getRequirementById: (id) => {
    return get().requirements.find((requirement) => requirement.id === id);
  },

  getRequirementsByUseCaseId: (useCaseId) => {
    return get().requirements.filter((requirement) => requirement.useCaseId === useCaseId);
  },

  getRequirementsByStatus: (status) => {
    return get().requirements.filter((requirement) => requirement.status === status);
  },

  getGeneratedRequirementsByUseCaseId: (useCaseId) => {
    return get().requirements.filter((requirement) => 
      requirement.useCaseId === useCaseId && requirement.reviewedBy === 'AI System'
    );
  },
    }),
    {
      name: 'aura-requirements',
      // Persist all requirements data in localStorage
      partialize: (state) => ({ 
        requirements: state.requirements 
      }),
    }
  )
); 