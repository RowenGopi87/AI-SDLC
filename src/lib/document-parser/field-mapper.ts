/**
 * Field Mapper for Business Brief Documents
 * Handles fuzzy matching and multiple template variations
 */

export interface BusinessBriefFields {
  title?: string;
  submittedBy?: string;
  description?: string;
  businessOwner?: string;
  leadBusinessUnit?: string;
  primaryStrategicTheme?: string;
  businessObjective?: string;
  quantifiableBusinessOutcomes?: string;
  inScope?: string;
  impactOfDoNothing?: string;
  happyPath?: string;
  exceptions?: string;
  impactedEndUsers?: string;
  changeImpactExpected?: string;
  impactToOtherDepartments?: string;
  technologySolutions?: string;
  relevantBusinessOwners?: string;
  otherTechnologyInfo?: string;
  additionalBusinessUnits?: string[];
  otherDepartmentsImpacted?: string[];
  supportingDocuments?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  impactsExistingTechnology?: boolean;
}

// Enhanced field mapping with specific document patterns
const FIELD_MAPPINGS = {
  title: [
    'idea name', 'idea title', 'title', 'project name', 'initiative title',
    'project title', 'solution name', 'business brief title', 'request title'
  ],
  submittedBy: [
    'submitted by', 'submitted person', 'submitter', 'author', 'requester'
  ],
  description: [
    'business objective & description of change', 'description of change', 'business aim', 
    'change description', 'business description', 'initiative description', 
    'project description', 'overview', 'summary', 'description'
  ],
  businessOwner: [
    'business owner', 'owner of business', 'owner', 'responsible person', 
    'project owner', 'initiative owner'
  ],
  leadBusinessUnit: [
    'lead business unit', 'main business department', 'business unit',
    'department', 'primary department', 'responsible unit', 'business area'
  ],
  primaryStrategicTheme: [
    'primary strategic theme', 'strategic direction', 'strategic theme',
    'strategic focus', 'strategic priority', 'strategic alignment'
  ],
  businessObjective: [
    'business objective', 'business aim', 'objective', 'business goal',
    'primary objective', 'main goal', 'business purpose'
  ],
  quantifiableBusinessOutcomes: [
    'quantifiable business outcomes', 'expected results', 'business outcomes',
    'measurable outcomes', 'kpis', 'roi', 'benefits', 'success metrics'
  ],
  inScope: [
    'in scope', 'included scope', 'scope', 'included', 'what is included',
    'project scope', 'initiative scope'
  ],
  impactOfDoNothing: [
    'impact of do nothing', 'impact of doing nothing', 'if ignored', 'consequences', 
    'risks', 'impact of not proceeding', 'do nothing scenario'
  ],
  happyPath: [
    'happy path', 'path', 'steps', 'user journey', 'process flow',
    'ideal scenario', 'normal flow', 'standard process', 'user experience'
  ],
  exceptions: [
    'exceptions', 'error scenarios', 'edge cases', 'failure scenarios',
    'alternate paths', 'error handling'
  ],
  impactedEndUsers: [
    'impacted end users', 'affected users', 'end users', 'users affected',
    'target users', 'stakeholders'
  ],
  technologySolutions: [
    'technology solutions', 'tech tools', 'technical solutions',
    'technology stack', 'tech stack', 'platforms', 'systems'
  ],
  priority: [
    'priority', 'urgency', 'importance', 'criticality'
  ]
};

