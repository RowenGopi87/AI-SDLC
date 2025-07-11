import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const systemPrompt = `You are a senior business analyst and requirements expert. Your role is to ask provoking, insightful questions about a business brief to ensure we fully understand the requirements before generating them.

Analyze the business brief and generate 8-12 thought-provoking questions that will help uncover:
1. Hidden assumptions and edge cases
2. Stakeholder impacts not explicitly mentioned  
3. Technical and operational constraints
4. Success criteria and measurability
5. Risk mitigation strategies
6. Integration points with existing systems
7. User experience considerations
8. Compliance and regulatory requirements

Focus on questions that would challenge the brief and ensure comprehensive requirement coverage.`;

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
    const systemPrompt = `You are an expert requirements engineer. Based on the business brief and comprehensive analysis, generate detailed functional and non-functional requirements.

Each requirement must be:
- CLEAR: Easy to understand
- CONCISE: Brief but complete
- CORRECT: Accurate and valid
- COMPLETE: Fully specified
- FEASIBLE: Technically possible
- TESTABLE: Verifiable
- UNAMBIGUOUS: Single interpretation
- ATOMIC: Single concern per requirement

Generate requirements in these categories:
1. Functional Requirements
2. User Interface Requirements  
3. Performance Requirements
4. Security Requirements
5. Integration Requirements
6. Data Requirements
7. Business Rules
8. Compliance Requirements`;

    const userPrompt = `Business Brief:
${JSON.stringify(businessBrief, null, 2)}

Analysis & Insights:
${analysis}

Generate comprehensive requirements as JSON:
{
  "requirements": [
    {
      "id": "REQ-001",
      "text": "requirement description",
      "category": "functional|non-functional|security|etc",
      "priority": "high|medium|low",
      "rationale": "why this requirement is needed",
      "acceptanceCriteria": ["criteria 1", "criteria 2"]
    }
  ]
}`;

    const result = await this.callLLM(systemPrompt, userPrompt);
    
    try {
      const requirementsData = JSON.parse(result.content);
      return {
        requirements: requirementsData.requirements || [],
        tokensUsed: result.tokensUsed,
      };
    } catch (error) {
      // Fallback: create minimal requirements structure
      return {
        requirements: [{
          id: 'REQ-001',
          text: result.content,
          category: 'functional',
          priority: 'high' as const,
          rationale: 'Generated from business brief',
          acceptanceCriteria: ['To be defined'],
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

    const response = await this.openai.chat.completions.create({
      model: this.settings.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: this.settings.temperature || 0.7,
      max_tokens: this.settings.maxTokens || 8192,
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