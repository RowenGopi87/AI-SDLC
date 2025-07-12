import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CURRENT_WORKFLOW, getAIPromptContext } from '../workflow-config';

export interface LLMSettings {
  provider: string;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export interface BusinessBriefData {
  title: string;
  businessObjective: string;
  quantifiableBusinessOutcomes: string;
  inScope?: string;
  impactOfDoNothing?: string;
  happyPath?: string;
  exceptions?: string;
  acceptanceCriteria?: string[];
  impactedEndUsers?: string;
  changeImpactExpected?: string;
  impactToOtherDepartments?: string;
  businessOwner?: string;
  leadBusinessUnit?: string;
  primaryStrategicTheme?: string;
}

export interface GeneratedRequirement {
  id: string;
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  acceptanceCriteria: string[];
  clearPrinciples: {
    clear: boolean;
    concise: boolean;
    correct: boolean;
    complete: boolean;
    feasible: boolean;
    testable: boolean;
    unambiguous: boolean;
    atomic: boolean;
  };
}

export interface RequirementsGenerationResult {
  requirements: GeneratedRequirement[];
  iterationCount: number;
  totalTokensUsed: number;
  processingTime: number;
  provokingQuestions: string[];
  selfReviewNotes: string[];
}

export interface GeneratedInitiative {
  id: string;
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  acceptanceCriteria: string[];
  businessValue: string;
  workflowLevel: string;
}

export interface InitiativesGenerationResult {
  initiatives: GeneratedInitiative[];
  iterationCount: number;
  totalTokensUsed: number;
  processingTime: number;
  provokingQuestions: string[];
  selfReviewNotes: string[];
}

export interface GeneratedFeature {
  id: string;
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  acceptanceCriteria: string[];
  businessValue: string;
  workflowLevel: string;
}

export interface FeaturesGenerationResult {
  features: GeneratedFeature[];
  iterationCount: number;
  totalTokensUsed: number;
  processingTime: number;
  provokingQuestions: string[];
  selfReviewNotes: string[];
}

export interface InitiativeData {
  title: string;
  description: string;
  category: string;
  priority: string;
  rationale: string;
  acceptanceCriteria: string[];
  businessValue: string;
  workflowLevel: string;
}

export interface GeneratedEpic {
  id: string;
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  acceptanceCriteria: string[];
  businessValue: string;
  workflowLevel: string;
  estimatedEffort: string;
  sprintEstimate: number;
}

export interface EpicsGenerationResult {
  epics: GeneratedEpic[];
  iterationCount: number;
  totalTokensUsed: number;
  processingTime: number;
  provokingQuestions: string[];
  selfReviewNotes: string[];
}

export interface FeatureData {
  title: string;
  description: string;
  category: string;
  priority: string;
  rationale: string;
  acceptanceCriteria: string[];
  businessValue: string;
  workflowLevel: string;
}

export class LLMService {
  private openai?: OpenAI;
  private googleAI?: GoogleGenerativeAI;
  private settings: LLMSettings;

  constructor(settings: LLMSettings) {
    this.settings = settings;
    this.initializeProvider();
  }

