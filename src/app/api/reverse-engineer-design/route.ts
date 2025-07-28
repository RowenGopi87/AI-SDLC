import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define the request schema
const DesignReverseEngineerSchema = z.object({
  inputType: z.enum(['figma', 'image', 'upload']),
  figmaUrl: z.string().optional(),
  designData: z.string(),
  imageData: z.string().optional(),
  imageType: z.string().optional(),
  fileData: z.array(z.object({
    filename: z.string(),
    content: z.string()
  })).optional(),
  analysisLevel: z.enum(['story', 'epic', 'feature', 'initiative', 'business-brief']),
  extractUserFlows: z.boolean().default(true),
  includeAccessibility: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Design reverse engineering API called');

    // Parse and validate the request body
    const body = await request.json();
    console.log('📥 Request body:', body);

    const validatedData = DesignReverseEngineerSchema.parse(body);
    const { 
      inputType, 
      figmaUrl, 
      designData, 
      imageData,
      imageType,
      fileData, 
      analysisLevel, 
      extractUserFlows, 
      includeAccessibility 
    } = validatedData;

    console.log('✅ Request validation passed');
    console.log('🎨 Reverse engineering level:', analysisLevel);

    // Build the comprehensive system prompt for design reverse engineering
    const systemPrompt = buildDesignReverseEngineeringPrompt(analysisLevel);

    // Build the user prompt with design analysis
    const userPrompt = buildDesignAnalysisPrompt(
      inputType,
      figmaUrl,
      designData,
      imageData,
      imageType,
      fileData,
      analysisLevel,
      extractUserFlows,
      includeAccessibility
    );

    console.log('📋 System prompt length:', systemPrompt.length);
    console.log('📋 User prompt length:', userPrompt.length);

    // Call the LLM service to analyze design and extract work items
    const reverseEngineeredItems = await analyzeDesignWithLLM(
      systemPrompt, 
      userPrompt, 
      analysisLevel,
      !!imageData
    );

    console.log('✅ Design analysis completed successfully');

    return NextResponse.json({
      success: true,
      data: reverseEngineeredItems,
      message: 'Design reverse engineered successfully'
    });

  } catch (error) {
    console.error('❌ Error in design reverse engineering API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reverse engineer design'
    }, { status: 500 });
  }
}

function buildDesignReverseEngineeringPrompt(analysisLevel: string): string {
  return `You are an expert UI/UX Analyst and Product Owner specializing in reverse engineering visual designs into structured business requirements. Your primary function is to analyze provided designs (Figma URLs, images, mockups) and extract meaningful work items at different organizational levels.

Your Goal: To analyze the provided visual design and extract business requirements, user stories, features, epics, initiatives, and business briefs based on the design's interface patterns, user flows, visual hierarchy, and interaction design.

Core Instructions & Analysis Approach:
1. Visual Design Analysis: Examine the layout, components, navigation patterns, information architecture, and user interface elements to understand the business domain and functionality.

2. User Experience Mapping: Identify user journeys, interaction flows, call-to-action patterns, and user task completion workflows embedded in the design.

3. Interface Component Analysis: Analyze forms, buttons, navigation menus, content areas, modals, and interactive elements to understand feature requirements.

4. Information Architecture: Extract the content structure, data relationships, and organizational patterns from the visual hierarchy.

5. Business Logic Extraction: Based on the design analysis, generate appropriate work items at the requested level:
   - Business Brief: Overall business context, strategic objectives, and market positioning
   - Initiative: Large-scale user experience goals and business outcomes
   - Feature: Specific interface capabilities and user-facing functionality
   - Epic: High-level user stories that group related interface interactions
   - Story: Detailed user stories with acceptance criteria based on interface elements

ANALYSIS DEPTH BASED ON LEVEL:
- Business Brief: Extract overall business domain, user experience strategy, market context
- Initiative: Identify major user experience capabilities and business outcomes
- Feature: Focus on specific interface areas and user capabilities
- Epic: Group related interface functionality into coherent user journeys
- Story: Create specific, actionable user stories based on interface elements

CRITICAL REQUIREMENTS FOR VISUAL DESIGN ANALYSIS:
- Analyze actual interface patterns and visual elements, don't make generic assumptions
- Extract specific functionality from buttons, forms, navigation, and interactive elements
- Identify user roles and access patterns from interface design
- Understand data models and content types from information architecture
- Map user workflows and interaction patterns from visual flows
- Identify integration points from external service indicators
- Extract quality attributes (accessibility, responsiveness, performance requirements)
- Analyze visual hierarchy to understand business priorities
- Consider mobile/responsive design patterns if present

VISUAL ELEMENTS TO ANALYZE:
- Navigation systems and menu structures
- Forms and input fields (registration, login, data entry)
- Buttons and call-to-action elements
- Content layouts and information hierarchy
- Interactive components (dropdowns, modals, tabs)
- Visual branding and design system elements
- Mobile responsiveness indicators
- Accessibility features visible in design

Your response must be a valid JSON object with the following structure based on analysis level:

For Business Brief level:
{
  "analysisDepth": "business-brief",
  "extractedInsights": "Detailed analysis of the business domain and strategic context extracted from design",
  "designAnalysis": "Specific analysis of visual design patterns, user interface elements, and interaction design",
  "userFlows": ["List of user workflows identified from design"],
  "accessibilityInsights": ["Accessibility considerations based on design elements"],
  "businessBrief": {
    "id": "BB-DESIGN-REV-001",
    "title": "Extracted Business Brief Title",
    "description": "Business context extracted from design analysis",
    "businessObjective": "Primary business goals identified from design functionality",
    "quantifiableBusinessOutcomes": ["Specific measurable outcomes based on design capabilities"]
  },
  "initiatives": [...], // If analysisLevel includes initiatives
  "features": [...], // If analysisLevel includes features  
  "epics": [...], // If analysisLevel includes epics
  "stories": [...] // Always include stories
}

For other levels, include only the appropriate work items based on hierarchy.

IMPORTANT: Base all extractions on ACTUAL visual design elements and interface patterns, not generic UI assumptions.`;
}

