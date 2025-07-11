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
  console.log('🔍 Starting JSON parsing for content:', jsonContent.substring(0, 300) + '...');
  
  // Clean the JSON content first - remove any markdown formatting
  let cleanedContent = jsonContent.trim();
  
  // Remove markdown code blocks if present
  cleanedContent = cleanedContent.replace(/^```(?:json)?/gm, '').replace(/```$/gm, '');
  
  // Remove any leading/trailing whitespace after cleaning
  cleanedContent = cleanedContent.trim();
  
  console.log('🧹 Cleaned content:', cleanedContent.substring(0, 300) + '...');
  
  // SPECIAL CASE: Handle the specific format where features are embedded in text field
  // Example: "Features:\n\n1. {\n   \"id\": \"FEA-001\",\n   \"text\": \"ML model for demand forecasting\",\n   ..."
  if (cleanedContent.includes('Features:') && cleanedContent.includes('"id": "FEA-')) {
    console.log('🎯 Detected features embedded in text format, extracting...');
    
    const features = [];
    
    // More robust approach: Split by numbered sections first
    const sections = cleanedContent.split(/(?=\n\s*\d+\.\s*\{)/);
    
    for (const section of sections) {
      const sectionMatch = section.match(/(\d+)\.\s*\{([\s\S]*?)\}\s*(?=\n\s*\d+\.\s*\{|$)/);
      if (sectionMatch) {
        let featureJson = '';
        try {
          featureJson = '{' + sectionMatch[2].trim() + '}';
          
          // Clean up any formatting issues
          featureJson = featureJson
            .replace(/\n\s*/g, ' ')  // Remove line breaks and extra spaces
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/"\s*:\s*"/g, '":"')  // Clean up spacing around colons
            .replace(/",\s*"/g, '","');  // Clean up spacing around commas
          
          const featureObj = JSON.parse(featureJson);
          features.push(featureObj);
          console.log(`✅ Extracted feature ${sectionMatch[1]}:`, featureObj.id, featureObj.text);
        } catch (e) {
          console.log(`❌ Failed to parse feature ${sectionMatch[1]}:`, e);
          console.log('Attempted JSON:', featureJson);
        }
      }
    }
    
    // Fallback: try the original regex approach if section splitting didn't work
    if (features.length === 0) {
      const featureRegex = /(\d+)\.\s*\{\s*([^}]+(?:\{[^}]*\}[^}]*)*)\s*\}/g;
      let match;
      
      while ((match = featureRegex.exec(cleanedContent)) !== null) {
        try {
          // Clean up the extracted content and try to parse as JSON
          let featureJson = match[2].trim();
          
          // Ensure proper JSON formatting
          if (!featureJson.startsWith('{')) {
            featureJson = '{' + featureJson;
          }
          if (!featureJson.endsWith('}')) {
            featureJson = featureJson + '}';
          }
          
          // Parse the feature object
          const featureObj = JSON.parse(featureJson);
          features.push(featureObj);
          console.log(`✅ Extracted feature ${match[1]}:`, featureObj.id, featureObj.text);
        } catch (e) {
          console.log(`❌ Failed to parse feature ${match[1]}:`, e);
        }
      }
    }
    
    if (features.length > 0) {
      console.log(`🎉 Successfully extracted ${features.length} features from embedded format`);
      return features;
    }
  }
  
  try {
    // First, try to parse as standard JSON
    const parsed = JSON.parse(cleanedContent);
    console.log('✅ Successfully parsed JSON. Structure:', Object.keys(parsed));
    
    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      console.log('📋 Found direct array of requirements:', parsed.length);
      return parsed;
    }
    
    if (parsed.requirements && Array.isArray(parsed.requirements)) {
      console.log('📋 Found requirements array in object:', parsed.requirements.length);
      console.log('📋 First requirement:', parsed.requirements[0]);
      return parsed.requirements;
    }
    
    if (parsed.features && Array.isArray(parsed.features)) {
      console.log('📋 Found features array:', parsed.features.length);
      return parsed.features;
    }
    
    // If it's a single requirement object with proper structure
    if ((parsed.id || parsed.text || parsed.title) && typeof parsed === 'object') {
      console.log('📋 Found single requirement object');
      return [parsed];
    }
    
    // Check for other potential array fields
    for (const key of Object.keys(parsed)) {
      if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
        const firstItem = parsed[key][0];
        if (typeof firstItem === 'object' && (firstItem.id || firstItem.text || firstItem.title)) {
          console.log(`📋 Found requirements in "${key}" array:`, parsed[key].length);
          return parsed[key];
        }
      }
    }
    
    // If there are numbered items as properties (1. Feature:, 2. Feature:, etc.)
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
        console.log('📋 Found requirements from object entries:', requirements.length);
        return requirements;
      }
    }
    
    console.log('❌ Could not extract requirements from JSON structure. Available keys:', Object.keys(parsed));
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
    console.log('🚀 Adding requirements from JSON blob for use case:', useCaseId);
    console.log('📄 JSON content preview:', jsonContent.substring(0, 500) + '...');
    
    // Parse the JSON content to extract individual requirements
    const parsedRequirements = parseRequirementsFromJSON(jsonContent);
    
    console.log('🔍 Parsed requirements count:', parsedRequirements.length);
    console.log('🔍 First parsed requirement:', parsedRequirements[0]);
    
    if (parsedRequirements.length === 0) {
      console.log('❌ No requirements found in JSON, creating fallback requirement');
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
    
    // FIXED: Properly validate that each parsed requirement is a complete object
    const validRequirements = parsedRequirements.filter(req => {
      // Ensure it's a proper object with the expected structure
      const isValidObject = typeof req === 'object' && req !== null;
      const hasRequiredFields = req.id || req.text || req.title || req.description;
      
      console.log('🔍 Validating requirement:', { req, isValidObject, hasRequiredFields });
      
      return isValidObject && hasRequiredFields;
    });
    
    console.log('✅ Valid requirements after filtering:', validRequirements.length);
    
    if (validRequirements.length === 0) {
      console.log('❌ No valid requirements found after filtering');
      return { success: false, requirementsCount: 0 };
    }
    
        // Convert parsed requirements to the standard format - ONE requirement per feature object
    const newRequirements: Requirement[] = validRequirements.map((featureObj, index) => {
      console.log(`🏗️ Processing feature ${index + 1}:`, featureObj);
      
      // Use the actual feature ID from the JSON if available
      const featureId = featureObj.id || `FEAT-${String(index + 1).padStart(3, '0')}`;
      
      // Get the feature name (what should be displayed as the title)
      const featureName = featureObj.text || featureObj.title || featureObj.name || `Feature ${featureId}`;
      
      // Get the feature description/rationale (what should be displayed as content)
      const featureRationale = featureObj.rationale || featureObj.description || 'No description provided';
      
      // Get business value
      const businessValue = featureObj.businessValue || 'No business value specified';
      
      // Format category and priority for display
      const category = (featureObj.category || 'functional').toLowerCase();
      const priority = (featureObj.priority || 'medium').toLowerCase();
      
      // Build the enhanced text with all the feature details
      let enhancedText = `${featureRationale}`;
      
      if (businessValue && businessValue !== 'No business value specified') {
        enhancedText += `\n\n🎯 Business Value: ${businessValue}`;
      }
      
      if (featureObj.acceptanceCriteria && Array.isArray(featureObj.acceptanceCriteria) && featureObj.acceptanceCriteria.length > 0) {
        enhancedText += '\n\n✅ Acceptance Criteria:';
        featureObj.acceptanceCriteria.forEach((criteria: string, i: number) => {
          enhancedText += `\n${i + 1}. ${criteria}`;
        });
      }
      
      const newReq: Requirement = {
        id: `req-gen-${Date.now().toString(36)}-${index}`,
        useCaseId,
        originalText: `${featureId}: ${featureName}`,
        enhancedText: enhancedText,
        isUnambiguous: true,
        isTestable: true,
        hasAcceptanceCriteria: Array.isArray(featureObj.acceptanceCriteria) && featureObj.acceptanceCriteria.length > 0,
        status: 'enhanced' as const,
        reviewedBy: `AI Generated - ${category.toUpperCase()} | ${priority.toUpperCase()} Priority`,
        reviewedAt: new Date(),
        workflowStage: 'enhancement' as const,
        completionPercentage: 90, // High completion since AI already created detailed features
      };
      
      console.log(`✅ Created complete requirement for ${featureId}:`, {
        id: newReq.id,
        name: featureName,
        category: category,
        priority: priority,
        rationale: featureRationale.substring(0, 100) + '...',
        businessValue: businessValue.substring(0, 50) + '...'
      });
      
      return newReq;
    });

    set((state) => {
      const updatedRequirements = [...state.requirements, ...newRequirements];
      console.log(`🎉 Successfully added ${newRequirements.length} complete feature requirements. Total: ${updatedRequirements.length}`);
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