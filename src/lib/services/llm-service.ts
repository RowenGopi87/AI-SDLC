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
} 