export class FieldMapper {
  /**
   * Extract fields from document text using fuzzy matching
   */
  static extractFields(text: string): BusinessBriefFields {
    const extracted: BusinessBriefFields = {};
    const normalizedText = text.toLowerCase();
    
    // Extract each field type
    Object.entries(FIELD_MAPPINGS).forEach(([fieldName, variations]) => {
      const value = this.findFieldValue(normalizedText, variations);
      if (value) {
        (extracted as any)[fieldName] = this.cleanFieldValue(fieldName, value);
      }
    });

    // Extract arrays and special fields
    extracted.additionalBusinessUnits = this.extractArrayField(text, [
      'additional business units', 'other departments', 'supporting units'
    ]);
    
    extracted.otherDepartmentsImpacted = this.extractArrayField(text, [
      'other departments impacted', 'affected departments', 'impacted departments'
    ]);

    extracted.supportingDocuments = this.extractArrayField(text, [
      'supporting documents', 'reference documents', 'attachments'
    ]);

    // Extract boolean field
    extracted.impactsExistingTechnology = this.extractBooleanField(text, [
      'impacts existing technology', 'affects current systems'
    ]);

    return extracted;
  }

  /**
   * Find field value using enhanced table-aware fuzzy matching
   */
  private static findFieldValue(text: string, variations: string[]): string | null {
    for (const variation of variations) {
      // Pattern 1: Table structure with field name and value (handles table cells)
      let pattern = new RegExp(`${this.escapeRegex(variation)}[\\s\\t]*([^\\n\\r]+)`, 'i');
      let match = text.match(pattern);
      
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 3 && !this.isFieldName(value)) {
          return this.cleanExtractedValue(value);
        }
      }

