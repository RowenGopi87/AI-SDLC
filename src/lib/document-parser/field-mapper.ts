/**
 * Field Mapper for Business Brief Documents
 * Handles fuzzy matching and multiple template variations
 */

export interface BusinessBriefFields {
  title?: string;
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

// Field mapping with multiple possible variations
const FIELD_MAPPINGS = {
  title: [
    'title', 'idea title', 'project name', 'initiative title', 'idea name',
    'project title', 'solution name', 'business brief title', 'request title'
  ],
  description: [
    'description', 'business aim', 'change description', 'business description',
    'initiative description', 'project description', 'overview', 'summary'
  ],
  businessOwner: [
    'business owner', 'owner of business', 'submitted person', 'submitted by',
    'owner', 'responsible person', 'project owner', 'initiative owner'
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
    'impact of do nothing', 'if ignored', 'consequences', 'risks',
    'impact of not proceeding', 'do nothing scenario'
  ],
  happyPath: [
    'happy path', 'path', 'steps', 'user journey', 'process flow',
    'ideal scenario', 'normal flow', 'standard process'
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
   * Find field value using fuzzy matching
   */
  private static findFieldValue(text: string, variations: string[]): string | null {
    for (const variation of variations) {
      // Try exact match first
      let pattern = new RegExp(`${this.escapeRegex(variation)}[\\s:]+([^\\n\\r]{10,300})`, 'i');
      let match = text.match(pattern);
      
      if (match && match[1]) {
        return match[1].trim();
      }

      // Try partial match with word boundaries
      const words = variation.split(' ');
      if (words.length > 1) {
        const partialPattern = new RegExp(
          `\\b${words.map(w => this.escapeRegex(w)).join('[\\s\\W]*')}[\\s:]+([^\\n\\r]{10,300})`, 
          'i'
        );
        match = text.match(partialPattern);
        
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }

    return null;
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