function buildDesignAnalysisPrompt(
  inputType: string,
  figmaUrl: string | undefined,
  designData: string,
  imageData: string | undefined,
  imageType: string | undefined,
  fileData: { filename: string; content: string }[] | undefined,
  analysisLevel: string,
  extractUserFlows: boolean,
  includeAccessibility: boolean
): string {
  const sourceContext = inputType === 'figma' 
    ? `Figma Design URL: ${figmaUrl}`
    : inputType === 'image' 
    ? `Design Image Analysis`
    : 'Multiple Design Files Analysis';

  const analysisScope = [
    `Analysis Level: ${analysisLevel}`,
    extractUserFlows ? "Extract user flows and interaction patterns" : "Focus on static design elements",
    includeAccessibility ? "Include accessibility analysis based on visual design" : "Focus only on functional requirements"
  ].join(". ");

  const fileBreakdown = fileData?.length 
    ? `\n\nDESIGN FILES:\n${fileData.map(file => `=== ${file.filename} ===\nFile Type: Image/Design File\nContent: Base64 encoded design image\n`).join('\n')}`
    : '';

  const imagePrompt = imageData ? 
    `I have provided a design image that I want you to analyze and reverse engineer into business requirements. Please examine this visual design carefully and extract work items based on the interface elements, user flows, and business functionality you can identify.` : 
    `Please analyze the provided design information and extract work items at the ${analysisLevel} level.`;

  return `${imagePrompt}

SOURCE: ${sourceContext}
ANALYSIS SCOPE: ${analysisScope}

${fileBreakdown}

DESIGN INFORMATION:
${designData}

VISUAL ANALYSIS INSTRUCTIONS:
1. Identify the primary business domain from visual branding and content
2. Extract user roles and permissions from interface access patterns
3. Map interface components to functional requirements (forms → data entry, buttons → actions)
4. Identify user workflows from navigation and interaction patterns
5. Extract business rules from form validation and UI constraints
6. Identify integration points from external service indicators
7. Analyze accessibility features and responsive design patterns
8. Generate work items based on actual interface functionality

Focus on extracting meaningful business requirements that reflect the actual design implementation and user experience, not generic interface patterns.

Provide your analysis as a valid JSON response following the specified structure.`;
}