      // Pattern 2: Field name followed by colon and value on same or next line
      pattern = new RegExp(`${this.escapeRegex(variation)}[\\s:]*\\n?([^\\n\\r]{5,500})`, 'i');
      match = text.match(pattern);
      
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 3 && !this.isFieldName(value)) {
          return this.cleanExtractedValue(value);
        }
      }

      // Pattern 3: Multi-line content after field name (for longer descriptions)
      pattern = new RegExp(`${this.escapeRegex(variation)}[\\s:]*\\n([\\s\\S]{10,1000}?)(?=\\n\\s*[A-Z][a-z\\s]+:|\\n\\s*$|$)`, 'i');
      match = text.match(pattern);
      
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 10 && !this.isFieldName(value)) {
          return this.cleanExtractedValue(value);
        }
      }

      // Pattern 4: Table row format (Field | Value)
      pattern = new RegExp(`${this.escapeRegex(variation)}[\\s\\|\\t]+([^\\|\\n\\r]{5,300})`, 'i');
      match = text.match(pattern);
      
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 3 && !this.isFieldName(value)) {
          return this.cleanExtractedValue(value);
        }
      }

      // Pattern 5: Partial word matching for flexibility
      const words = variation.split(' ');
      if (words.length > 1) {
        const partialPattern = new RegExp(
          `\\b${words.map(w => this.escapeRegex(w)).join('[\\s\\W]*')}[\\s:]*([^\\n\\r]{5,300})`, 
          'i'
        );
        match = text.match(partialPattern);
        
        if (match && match[1]) {
          const value = match[1].trim();
          if (value.length > 3 && !this.isFieldName(value)) {
            return this.cleanExtractedValue(value);
          }
        }
      }
    }

    return null;
  }

  /**
   * Check if extracted text looks like a field name rather than a value
   */
  private static isFieldName(text: string): boolean {
    const fieldIndicators = [
      'priority', 'status', 'owner', 'unit', 'theme', 'objective', 'outcomes',
      'scope', 'impact', 'path', 'exceptions', 'users', 'solutions', 'urgency'
    ];
    
    const lowerText = text.toLowerCase();
    return fieldIndicators.some(indicator => lowerText.includes(indicator)) && text.length < 50;
  }

  /**
   * Clean extracted values
   */
  private static cleanExtractedValue(value: string): string {
    return value
      .replace(/^\s*[-•|\t]+\s*/, '') // Remove leading bullets, dashes, pipes
      .replace(/\s*[-•|\t]+\s*$/, '') // Remove trailing bullets, dashes, pipes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract array field (comma-separated values)
   */
  private static extractArrayField(text: string, variations: string[]): string[] {
    const value = this.findFieldValue(text.toLowerCase(), variations);
    if (!value) return [];

    return value
      .split(/[,;]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Extract boolean field
   */
  private static extractBooleanField(text: string, variations: string[]): boolean {
    for (const variation of variations) {
      const pattern = new RegExp(`${this.escapeRegex(variation)}[\\s:]+([^\\n\\r]+)`, 'i');
      const match = text.toLowerCase().match(pattern);
      
      if (match && match[1]) {
        const value = match[1].toLowerCase();
        return value.includes('yes') || value.includes('true') || value.includes('affects');
      }
    }
    return false;
  }

  /**
   * Clean and format field values
   */
  private static cleanFieldValue(fieldName: string, value: string): any {
    let cleaned = value.trim();
    
    // Remove common prefixes/suffixes
    cleaned = cleaned.replace(/^[-:•]\s*/, '');
    cleaned = cleaned.replace(/\s*[-:]$/, '');
    
    // Handle specific field types
    switch (fieldName) {
      case 'priority':
        if (cleaned.toLowerCase().includes('critical') || cleaned.toLowerCase().includes('urgent')) {
          return 'critical';
        } else if (cleaned.toLowerCase().includes('high')) {
          return 'high';
        } else if (cleaned.toLowerCase().includes('low')) {
          return 'low';
        } else {
          return 'medium';
        }
      
      case 'businessOwner':
      case 'relevantBusinessOwners':
        // Extract names (assume proper case names)
        const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
        const names = cleaned.match(namePattern);
        return names ? names[0] : cleaned;
      
      default:
        return cleaned;
    }
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Enhanced extraction using LLM-like pattern recognition
   */
  static enhanceWithAI(text: string, basicExtraction: BusinessBriefFields): BusinessBriefFields {
    const enhanced = { ...basicExtraction };
    
    // If title is missing, try to infer from context
    if (!enhanced.title) {
      enhanced.title = this.inferTitle(text);
    }

    // If business outcomes are missing, look for financial indicators
    if (!enhanced.quantifiableBusinessOutcomes) {
      enhanced.quantifiableBusinessOutcomes = this.extractFinancialMetrics(text);
    }

    // If priority is missing, infer from urgency keywords
    if (!enhanced.priority) {
      enhanced.priority = this.inferPriority(text);
    }

    return enhanced;
  }

  /**
   * Infer title from document structure
   */
  private static inferTitle(text: string): string | undefined {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Look for lines that could be titles
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (trimmed.length > 10 && trimmed.length < 100 && 
          (trimmed.includes('Dashboard') || trimmed.includes('Platform') || 
           trimmed.includes('System') || trimmed.includes('Enhancement') ||
           trimmed.includes('Management') || trimmed.includes('Service'))) {
        return trimmed;
      }
    }

    return undefined;
  }

  /**
   * Extract financial metrics and KPIs
   */
  private static extractFinancialMetrics(text: string): string | undefined {
    const metrics: string[] = [];
    
    // Look for percentages
    const percentages = text.match(/\d+%/g);
    if (percentages) {
      metrics.push(...percentages);
    }

    // Look for dollar amounts
    const dollars = text.match(/\$[\d,]+(?:K|M|B)?/gi);
    if (dollars) {
      metrics.push(...dollars);
    }

    // Look for ROI, savings, increases
    const improvements = text.match(/(?:increase|decrease|reduce|save|roi)[^.]{0,50}(?:\d+%|\$[\d,]+)/gi);
    if (improvements) {
      metrics.push(...improvements);
    }

    return metrics.length > 0 ? metrics.join(', ') : undefined;
  }

  /**
   * Infer priority from text content
   */
  private static inferPriority(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lower = text.toLowerCase();
    
    if (lower.includes('critical') || lower.includes('urgent') || lower.includes('asap')) {
      return 'critical';
    } else if (lower.includes('high priority') || lower.includes('important') || lower.includes('soon')) {
      return 'high';
    } else if (lower.includes('low priority') || lower.includes('nice to have') || lower.includes('optional')) {
      return 'low';
    } else {
      return 'medium';
    }
  }
}