  private initializeProvider() {
    switch (this.settings.provider) {
      case 'openai':
        this.openai = new OpenAI({
          apiKey: this.settings.apiKey,
        });
        break;
      case 'google':
        this.googleAI = new GoogleGenerativeAI(this.settings.apiKey);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${this.settings.provider}`);
    }
  }

  async generateRequirements(businessBrief: BusinessBriefData): Promise<RequirementsGenerationResult> {
    const startTime = Date.now();
    let totalTokensUsed = 0;
    let iterationCount = 0;
    const provokingQuestions: string[] = [];
    const selfReviewNotes: string[] = [];

    try {
      // Step 1: Generate provoking questions about the business brief
      iterationCount++;
      const questionsResult = await this.generateProvokingQuestions(businessBrief);
      provokingQuestions.push(...questionsResult.questions);
      totalTokensUsed += questionsResult.tokensUsed;

      // Step 2: Self-review and answer the provoking questions
      iterationCount++;
      const analysisResult = await this.performSelfAnalysis(businessBrief, questionsResult.questions);
      selfReviewNotes.push(...analysisResult.insights);
      totalTokensUsed += analysisResult.tokensUsed;

      // Step 3: Generate initial requirements based on analysis
      iterationCount++;
      const initialRequirements = await this.generateInitialRequirements(businessBrief, analysisResult.analysis);
      totalTokensUsed += initialRequirements.tokensUsed;

      // Step 4: Validate and refine requirements using CLEAR principles
      iterationCount++;
      const refinedRequirements = await this.validateAndRefineRequirements(initialRequirements.requirements);
      totalTokensUsed += refinedRequirements.tokensUsed;

      const processingTime = Date.now() - startTime;

      return {
        requirements: refinedRequirements.requirements,
        iterationCount,
        totalTokensUsed,
        processingTime,
        provokingQuestions,
        selfReviewNotes,
      };
    } catch (error) {
      console.error('Error in requirements generation:', error);
      throw new Error(`Failed to generate requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateInitiatives(businessBrief: BusinessBriefData): Promise<InitiativesGenerationResult> {
    const startTime = Date.now();
    let totalTokensUsed = 0;
    let iterationCount = 0;
    const provokingQuestions: string[] = [];
    const selfReviewNotes: string[] = [];

    try {
      // Step 1: Generate provoking questions about the business brief
      iterationCount++;
      const questionsResult = await this.generateProvokingQuestions(businessBrief);
      provokingQuestions.push(...questionsResult.questions);
      totalTokensUsed += questionsResult.tokensUsed;

      // Step 2: Self-review and answer the provoking questions
      iterationCount++;
      const analysisResult = await this.performSelfAnalysis(businessBrief, questionsResult.questions);
      selfReviewNotes.push(...analysisResult.insights);
      totalTokensUsed += analysisResult.tokensUsed;

      // Step 3: Generate initial initiatives based on analysis
      iterationCount++;
      const initialInitiatives = await this.generateInitialInitiatives(businessBrief, analysisResult.analysis);
      totalTokensUsed += initialInitiatives.tokensUsed;

      // Step 4: Validate and refine initiatives
      iterationCount++;
      const refinedInitiatives = await this.validateAndRefineInitiatives(initialInitiatives.initiatives);
      totalTokensUsed += refinedInitiatives.tokensUsed;

      const processingTime = Date.now() - startTime;

      return {
        initiatives: refinedInitiatives.initiatives,
        iterationCount,
        totalTokensUsed,
        processingTime,
        provokingQuestions,
        selfReviewNotes,
      };
    } catch (error) {
      console.error('Error in initiatives generation:', error);
      throw new Error(`Failed to generate initiatives: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateFeatures(initiative: InitiativeData): Promise<FeaturesGenerationResult> {
    const startTime = Date.now();
    let totalTokensUsed = 0;
    let iterationCount = 0;
    const provokingQuestions: string[] = [];
    const selfReviewNotes: string[] = [];

    try {
      // Step 1: Generate provoking questions about the initiative
      iterationCount++;
      const questionsResult = await this.generateProvokingQuestionsForInitiative(initiative);
      provokingQuestions.push(...questionsResult.questions);
      totalTokensUsed += questionsResult.tokensUsed;

      // Step 2: Self-review and answer the provoking questions
      iterationCount++;
      const analysisResult = await this.performSelfAnalysisForInitiative(initiative, questionsResult.questions);
      selfReviewNotes.push(...analysisResult.insights);
      totalTokensUsed += analysisResult.tokensUsed;

      // Step 3: Generate initial features based on analysis
      iterationCount++;
      const initialFeatures = await this.generateInitialFeatures(initiative, analysisResult.analysis);
      totalTokensUsed += initialFeatures.tokensUsed;

      // Step 4: Validate and refine features
      iterationCount++;
      const refinedFeatures = await this.validateAndRefineFeatures(initialFeatures.features);
      totalTokensUsed += refinedFeatures.tokensUsed;

      const processingTime = Date.now() - startTime;

      return {
        features: refinedFeatures.features,
        iterationCount,
        totalTokensUsed,
        processingTime,
        provokingQuestions,
        selfReviewNotes,
      };
    } catch (error) {
      console.error('Error in features generation:', error);
      throw new Error(`Failed to generate features: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEpics(feature: FeatureData): Promise<EpicsGenerationResult> {
    const startTime = Date.now();
    let totalTokensUsed = 0;
    let iterationCount = 0;
    const provokingQuestions: string[] = [];
    const selfReviewNotes: string[] = [];

    try {
      // Step 1: Generate provoking questions about the feature
      iterationCount++;
      const questionsResult = await this.generateProvokingQuestionsForFeature(feature);
      provokingQuestions.push(...questionsResult.questions);
      totalTokensUsed += questionsResult.tokensUsed;

      // Step 2: Self-review and answer the provoking questions
      iterationCount++;
      const analysisResult = await this.performSelfAnalysisForFeature(feature, questionsResult.questions);
      selfReviewNotes.push(...analysisResult.insights);
      totalTokensUsed += analysisResult.tokensUsed;

      // Step 3: Generate initial epics based on analysis
      iterationCount++;
      const initialEpics = await this.generateInitialEpics(feature, analysisResult.analysis);
      totalTokensUsed += initialEpics.tokensUsed;

      // Step 4: Validate and refine epics
      iterationCount++;
      const refinedEpics = await this.validateAndRefineEpics(initialEpics.epics);
      totalTokensUsed += refinedEpics.tokensUsed;

      const processingTime = Date.now() - startTime;

      return {
        epics: refinedEpics.epics,
        iterationCount,
        totalTokensUsed,
        processingTime,
        provokingQuestions,
        selfReviewNotes,
      };
    } catch (error) {
      console.error('Error in epics generation:', error);
      throw new Error(`Failed to generate epics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateProvokingQuestions(businessBrief: BusinessBriefData) {
    const workflowContext = getAIPromptContext();
    const systemPrompt = `You are a senior business analyst and requirements expert. Your role is to ask provoking, insightful questions about a business initiative to ensure we fully understand the decomposition before generating work items.

${workflowContext}

Analyze the business initiative and generate 8-12 thought-provoking questions that will help uncover:
1. Hidden assumptions and edge cases
2. Stakeholder impacts not explicitly mentioned  
3. Technical and operational constraints
4. Success criteria and measurability
5. Risk mitigation strategies
6. Integration points with existing systems
7. User experience considerations
8. Compliance and regulatory requirements

Focus on questions that would challenge the initiative and ensure comprehensive decomposition into ${CURRENT_WORKFLOW.levels.map(l => l.pluralName).join(', ')}.`;

    const userPrompt = `Business Brief:
Title: ${businessBrief.title}
Business Objective: ${businessBrief.businessObjective}
Quantifiable Business Outcomes: ${businessBrief.quantifiableBusinessOutcomes}
${businessBrief.inScope ? `In Scope: ${businessBrief.inScope}` : ''}
${businessBrief.impactOfDoNothing ? `Impact of Do Nothing: ${businessBrief.impactOfDoNothing}` : ''}
${businessBrief.happyPath ? `Happy Path: ${businessBrief.happyPath}` : ''}
${businessBrief.exceptions ? `Exceptions: ${businessBrief.exceptions}` : ''}
${businessBrief.impactedEndUsers ? `Impacted End Users: ${businessBrief.impactedEndUsers}` : ''}
${businessBrief.changeImpactExpected ? `Change Impact: ${businessBrief.changeImpactExpected}` : ''}

Generate provoking questions as a JSON array: ["question 1", "question 2", ...]`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const questions = JSON.parse(result.content);
      return {
        questions: Array.isArray(questions) ? questions : [],
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: extract questions from text response
      const lines = result.content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
      const questions = lines.map(line => line.replace(/^[-\d.]\s*/, '').trim()).filter(q => q.length > 0);
      return {
        questions: questions.slice(0, 12),
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async performSelfAnalysis(businessBrief: BusinessBriefData, questions: string[]) {
    const systemPrompt = `You are a thoughtful business analyst performing a deep analysis of a business brief. Answer the provoking questions with detailed insights, considering various perspectives and potential implications.

For each question, provide:
- A thorough analysis based on the business brief
- Potential risks or considerations
- Recommendations for requirements coverage

Be analytical, objective, and comprehensive in your responses.`;

    const userPrompt = `Business Brief:
${JSON.stringify(businessBrief, null, 2)}

Provoking Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Provide a comprehensive analysis addressing each question. Format as JSON:
{
  "analysis": "comprehensive analysis text addressing all questions",
  "insights": ["insight 1", "insight 2", "..."],
  "keyConsiderations": ["consideration 1", "consideration 2", "..."]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const analysisData = JSON.parse(result.content);
      return {
        analysis: analysisData.analysis || result.content,
        insights: analysisData.insights || [],
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      return {
        analysis: result.content,
        insights: [result.content],
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async generateInitialRequirements(businessBrief: BusinessBriefData, analysis: string) {
    const workflowContext = getAIPromptContext();
    const mappings = CURRENT_WORKFLOW.mappings;
    const systemPrompt = `You are an expert business analyst and decomposition specialist. Based on the business initiative and comprehensive analysis, generate the appropriate work items according to the current workflow structure.

${workflowContext}

IMPORTANT: 
- Business briefs map to: ${mappings.businessBrief}
- Generate ${CURRENT_WORKFLOW.levels.find(l => l.id === mappings.requirements)?.pluralName || 'requirements'} for this initiative
- Each item must be decomposable into the next level in the hierarchy

Each work item must be:
- CLEAR: Easy to understand
- CONCISE: Brief but complete
- CORRECT: Accurate and valid
- COMPLETE: Fully specified
- FEASIBLE: Technically possible
- TESTABLE: At the story level
- UNAMBIGUOUS: Single interpretation
- ATOMIC: Single concern per item

Generate work items following the hierarchy:
${CURRENT_WORKFLOW.levels.map((level, index) => 
  `${index + 1}. ${level.name} (${level.description})`
).join('\n')}

Focus on generating ${CURRENT_WORKFLOW.levels.find(l => l.id === mappings.requirements)?.pluralName || 'features'} that can be broken down into subsequent levels.`;

    const targetLevel = CURRENT_WORKFLOW.levels.find(l => l.id === mappings.requirements);
    
    const userPrompt = `Business Initiative:
${JSON.stringify(businessBrief, null, 2)}

Analysis & Insights:
${analysis}

Generate ${targetLevel?.pluralName || 'features'} as JSON:
{
  "requirements": [
    {
      "id": "${targetLevel?.name.toUpperCase().substring(0, 3) || 'FEA'}-001",
      "text": "${targetLevel?.name || 'feature'} description",
      "category": "functional|business|user-experience|integration|performance|security",
      "priority": "high|medium|low",
      "rationale": "why this ${targetLevel?.name || 'feature'} is needed",
      "acceptanceCriteria": ["criteria 1", "criteria 2"],
      "workflowLevel": "${mappings.requirements}",
      "businessValue": "value this ${targetLevel?.name || 'feature'} provides"
    }
  ]
}

IMPORTANT: 
- Priority must be exactly one of: "high", "medium", "low" (lowercase only)
- Each ${targetLevel?.name || 'feature'} should be substantial enough to be broken down into ${CURRENT_WORKFLOW.levels.find(l => l.parentLevel === mappings.requirements)?.pluralName || 'epics'}
- Focus on high-level capabilities rather than detailed requirements`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const requirementsData = JSON.parse(result.content);
      
      // Handle different JSON response formats
      let requirements = [];
      
      if (Array.isArray(requirementsData)) {
        requirements = requirementsData;
      } else if (requirementsData.requirements && Array.isArray(requirementsData.requirements)) {
        requirements = requirementsData.requirements;
      } else if (requirementsData.features && Array.isArray(requirementsData.features)) {
        requirements = requirementsData.features;
      } else {
        console.log('Unexpected JSON structure, storing raw content for manual parsing');
        return {
          requirements: [{
            id: 'REQ-PARSE-NEEDED',
            text: result.content,
            category: 'needs-parsing',
            priority: 'high' as const,
            rationale: 'JSON response needs manual parsing',
            acceptanceCriteria: ['Parse individual requirements from JSON'],
            rawJsonContent: result.content // Store the raw JSON for later parsing
          }],
          tokensUsed: result.tokensUsed,
        };
      }
      
      return {
        requirements: requirements.map((req: any, index: number) => ({
          id: req.id || `REQ-${String(index + 1).padStart(3, '0')}`,
          text: req.text || req.description || req.requirement || 'Requirement text not found',
          category: req.category || 'functional',
          priority: (req.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low',
          rationale: req.rationale || req.businessValue || 'Generated from business brief',
          acceptanceCriteria: req.acceptanceCriteria || ['To be defined'],
          workflowLevel: req.workflowLevel || mappings.requirements,
          businessValue: req.businessValue
        })),
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.log('JSON parse failed, attempting text extraction...');
      
      // Try to extract features from the text even if JSON parsing failed
      const textContent = result.content;
      
      // Check if the response contains structured feature information
      if (textContent.includes('Features:') && textContent.includes('"id": "FEA-')) {
        console.log('Detected features in text format, storing for auto-parsing');
        return {
          requirements: [{
            id: 'REQ-FEATURES-IN-TEXT',
            text: textContent,
            category: 'functional',
            priority: 'high' as const,
            rationale: 'Features detected in text format, will be auto-parsed',
            acceptanceCriteria: ['Auto-parse individual features from response'],
            rawJsonContent: textContent
          }],
          tokensUsed: result.tokensUsed,
        };
      }
      
      // Last resort fallback
      return {
        requirements: [{
          id: 'REQ-PARSE-NEEDED',
          text: textContent,
          category: 'needs-parsing',
          priority: 'high' as const,
          rationale: 'Response format needs manual review',
          acceptanceCriteria: ['Review and parse requirements manually'],
          rawJsonContent: textContent
        }],
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async validateAndRefineRequirements(requirements: any[]) {
    const systemPrompt = `You are a requirements quality assurance expert. Evaluate each requirement against the CLEAR principles and refine them to meet high standards.

For each requirement, assess:
- Clear: Is it easy to understand?
- Concise: Is it brief but complete?
- Correct: Is it accurate and valid?
- Complete: Is it fully specified?
- Feasible: Is it technically possible?
- Testable: Can it be verified?
- Unambiguous: Does it have only one interpretation?
- Atomic: Does it address only one concern?

Refine requirements that don't meet these criteria.`;

    const userPrompt = `Requirements to validate and refine:
${JSON.stringify(requirements, null, 2)}

Return refined requirements with CLEAR principle assessments:
{
  "requirements": [
    {
      "id": "REQ-001",
      "text": "refined requirement text",
      "category": "category",
      "priority": "priority",
      "rationale": "rationale",
      "acceptanceCriteria": ["criteria"],
      "clearPrinciples": {
        "clear": true,
        "concise": true,
        "correct": true,
        "complete": true,
        "feasible": true,
        "testable": true,
        "unambiguous": true,
        "atomic": true
      }
    }
  ]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const refinedData = JSON.parse(result.content);
      const validatedRequirements = refinedData.requirements.map((req: any, index: number) => ({
        ...req,
        id: req.id || `REQ-${String(index + 1).padStart(3, '0')}`,
        clearPrinciples: req.clearPrinciples || {
          clear: true,
          concise: true,
          correct: true,
          complete: true,
          feasible: true,
          testable: true,
          unambiguous: true,
          atomic: true,
        },
      }));

      return {
        requirements: validatedRequirements,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: apply basic validation to original requirements
      const validatedRequirements = requirements.map((req, index) => ({
        id: req.id || `REQ-${String(index + 1).padStart(3, '0')}`,
        text: req.text || 'Requirement text',
        category: req.category || 'functional',
        priority: req.priority || 'medium',
        rationale: req.rationale || 'Derived from business brief',
        acceptanceCriteria: req.acceptanceCriteria || ['To be defined'],
        clearPrinciples: {
          clear: true,
          concise: true,
          correct: true,
          complete: true,
          feasible: true,
          testable: true,
          unambiguous: true,
          atomic: true,
        },
      }));

      return {
        requirements: validatedRequirements,
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async generateInitialInitiatives(businessBrief: BusinessBriefData, analysis: string) {
    const workflowContext = getAIPromptContext();
    const mappings = CURRENT_WORKFLOW.mappings;
    const systemPrompt = `You are an expert business analyst and strategic decomposition specialist. Based on the business brief and comprehensive analysis, generate business initiatives according to the current workflow structure.

${workflowContext}

IMPORTANT: 
- Business briefs map to: ${mappings.businessBrief}
- Generate ${CURRENT_WORKFLOW.levels.find(l => l.id === mappings.businessBrief)?.pluralName || 'initiatives'} for this business brief
- Each initiative must be substantial enough to be broken down into ${CURRENT_WORKFLOW.levels.find(l => l.parentLevel === mappings.businessBrief)?.pluralName || 'features'}

Each initiative must be:
- STRATEGIC: High-level business value driver
- ACTIONABLE: Can be decomposed into executable work
- MEASURABLE: Has clear success criteria
- SCOPED: Well-defined boundaries
- ALIGNED: Supports business objectives

Generate initiatives following the hierarchy:
${CURRENT_WORKFLOW.levels.map((level, index) => 
  `${index + 1}. ${level.name} (${level.description})`
).join('\n')}

Focus on generating ${CURRENT_WORKFLOW.levels.find(l => l.id === mappings.businessBrief)?.pluralName || 'initiatives'} that represent major strategic work streams.

RESPONSE FORMAT REQUIREMENTS:
- Return ONLY valid JSON without any explanatory text
- Do NOT use markdown formatting or code blocks
- Do NOT include phrases like "Here are the initiatives:" or "Based on the analysis:"
- Your entire response must be parseable as JSON`;

    const targetLevel = CURRENT_WORKFLOW.levels.find(l => l.id === mappings.businessBrief);
    
    const userPrompt = `Business Brief:
${JSON.stringify(businessBrief, null, 2)}

Analysis & Insights:
${analysis}

Generate ${targetLevel?.pluralName || 'initiatives'} as PURE JSON (no markdown, no code blocks, no explanatory text):
{
  "initiatives": [
    {
      "id": "INIT-001",
      "text": "initiative description",
      "category": "strategic|operational|technical|business",
      "priority": "high|medium|low",
      "rationale": "why this initiative is needed",
      "acceptanceCriteria": ["criteria 1", "criteria 2"],
      "workflowLevel": "${mappings.businessBrief}",
      "businessValue": "value this initiative provides"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Return ONLY the JSON object above, no markdown formatting, no \`\`\`json blocks
- Priority must be exactly one of: "high", "medium", "low" (lowercase only)
- Each initiative should be substantial enough to be broken down into multiple ${CURRENT_WORKFLOW.levels.find(l => l.parentLevel === mappings.businessBrief)?.pluralName || 'features'}
- Focus on strategic business outcomes rather than technical implementations
- Response must be valid JSON that can be parsed directly`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const initiativesData = JSON.parse(result.content);
      
      // Handle different JSON response formats
      let initiatives = [];
      
      if (Array.isArray(initiativesData)) {
        initiatives = initiativesData;
      } else if (initiativesData.initiatives && Array.isArray(initiativesData.initiatives)) {
        initiatives = initiativesData.initiatives;
      } else {
        console.log('Unexpected JSON structure, storing raw content for manual parsing');
        return {
          initiatives: [{
            id: 'INIT-PARSE-NEEDED',
            text: result.content,
            category: 'needs-parsing',
            priority: 'high' as const,
            rationale: 'JSON response needs manual parsing',
            acceptanceCriteria: ['Parse individual initiatives from JSON'],
            businessValue: 'Manual parsing required',
            workflowLevel: mappings.businessBrief,
            rawJsonContent: result.content
          }],
          tokensUsed: result.tokensUsed,
        };
      }
      
      return {
        initiatives: initiatives.map((init: any, index: number) => ({
          id: init.id || `INIT-${String(index + 1).padStart(3, '0')}`,
          text: init.text || init.description || init.title || 'Initiative text not found',
          category: init.category || 'strategic',
          priority: (init.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low',
          rationale: init.rationale || init.businessValue || 'Generated from business brief',
          acceptanceCriteria: init.acceptanceCriteria || ['To be defined'],
          businessValue: init.businessValue || 'Business value to be determined',
          workflowLevel: init.workflowLevel || mappings.businessBrief
        })),
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.log('JSON parse failed for initiatives, using fallback');
      return {
        initiatives: [{
          id: 'INIT-PARSE-NEEDED',
          text: result.content,
          category: 'needs-parsing',
          priority: 'high' as const,
          rationale: 'Response format needs manual review',
          acceptanceCriteria: ['Review and parse initiatives manually'],
          businessValue: 'Manual parsing required',
          workflowLevel: mappings.businessBrief,
          rawJsonContent: result.content
        }],
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async validateAndRefineInitiatives(initiatives: any[]) {
    const systemPrompt = `You are a strategic business analyst and initiative quality expert. Evaluate each initiative to ensure it meets strategic standards and can be effectively decomposed.

For each initiative, assess:
- Strategic: Does it drive significant business value?
- Actionable: Can it be broken down into executable work?
- Measurable: Are the success criteria clear?
- Scoped: Are the boundaries well-defined?
- Aligned: Does it support business objectives?

Refine initiatives that don't meet these criteria.`;

    const userPrompt = `Initiatives to validate and refine:
${JSON.stringify(initiatives, null, 2)}

Return refined initiatives:
{
  "initiatives": [
    {
      "id": "INIT-001",
      "text": "refined initiative text",
      "category": "category",
      "priority": "priority",
      "rationale": "rationale",
      "acceptanceCriteria": ["criteria"],
      "businessValue": "business value",
      "workflowLevel": "workflowLevel"
    }
  ]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const refinedData = JSON.parse(result.content);
      const validatedInitiatives = refinedData.initiatives.map((init: any, index: number) => ({
        ...init,
        id: init.id || `INIT-${String(index + 1).padStart(3, '0')}`,
      }));

      return {
        initiatives: validatedInitiatives,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: apply basic validation to original initiatives
      const validatedInitiatives = initiatives.map((init, index) => ({
        id: init.id || `INIT-${String(index + 1).padStart(3, '0')}`,
        text: init.text || 'Initiative text',
        category: init.category || 'strategic',
        priority: init.priority || 'medium',
        rationale: init.rationale || 'Derived from business brief',
        acceptanceCriteria: init.acceptanceCriteria || ['To be defined'],
        businessValue: init.businessValue || 'Business value to be determined',
        workflowLevel: init.workflowLevel || 'initiative',
      }));

      return {
        initiatives: validatedInitiatives,
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async callLLM(systemPrompt: string, userPrompt: string): Promise<{ content: string; tokensUsed: number }> {
    try {
      switch (this.settings.provider) {
        case 'openai':
          return await this.callOpenAI(systemPrompt, userPrompt);
        case 'google':
          return await this.callGoogleAI(systemPrompt, userPrompt);
        default:
          throw new Error(`Unsupported provider: ${this.settings.provider}`);
      }
    } catch (error) {
      console.error('LLM call failed:', error);
      throw error;
    }
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<{ content: string; tokensUsed: number }> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    // Calculate available tokens for completion (leave buffer for input)
    const maxModelTokens = this.settings.model === 'gpt-3.5-turbo' ? 4096 : 8192;
    const inputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4); // Rough estimate: 4 chars = 1 token
    const availableTokens = Math.max(1000, maxModelTokens - inputTokens - 200); // Leave 200 token buffer
    
    const response = await this.openai.chat.completions.create({
      model: this.settings.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: this.settings.temperature || 0.7,
      max_tokens: Math.min(availableTokens, this.settings.maxTokens || 4000),
    });

    return {
      content: response.choices[0]?.message?.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
    };
  }

  private async callGoogleAI(systemPrompt: string, userPrompt: string): Promise<{ content: string; tokensUsed: number }> {
    if (!this.googleAI) {
      throw new Error('Google AI client not initialized');
    }

    const model = this.googleAI.getGenerativeModel({ model: this.settings.model });
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      content: response.text(),
      tokensUsed: 0, // Google AI doesn't provide token count in the same way
    };
  }

  private async generateProvokingQuestionsForInitiative(initiative: InitiativeData) {
    const workflowContext = getAIPromptContext();
    const systemPrompt = `You are a senior product manager and feature analyst. Your role is to ask provoking, insightful questions about an initiative to ensure we fully understand how to decompose it into features.

${workflowContext}

Analyze the initiative and generate 6-8 thought-provoking questions that will help uncover:
1. User needs and personas affected
2. Technical architecture and integration points
3. User experience and workflow considerations
4. Performance and scalability requirements
5. Security and compliance considerations
6. Edge cases and error handling
7. Metrics and success criteria
8. Dependencies and risks

Focus on questions that would challenge the initiative and ensure comprehensive decomposition into features.`;

    const userPrompt = `Initiative:
Title: ${initiative.title}
Description: ${initiative.description}
Category: ${initiative.category}
Priority: ${initiative.priority}
Rationale: ${initiative.rationale}
Business Value: ${initiative.businessValue}
Acceptance Criteria: ${initiative.acceptanceCriteria.join(', ')}

Generate provoking questions as a JSON array: ["question 1", "question 2", ...]`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const questions = JSON.parse(result.content);
      return {
        questions: Array.isArray(questions) ? questions : [],
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: extract questions from text response
      const lines = result.content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
      const questions = lines.map(line => line.replace(/^[-\d.]\s*/, '').trim()).filter(q => q.length > 0);
      return {
        questions: questions.slice(0, 8),
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async performSelfAnalysisForInitiative(initiative: InitiativeData, questions: string[]) {
    const systemPrompt = `You are a thoughtful product manager performing a deep analysis of an initiative. Answer the provoking questions with detailed insights, considering technical, user experience, and business perspectives.

For each question, provide:
- A thorough analysis based on the initiative
- Potential technical and user experience considerations
- Recommendations for feature decomposition

Be analytical, objective, and comprehensive in your responses.`;

    const userPrompt = `Initiative:
${JSON.stringify(initiative, null, 2)}

Provoking Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Provide a comprehensive analysis addressing each question. Format as JSON:
{
  "analysis": "comprehensive analysis text addressing all questions",
  "insights": ["insight 1", "insight 2", "..."],
  "keyConsiderations": ["consideration 1", "consideration 2", "..."]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const analysisData = JSON.parse(result.content);
      return {
        analysis: analysisData.analysis || result.content,
        insights: analysisData.insights || [],
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      return {
        analysis: result.content,
        insights: [result.content],
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async generateInitialFeatures(initiative: InitiativeData, analysis: string) {
    const workflowContext = getAIPromptContext();
    const mappings = CURRENT_WORKFLOW.mappings;
    const systemPrompt = `You are an expert product manager and feature decomposition specialist. Based on the initiative and comprehensive analysis, generate features that can be implemented to achieve the initiative's objectives.

${workflowContext}

IMPORTANT: 
- Each feature should be a discrete piece of functionality
- Features should be substantial enough to be broken down into epics and stories
- Focus on user-facing capabilities and system functionality

Each feature must be:
- USER-FOCUSED: Addresses specific user needs
- IMPLEMENTABLE: Can be built by development teams
- TESTABLE: Has clear acceptance criteria
- MEASURABLE: Success can be tracked
- SCOPED: Well-defined boundaries

Generate features following the hierarchy:
${CURRENT_WORKFLOW.levels.map((level, index) => 
  `${index + 1}. ${level.name} (${level.description})`
).join('\n')}

RESPONSE FORMAT REQUIREMENTS:
- Return ONLY valid JSON without any explanatory text
- Do NOT use markdown formatting or code blocks
- Do NOT include phrases like "Here are the features:" or "Based on the analysis:"
- Your entire response must be parseable as JSON`;

    const userPrompt = `Initiative:
${JSON.stringify(initiative, null, 2)}

Analysis & Insights:
${analysis}

Generate features as PURE JSON (no markdown, no code blocks, no explanatory text):
{
  "features": [
    {
      "id": "FEA-001",
      "text": "feature description",
      "category": "functional|user-experience|integration|performance|security|business",
      "priority": "high|medium|low",
      "rationale": "why this feature is needed",
      "acceptanceCriteria": ["criteria 1", "criteria 2"],
      "workflowLevel": "feature",
      "businessValue": "value this feature provides"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Return ONLY the JSON object above, no markdown formatting, no \`\`\`json blocks
- Priority must be exactly one of: "high", "medium", "low" (lowercase only)
- Each feature should be substantial enough to be broken down into multiple epics
- Focus on user-facing capabilities and system functionality
- Response must be valid JSON that can be parsed directly`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const featuresData = JSON.parse(result.content);
      
      // Handle different JSON response formats
      let features = [];
      
      if (Array.isArray(featuresData)) {
        features = featuresData;
      } else if (featuresData.features && Array.isArray(featuresData.features)) {
        features = featuresData.features;
      } else {
        console.log('Unexpected JSON structure, storing raw content for manual parsing');
        return {
          features: [{
            id: 'FEA-PARSE-NEEDED',
            text: result.content,
            category: 'needs-parsing',
            priority: 'high' as const,
            rationale: 'JSON response needs manual parsing',
            acceptanceCriteria: ['Parse individual features from JSON'],
            businessValue: 'Manual parsing required',
            workflowLevel: 'feature',
            rawJsonContent: result.content
          }],
          tokensUsed: result.tokensUsed,
        };
      }
      
      return {
        features: features.map((feat: any, index: number) => ({
          id: feat.id || `FEA-${String(index + 1).padStart(3, '0')}`,
          text: feat.text || feat.description || feat.title || 'Feature text not found',
          category: feat.category || 'functional',
          priority: (feat.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low',
          rationale: feat.rationale || feat.businessValue || 'Generated from initiative analysis',
          acceptanceCriteria: feat.acceptanceCriteria || ['To be defined'],
          businessValue: feat.businessValue || 'Business value to be determined',
          workflowLevel: feat.workflowLevel || 'feature'
        })),
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.log('JSON parse failed for features, using fallback');
      return {
        features: [{
          id: 'FEA-PARSE-NEEDED',
          text: result.content,
          category: 'needs-parsing',
          priority: 'high' as const,
          rationale: 'Response format needs manual review',
          acceptanceCriteria: ['Review and parse features manually'],
          businessValue: 'Manual parsing required',
          workflowLevel: 'feature',
          rawJsonContent: result.content
        }],
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async validateAndRefineFeatures(features: any[]) {
    const systemPrompt = `You are a product quality expert and feature validation specialist. Evaluate each feature to ensure it meets product standards and can be effectively implemented.

For each feature, assess:
- User-focused: Does it address specific user needs?
- Implementable: Can it be built by development teams?
- Testable: Are the acceptance criteria clear?
- Measurable: Can success be tracked?
- Scoped: Are the boundaries well-defined?

Refine features that don't meet these criteria.`;

    const userPrompt = `Features to validate and refine:
${JSON.stringify(features, null, 2)}

Return refined features:
{
  "features": [
    {
      "id": "FEA-001",
      "text": "refined feature text",
      "category": "category",
      "priority": "priority",
      "rationale": "rationale",
      "acceptanceCriteria": ["criteria"],
      "businessValue": "business value",
      "workflowLevel": "workflowLevel"
    }
  ]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const refinedData = JSON.parse(result.content);
      const validatedFeatures = refinedData.features.map((feat: any, index: number) => ({
        ...feat,
        id: feat.id || `FEA-${String(index + 1).padStart(3, '0')}`,
      }));

      return {
        features: validatedFeatures,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: apply basic validation to original features
      const validatedFeatures = features.map((feat, index) => ({
        id: feat.id || `FEA-${String(index + 1).padStart(3, '0')}`,
        text: feat.text || 'Feature text',
        category: feat.category || 'functional',
        priority: feat.priority || 'medium',
        rationale: feat.rationale || 'Derived from initiative analysis',
        acceptanceCriteria: feat.acceptanceCriteria || ['To be defined'],
        businessValue: feat.businessValue || 'Business value to be determined',
        workflowLevel: feat.workflowLevel || 'feature',
      }));

      return {
        features: validatedFeatures,
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async generateProvokingQuestionsForFeature(feature: FeatureData) {
    const workflowContext = getAIPromptContext();
    const systemPrompt = `You are a senior technical lead and epic planning specialist. Your role is to ask provoking, insightful questions about a feature to ensure we fully understand how to decompose it into sprint-sized epics.

${workflowContext}

Analyze the feature and generate 6-8 thought-provoking questions that will help uncover:
1. Technical implementation approach and architecture
2. User workflows and interaction patterns
3. Data requirements and integration points
4. Testing and quality assurance considerations
5. Performance and scalability factors
6. Sprint boundaries and delivery milestones
7. Risk mitigation and technical debt
8. Dependencies on other systems or teams

Focus on questions that would help size epics appropriately for sprint delivery and ensure comprehensive decomposition into manageable work packages.`;

    const userPrompt = `Feature:
Title: ${feature.title}
Description: ${feature.description}
Category: ${feature.category}
Priority: ${feature.priority}
Rationale: ${feature.rationale}
Business Value: ${feature.businessValue}
Acceptance Criteria: ${feature.acceptanceCriteria.join(', ')}

Generate provoking questions as a JSON array: ["question 1", "question 2", ...]`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const questions = JSON.parse(result.content);
      return {
        questions: Array.isArray(questions) ? questions : [],
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: extract questions from text response
      const lines = result.content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
      const questions = lines.map(line => line.replace(/^[-\d.]\s*/, '').trim()).filter(q => q.length > 0);
      return {
        questions: questions.slice(0, 8),
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async performSelfAnalysisForFeature(feature: FeatureData, questions: string[]) {
    const systemPrompt = `You are a thoughtful technical architect performing a deep analysis of a feature. Answer the provoking questions with detailed insights, considering technical implementation, sprint planning, and delivery perspectives.

For each question, provide:
- A thorough technical analysis based on the feature
- Sprint sizing and delivery considerations
- Recommendations for epic decomposition

Be analytical, objective, and comprehensive in your responses with focus on deliverable work packages.`;

    const userPrompt = `Feature:
${JSON.stringify(feature, null, 2)}

Provoking Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Provide a comprehensive analysis addressing each question. Format as JSON:
{
  "analysis": "comprehensive analysis text addressing all questions",
  "insights": ["insight 1", "insight 2", "..."],
  "keyConsiderations": ["consideration 1", "consideration 2", "..."]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const analysisData = JSON.parse(result.content);
      return {
        analysis: analysisData.analysis || result.content,
        insights: analysisData.insights || [],
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      return {
        analysis: result.content,
        insights: [result.content],
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async generateInitialEpics(feature: FeatureData, analysis: string) {
    const workflowContext = getAIPromptContext();
    const systemPrompt = `You are an expert technical lead and sprint planning specialist. Based on the feature and comprehensive analysis, generate epics that can be delivered in 1-3 sprints each.

${workflowContext}

IMPORTANT: 
- Each epic should be a deliverable work package that fits within 1-3 sprints
- Epics should be substantial enough to be broken down into user stories
- Focus on technical implementation and delivery milestones
- Consider team capacity and sprint boundaries

Each epic must be:
- SPRINT-SIZED: Deliverable within 1-3 sprints
- TECHNICALLY-FOCUSED: Addresses specific implementation aspects
- TESTABLE: Has clear definition of done
- INDEPENDENT: Can be worked on with minimal dependencies
- VALUABLE: Contributes to the overall feature delivery

RESPONSE FORMAT REQUIREMENTS:
- Return ONLY valid JSON without any explanatory text
- Do NOT use markdown formatting or code blocks
- Do NOT include phrases like "Here are the epics:" or "Based on the analysis:"
- Your entire response must be parseable as JSON`;

    const userPrompt = `Feature:
${JSON.stringify(feature, null, 2)}

Analysis & Insights:
${analysis}

Generate epics as PURE JSON (no markdown, no code blocks, no explanatory text):
{
  "epics": [
    {
      "id": "EPIC-001",
      "text": "epic description",
      "category": "technical|user-experience|integration|testing|infrastructure|data",
      "priority": "high|medium|low",
      "rationale": "why this epic is needed",
      "acceptanceCriteria": ["criteria 1", "criteria 2"],
      "workflowLevel": "epic",
      "businessValue": "value this epic provides",
      "estimatedEffort": "Small|Medium|Large",
      "sprintEstimate": 1-3
    }
  ]
}

CRITICAL REQUIREMENTS:
- Return ONLY the JSON object above, no markdown formatting, no \`\`\`json blocks
- Priority must be exactly one of: "high", "medium", "low" (lowercase only)
- Each epic should be sized for 1-3 sprints maximum
- Focus on technical delivery and implementation aspects
- sprintEstimate must be a number between 1 and 3
- Response must be valid JSON that can be parsed directly`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const epicsData = JSON.parse(result.content);
      
      // Handle different JSON response formats
      let epics = [];
      
      if (Array.isArray(epicsData)) {
        epics = epicsData;
      } else if (epicsData.epics && Array.isArray(epicsData.epics)) {
        epics = epicsData.epics;
      } else {
        console.log('Unexpected JSON structure, storing raw content for manual parsing');
        return {
          epics: [{
            id: 'EPIC-PARSE-NEEDED',
            text: result.content,
            category: 'needs-parsing',
            priority: 'high' as const,
            rationale: 'JSON response needs manual parsing',
            acceptanceCriteria: ['Parse individual epics from JSON'],
            businessValue: 'Manual parsing required',
            workflowLevel: 'epic',
            estimatedEffort: 'Medium',
            sprintEstimate: 2,
            rawJsonContent: result.content
          }],
          tokensUsed: result.tokensUsed,
        };
      }
      
      return {
        epics: epics.map((epic: any, index: number) => ({
          id: epic.id || `EPIC-${String(index + 1).padStart(3, '0')}`,
          text: epic.text || epic.description || epic.title || 'Epic text not found',
          category: epic.category || 'technical',
          priority: (epic.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low',
          rationale: epic.rationale || epic.businessValue || 'Generated from feature analysis',
          acceptanceCriteria: epic.acceptanceCriteria || ['To be defined'],
          businessValue: epic.businessValue || 'Business value to be determined',
          workflowLevel: epic.workflowLevel || 'epic',
          estimatedEffort: epic.estimatedEffort || 'Medium',
          sprintEstimate: Math.min(Math.max(epic.sprintEstimate || 2, 1), 3) // Ensure 1-3 range
        })),
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      console.log('JSON parse failed for epics, using fallback');
      return {
        epics: [{
          id: 'EPIC-PARSE-NEEDED',
          text: result.content,
          category: 'needs-parsing',
          priority: 'high' as const,
          rationale: 'Response format needs manual review',
          acceptanceCriteria: ['Review and parse epics manually'],
          businessValue: 'Manual parsing required',
          workflowLevel: 'epic',
          estimatedEffort: 'Medium',
          sprintEstimate: 2,
          rawJsonContent: result.content
        }],
        tokensUsed: result.tokensUsed,
      };
    }
  }

  private async validateAndRefineEpics(epics: any[]) {
    const systemPrompt = `You are a sprint planning expert and epic validation specialist. Evaluate each epic to ensure it meets sprint delivery standards and can be effectively implemented.

For each epic, assess:
- Sprint-sized: Can it be delivered within 1-3 sprints?
- Technically-focused: Does it address specific implementation aspects?
- Testable: Are the acceptance criteria clear and measurable?
- Independent: Can it be worked on with minimal dependencies?
- Valuable: Does it contribute to the overall feature delivery?

Refine epics that don't meet these criteria. Ensure proper sprint sizing.`;

    const userPrompt = `Epics to validate and refine:
${JSON.stringify(epics, null, 2)}

Return refined epics:
{
  "epics": [
    {
      "id": "EPIC-001",
      "text": "refined epic text",
      "category": "category",
      "priority": "priority",
      "rationale": "rationale",
      "acceptanceCriteria": ["criteria"],
      "businessValue": "business value",
      "workflowLevel": "workflowLevel",
      "estimatedEffort": "effort level",
      "sprintEstimate": 1-3
    }
  ]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const refinedData = JSON.parse(result.content);
      const validatedEpics = refinedData.epics.map((epic: any, index: number) => ({
        ...epic,
        id: epic.id || `EPIC-${String(index + 1).padStart(3, '0')}`,
        sprintEstimate: Math.min(Math.max(epic.sprintEstimate || 2, 1), 3), // Ensure 1-3 range
      }));

      return {
        epics: validatedEpics,
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: apply basic validation to original epics
      const validatedEpics = epics.map((epic, index) => ({
        id: epic.id || `EPIC-${String(index + 1).padStart(3, '0')}`,
        text: epic.text || 'Epic text',
        category: epic.category || 'technical',
        priority: epic.priority || 'medium',
        rationale: epic.rationale || 'Derived from feature analysis',
        acceptanceCriteria: epic.acceptanceCriteria || ['To be defined'],
        businessValue: epic.businessValue || 'Business value to be determined',
        workflowLevel: epic.workflowLevel || 'epic',
        estimatedEffort: epic.estimatedEffort || 'Medium',
        sprintEstimate: Math.min(Math.max(epic.sprintEstimate || 2, 1), 3), // Ensure 1-3 range
      }));

      return {
        epics: validatedEpics,
        tokensUsed: result.tokensUsed,
      };
    }
  }
} 