async function analyzeDesignWithLLM(
  systemPrompt: string,
  userPrompt: string,
  analysisLevel: string,
  hasImage: boolean
): Promise<any> {
  try {
    console.log('🤖 Calling LLM for design analysis...');
    
    // TODO: Replace with actual LLM service call
    // For now, return mock data based on analysis level
    
    const baseInsights = `Visual design analysis reveals a modern, user-centric interface with clear information hierarchy, intuitive navigation patterns, and professional visual design. The interface demonstrates strong UX principles with accessible design patterns and responsive layout considerations.`;
    
    const designAnalysis = `The design showcases contemporary UI patterns with clean typography, consistent spacing, and purposeful color usage. Key interface elements include streamlined navigation, prominent calls-to-action, well-organized content sections, and user-friendly form designs. The visual hierarchy guides users through optimal task completion flows.`;
    
    const mockData: any = {
      analysisDepth: analysisLevel,
      extractedInsights: `${baseInsights} Analysis includes ${hasImage ? 'detailed visual examination' : 'design pattern review'}.`,
      designAnalysis,
      userFlows: [
        'User onboarding and account setup',
        'Primary navigation and content discovery', 
        'Task completion and form submission',
        'Settings and profile management'
      ],
      accessibilityInsights: [
        'High contrast ratios for text readability',
        'Clear focus indicators for keyboard navigation',
        'Sufficient touch target sizes for mobile users',
        'Semantic structure for screen reader compatibility'
      ],
      stories: [
        {
          id: 'STORY-DESIGN-REV-001',
          title: 'As a user, I want a clear navigation system',
          description: 'Intuitive navigation interface extracted from design analysis',
          category: 'navigation',
          priority: 'high',
          acceptanceCriteria: ['Navigation is clearly visible', 'Menu items are logically organized', 'Mobile navigation works properly'],
          businessValue: 'Enables users to easily find and access different sections of the application',
          workflowLevel: 'story',
          storyPoints: 3,
          labels: ['ui', 'navigation']
        },
        {
          id: 'STORY-DESIGN-REV-002', 
          title: 'As a user, I want responsive design across devices',
          description: 'Mobile-responsive interface capabilities identified in design',
          category: 'responsive-design',
          priority: 'high',
          acceptanceCriteria: ['Layout adapts to mobile screens', 'Touch targets are appropriately sized', 'Content remains readable'],
          businessValue: 'Ensures optimal user experience across all device types',
          workflowLevel: 'story',
          storyPoints: 5,
          labels: ['responsive', 'mobile']
        }
      ]
    };

    // Add higher-level items based on analysis level
    if (['epic', 'feature', 'initiative', 'business-brief'].includes(analysisLevel)) {
      mockData.epics = [
        {
          id: 'EPIC-DESIGN-REV-001',
          title: 'User Interface Implementation Epic',
          description: 'Complete user interface development based on design specifications and user experience requirements',
          category: 'ui-development',
          priority: 'high',
          acceptanceCriteria: ['All design elements implemented accurately', 'User flows work as intended', 'Responsive design functions properly'],
          businessValue: 'Delivers comprehensive user interface that matches design vision and user needs',
          workflowLevel: 'epic',
          estimatedEffort: 'Large',
          sprintEstimate: 6
        }
      ];
    }

    if (['feature', 'initiative', 'business-brief'].includes(analysisLevel)) {
      mockData.features = [
        {
          id: 'FEAT-DESIGN-REV-001',
          title: 'Interactive User Interface Feature',
          description: 'User interface components and interaction patterns based on design analysis',
          category: 'user-interface',
          priority: 'high',
          acceptanceCriteria: ['Modern, clean interface design', 'Intuitive user interactions', 'Consistent design system'],
          businessValue: 'Provides users with modern, engaging interface that drives user satisfaction',
          workflowLevel: 'feature',
          estimatedEffort: 'Medium',
          targetRelease: 'v1.0'
        }
      ];
    }

    if (['initiative', 'business-brief'].includes(analysisLevel)) {
      mockData.initiatives = [
        {
          id: 'INIT-DESIGN-REV-001',
          title: 'User Experience Enhancement Initiative',
          description: 'Comprehensive user experience improvement based on modern design principles and user-centered approach',
          category: 'user-experience',
          priority: 'high',
          acceptanceCriteria: ['Improved user satisfaction scores', 'Reduced task completion time', 'Higher user engagement'],
          businessValue: 'Establishes superior user experience that differentiates the product and drives user retention',
          workflowLevel: 'initiative',
          estimatedEffort: 'Extra Large',
          strategicAlignment: 'User experience excellence'
        }
      ];
    }

    if (analysisLevel === 'business-brief') {
      mockData.businessBrief = {
        id: 'BB-DESIGN-REV-001',
        title: 'UI/UX Design Business Brief',
        description: 'Comprehensive business context extracted from visual design analysis and user experience requirements',
        businessObjective: 'Deliver exceptional user experience through modern, intuitive interface design that drives user engagement and business outcomes',
        quantifiableBusinessOutcomes: [
          'Increase user engagement by 40%',
          'Improve task completion rates by 25%', 
          'Reduce user onboarding time by 50%',
          'Achieve 95% user satisfaction score'
        ]
      };
    }

    console.log('✅ LLM design analysis completed successfully');
    return mockData;

  } catch (error) {
    console.error('❌ Error in LLM design analysis:', error);
    throw new Error('Failed to analyze design with LLM');
  }
} 