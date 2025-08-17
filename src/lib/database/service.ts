// Main database service for Aura's SDLC workflow
import { db } from './connection';
import { DatabaseSchema, BusinessBrief, Initiative, Feature, Epic, Story, TestCase, Document, SafeMapping } from './schema';

export interface DatabaseService {
  // Initialization
  initialize(): Promise<void>;
  
  // Business Briefs
  createBusinessBrief(brief: Partial<BusinessBrief>): Promise<BusinessBrief>;
  getBusinessBrief(id: string): Promise<BusinessBrief | null>;
  getAllBusinessBriefs(): Promise<BusinessBrief[]>;
  getBusinessBriefs(options?: { status?: string; limit?: number; offset?: number }): Promise<BusinessBrief[]>;
  updateBusinessBrief(id: string, updates: Partial<BusinessBrief>): Promise<BusinessBrief>;
  deleteBusinessBrief(id: string): Promise<boolean>;
  
  // Initiatives
  createInitiative(initiative: Partial<Initiative>): Promise<Initiative>;
  getInitiative(id: string): Promise<Initiative | null>;
  getInitiativesByBusinessBrief(businessBriefId: string): Promise<Initiative[]>;
  getAllInitiatives(): Promise<Initiative[]>;
  updateInitiative(id: string, updates: Partial<Initiative>): Promise<Initiative>;
  deleteInitiative(id: string): Promise<boolean>;
  
  // Features
  createFeature(feature: Partial<Feature>): Promise<Feature>;
  getFeature(id: string): Promise<Feature | null>;
  getFeaturesByInitiative(initiativeId: string): Promise<Feature[]>;
  getAllFeatures(): Promise<Feature[]>;
  updateFeature(id: string, updates: Partial<Feature>): Promise<Feature>;
  deleteFeature(id: string): Promise<boolean>;
  
  // Epics
  createEpic(epic: Partial<Epic>): Promise<Epic>;
  getEpic(id: string): Promise<Epic | null>;
  getEpicsByFeature(featureId: string): Promise<Epic[]>;
  getAllEpics(): Promise<Epic[]>;
  updateEpic(id: string, updates: Partial<Epic>): Promise<Epic>;
  deleteEpic(id: string): Promise<boolean>;
  
  // Stories
  createStory(story: Partial<Story>): Promise<Story>;
  getStory(id: string): Promise<Story | null>;
  getStoriesByEpic(epicId: string): Promise<Story[]>;
  getAllStories(): Promise<Story[]>;
  updateStory(id: string, updates: Partial<Story>): Promise<Story>;
  deleteStory(id: string): Promise<boolean>;
  
  // Test Cases
  createTestCase(testCase: Partial<TestCase>): Promise<TestCase>;
  getTestCase(id: string): Promise<TestCase | null>;
  getTestCasesByStory(storyId: string): Promise<TestCase[]>;
  getAllTestCases(): Promise<TestCase[]>;
  updateTestCase(id: string, updates: Partial<TestCase>): Promise<TestCase>;
  deleteTestCase(id: string): Promise<boolean>;
  
  // Documents
  createDocument(document: Partial<Document>): Promise<Document>;
  getDocument(id: string): Promise<Document | null>;
  getAllDocuments(): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
  
  // SAFe Mappings
  createSafeMapping(mapping: Partial<SafeMapping>): Promise<SafeMapping>;
  getSafeMappingByWorkItem(workItemId: string, workItemType: string): Promise<SafeMapping | null>;
  getAllSafeMappings(): Promise<SafeMapping[]>;
  updateSafeMapping(id: string, updates: Partial<SafeMapping>): Promise<SafeMapping>;
  deleteSafeMapping(id: string): Promise<boolean>;
  
  // Hierarchy and relationships
  getWorkItemHierarchy(): Promise<any>;
  getWorkItemsByType(type: string): Promise<any[]>;
}

class AuraDatabaseService implements DatabaseService {
  private static instance: AuraDatabaseService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): AuraDatabaseService {
    if (!AuraDatabaseService.instance) {
      AuraDatabaseService.instance = new AuraDatabaseService();
    }
    return AuraDatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🔄 Initializing Aura Database Service...');
      
      // Initialize database connection
      await db.initialize();
      
      // Initialize schema
      await DatabaseSchema.initializeSchema();
      
      this.initialized = true;
      console.log('✅ Aura Database Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Aura Database Service:', error);
      throw error;
    }
  }

  // Business Briefs
  public async createBusinessBrief(brief: Partial<BusinessBrief>): Promise<BusinessBrief> {
    const query = `
      INSERT INTO business_briefs (
        id, title, description, business_owner, lead_business_unit,
        additional_business_units, primary_strategic_theme, business_objective,
        quantifiable_business_outcomes, in_scope, impact_of_do_nothing,
        happy_path, exceptions, impacted_end_users, change_impact_expected,
        impact_to_other_departments, other_departments_impacted,
        impacts_existing_technology, technology_solutions, relevant_business_owners,
        other_technology_info, supporting_documents, submitted_by, submitted_at,
        status, priority, workflow_stage, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      brief.id || `BB-${Date.now().toString(36)}`, // Use provided ID or generate BB- prefixed ID
      brief.title || '',
      brief.description || '',
      brief.businessOwner || null,
      brief.leadBusinessUnit || null,
      brief.additionalBusinessUnits || null,
      brief.primaryStrategicTheme || null,
      brief.businessObjective || null,
      brief.quantifiableBusinessOutcomes || null,
      brief.inScope || null,
      brief.impactOfDoNothing || null,
      brief.happyPath || null,
      brief.exceptions || null,
      brief.impactedEndUsers || null,
      brief.changeImpactExpected || null,
      brief.impactToOtherDepartments || null,
      brief.otherDepartmentsImpacted || null,
      brief.impactsExistingTechnology || false,
      brief.technologySolutions || null,
      brief.relevantBusinessOwners || null,
      brief.otherTechnologyInfo || null,
      brief.supportingDocuments || null,
      brief.submittedBy || null,
      brief.submittedAt || null,
      brief.status || 'draft',
      brief.priority || 'medium',
      brief.workflowStage || 'idea',
      brief.completionPercentage || 0
    ];

    await db.execute(query, values);
    
    // Return the business brief object directly instead of fetching it back
    return {
      id: brief.id || `BB-${Date.now().toString(36)}`,
      title: brief.title || '',
      description: brief.description || '',
      businessOwner: brief.businessOwner || undefined,
      leadBusinessUnit: brief.leadBusinessUnit || undefined,
      additionalBusinessUnits: brief.additionalBusinessUnits || undefined,
      primaryStrategicTheme: brief.primaryStrategicTheme || undefined,
      businessObjective: brief.businessObjective || undefined,
      quantifiableBusinessOutcomes: brief.quantifiableBusinessOutcomes || undefined,
      inScope: brief.inScope || undefined,
      impactOfDoNothing: brief.impactOfDoNothing || undefined,
      happyPath: brief.happyPath || undefined,
      exceptions: brief.exceptions || undefined,
      impactedEndUsers: brief.impactedEndUsers || undefined,
      changeImpactExpected: brief.changeImpactExpected || undefined,
      impactToOtherDepartments: brief.impactToOtherDepartments || undefined,
      otherDepartmentsImpacted: brief.otherDepartmentsImpacted || undefined,
      impactsExistingTechnology: brief.impactsExistingTechnology || undefined,
      technologySolutions: brief.technologySolutions || undefined,
      relevantBusinessOwners: brief.relevantBusinessOwners || undefined,
      otherTechnologyInfo: brief.otherTechnologyInfo || undefined,
      supportingDocuments: brief.supportingDocuments || undefined,
      submittedBy: brief.submittedBy || undefined,
      submittedAt: brief.submittedAt || undefined,
      status: brief.status || 'draft',
      priority: brief.priority || 'medium',
      workflowStage: brief.workflowStage || 'idea',
      completionPercentage: brief.completionPercentage || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public async getBusinessBrief(id: string): Promise<BusinessBrief | null> {
    const result = await db.execute<any>('SELECT * FROM business_briefs WHERE id = ?', [id]);
    return result.length > 0 ? this.mapBusinessBrief(result[0]) : null;
  }

  public async getAllBusinessBriefs(): Promise<BusinessBrief[]> {
    const results = await db.execute<any>('SELECT * FROM business_briefs ORDER BY created_at DESC');
    return results.map(row => this.mapBusinessBrief(row));
  }

  public async getBusinessBriefs(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<BusinessBrief[]> {
    let query = 'SELECT * FROM business_briefs';
    const values: any[] = [];
    const conditions: string[] = [];

    if (options?.status) {
      conditions.push('status = ?');
      values.push(options.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      values.push(options.limit);
      
      if (options?.offset) {
        query += ' OFFSET ?';
        values.push(options.offset);
      }
    }

    const results = await db.execute<any>(query, values);
    return results.map(row => this.mapBusinessBrief(row));
  }

  public async deleteBusinessBrief(id: string): Promise<boolean> {
    try {
      const result = await db.execute('DELETE FROM business_briefs WHERE id = ?', [id]);
      // Check if any rows were affected (deleted)
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Failed to delete business brief:', error);
      return false;
    }
  }

  public async updateBusinessBrief(id: string, updates: Partial<BusinessBrief>): Promise<BusinessBrief> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE business_briefs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);
    
    const updated = await this.getBusinessBrief(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated business brief');
    }
    
    return updated;
  }

  // Initiatives
  public async createInitiative(initiative: Partial<Initiative>): Promise<Initiative> {
    const query = `
      INSERT INTO initiatives (
        id, business_brief_id, title, description, business_value, acceptance_criteria,
        priority, status, assigned_to, estimated_value, workflow_stage, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      initiative.id || `INIT-${Date.now().toString(36)}`,
      initiative.businessBriefId || '',
      initiative.title || '',
      initiative.description || '',
      initiative.businessValue || null,
      initiative.acceptanceCriteria || null,
      initiative.priority || 'medium',
      initiative.status || 'backlog',
      initiative.assignedTo || null,
      initiative.estimatedValue || null,
      initiative.workflowStage || 'planning',
      initiative.completionPercentage || 0
    ];

    await db.execute(query, values);
    
    // Return the initiative object directly instead of fetching it back
    return {
      id: initiative.id || `INIT-${Date.now().toString(36)}`,
      businessBriefId: initiative.businessBriefId || '',
      title: initiative.title || '',
      description: initiative.description || '',
      businessValue: initiative.businessValue || null,
      acceptanceCriteria: initiative.acceptanceCriteria || null,
      priority: initiative.priority || 'medium',
      status: initiative.status || 'backlog',
      assignedTo: initiative.assignedTo || null,
      estimatedValue: initiative.estimatedValue || null,
      workflowStage: initiative.workflowStage || 'planning',
      completionPercentage: initiative.completionPercentage || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public async getInitiative(id: string): Promise<Initiative | null> {
    const result = await db.execute<any>('SELECT * FROM initiatives WHERE id = ?', [id]);
    return result.length > 0 ? this.mapInitiative(result[0]) : null;
  }

  public async getInitiativesByBusinessBrief(businessBriefId: string): Promise<Initiative[]> {
    const results = await db.execute<any>(
      'SELECT * FROM initiatives WHERE business_brief_id = ? ORDER BY created_at DESC',
      [businessBriefId]
    );
    return results.map(row => this.mapInitiative(row));
  }

  public async getAllInitiatives(): Promise<Initiative[]> {
    const results = await db.execute<any>('SELECT * FROM initiatives ORDER BY created_at DESC');
    return results.map(row => this.mapInitiative(row));
  }

  public async updateInitiative(id: string, updates: Partial<Initiative>): Promise<Initiative> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE initiatives SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);
    
    const updated = await this.getInitiative(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated initiative');
    }
    
    return updated;
  }

  public async deleteInitiative(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM initiatives WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Features
  public async createFeature(feature: Partial<Feature>): Promise<Feature> {
    const query = `
      INSERT INTO features (
        id, initiative_id, title, description, business_value, acceptance_criteria,
        priority, status, assigned_to, story_points, workflow_stage, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      feature.id || `FEA-${Date.now().toString(36)}`,
      feature.initiativeId || '',
      feature.title || '',
      feature.description || '',
      feature.businessValue || null,
      feature.acceptanceCriteria || null,
      feature.priority || 'medium',
      feature.status || 'backlog',
      feature.assignedTo || null,
      feature.storyPoints || null,
      feature.workflowStage || 'planning',
      feature.completionPercentage || 0
    ];

    await db.execute(query, values);
    
    // Return the feature object directly instead of fetching it back
    return {
      id: feature.id || `FEA-${Date.now().toString(36)}`,
      initiativeId: feature.initiativeId || '',
      title: feature.title || '',
      description: feature.description || '',
      businessValue: feature.businessValue || null,
      acceptanceCriteria: feature.acceptanceCriteria || null,
      priority: feature.priority || 'medium',
      status: feature.status || 'backlog',
      assignedTo: feature.assignedTo || null,
      storyPoints: feature.storyPoints || null,
      workflowStage: feature.workflowStage || 'planning',
      completionPercentage: feature.completionPercentage || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public async getFeature(id: string): Promise<Feature | null> {
    const result = await db.execute<any>('SELECT * FROM features WHERE id = ?', [id]);
    return result.length > 0 ? this.mapFeature(result[0]) : null;
  }

  public async getFeaturesByInitiative(initiativeId: string): Promise<Feature[]> {
    const results = await db.execute<any>(
      'SELECT * FROM features WHERE initiative_id = ? ORDER BY created_at DESC',
      [initiativeId]
    );
    return results.map(row => this.mapFeature(row));
  }

  public async getAllFeatures(): Promise<Feature[]> {
    const results = await db.execute<any>('SELECT * FROM features ORDER BY created_at DESC');
    return results.map(row => this.mapFeature(row));
  }

  public async updateFeature(id: string, updates: Partial<Feature>): Promise<Feature> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE features SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);
    
    const updated = await this.getFeature(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated feature');
    }
    
    return updated;
  }

  public async deleteFeature(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM features WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Epics (following similar pattern)
  public async createEpic(epic: Partial<Epic>): Promise<Epic> {
    const query = `
      INSERT INTO epics (
        id, feature_id, title, description, business_value, acceptance_criteria,
        priority, status, assigned_to, story_points, workflow_stage, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      epic.id || `EPIC-${Date.now().toString(36)}`,
      epic.featureId || '',
      epic.title || '',
      epic.description || '',
      epic.businessValue || null,
      epic.acceptanceCriteria || null,
      epic.priority || 'medium',
      epic.status || 'backlog',
      epic.assignedTo || null,
      epic.storyPoints || null,
      epic.workflowStage || 'planning',
      epic.completionPercentage || 0
    ];

    await db.execute(query, values);
    
    // Return the epic object directly instead of fetching it back
    return {
      id: epic.id || `EPIC-${Date.now().toString(36)}`,
      featureId: epic.featureId || '',
      title: epic.title || '',
      description: epic.description || '',
      businessValue: epic.businessValue || null,
      acceptanceCriteria: epic.acceptanceCriteria || null,
      priority: epic.priority || 'medium',
      status: epic.status || 'backlog',
      assignedTo: epic.assignedTo || null,
      storyPoints: epic.storyPoints || null,
      workflowStage: epic.workflowStage || 'planning',
      completionPercentage: epic.completionPercentage || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public async getEpic(id: string): Promise<Epic | null> {
    const result = await db.execute<any>('SELECT * FROM epics WHERE id = ?', [id]);
    return result.length > 0 ? this.mapEpic(result[0]) : null;
  }

  public async getEpicsByFeature(featureId: string): Promise<Epic[]> {
    const results = await db.execute<any>(
      'SELECT * FROM epics WHERE feature_id = ? ORDER BY created_at DESC',
      [featureId]
    );
    return results.map(row => this.mapEpic(row));
  }

  public async getAllEpics(): Promise<Epic[]> {
    const results = await db.execute<any>('SELECT * FROM epics ORDER BY created_at DESC');
    return results.map(row => this.mapEpic(row));
  }

  public async updateEpic(id: string, updates: Partial<Epic>): Promise<Epic> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE epics SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);
    
    const updated = await this.getEpic(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated epic');
    }
    
    return updated;
  }

  public async deleteEpic(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM epics WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Stories
  public async createStory(story: Partial<Story>): Promise<Story> {
    const query = `
      INSERT INTO stories (
        id, epic_id, title, description, user_story, acceptance_criteria,
        priority, status, assigned_to, story_points, workflow_stage, completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      story.id || `STORY-${Date.now().toString(36)}`,
      story.epicId || '',
      story.title || '',
      story.description || '',
      story.userStory || null,
      story.acceptanceCriteria || null,
      story.priority || 'medium',
      story.status || 'backlog',
      story.assignedTo || null,
      story.storyPoints || null,
      story.workflowStage || 'planning',
      story.completionPercentage || 0
    ];

    await db.execute(query, values);
    
    // Return the story object directly instead of fetching it back
    return {
      id: story.id || `STORY-${Date.now().toString(36)}`,
      epicId: story.epicId || '',
      title: story.title || '',
      description: story.description || '',
      userStory: story.userStory || null,
      acceptanceCriteria: story.acceptanceCriteria || null,
      priority: story.priority || 'medium',
      status: story.status || 'backlog',
      assignedTo: story.assignedTo || null,
      storyPoints: story.storyPoints || null,
      workflowStage: story.workflowStage || 'planning',
      completionPercentage: story.completionPercentage || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  public async getStory(id: string): Promise<Story | null> {
    const result = await db.execute<any>('SELECT * FROM stories WHERE id = ?', [id]);
    return result.length > 0 ? this.mapStory(result[0]) : null;
  }

  public async getStoriesByEpic(epicId: string): Promise<Story[]> {
    const results = await db.execute<any>(
      'SELECT * FROM stories WHERE epic_id = ? ORDER BY created_at DESC',
      [epicId]
    );
    return results.map(row => this.mapStory(row));
  }

  public async getAllStories(): Promise<Story[]> {
    const results = await db.execute<any>('SELECT * FROM stories ORDER BY created_at DESC');
    return results.map(row => this.mapStory(row));
  }

  public async updateStory(id: string, updates: Partial<Story>): Promise<Story> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE stories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);
    
    const updated = await this.getStory(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated story');
    }
    
    return updated;
  }

  public async deleteStory(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM stories WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Test Cases
  public async createTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
    const query = `
      INSERT INTO test_cases (
        story_id, title, description, preconditions, steps, expected_results,
        actual_results, status, priority, test_type, automation_level, tags,
        assigned_to, executed_by, executed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      testCase.storyId || '',
      testCase.title || '',
      testCase.description || '',
      testCase.preconditions || null,
      testCase.steps || '',
      testCase.expectedResults || '',
      testCase.actualResults || null,
      testCase.status || 'draft',
      testCase.priority || 'medium',
      testCase.testType || 'system',
      testCase.automationLevel || 'manual',
      testCase.tags || null,
      testCase.assignedTo || null,
      testCase.executedBy || null,
      testCase.executedAt || null
    ];

    await db.execute(query, values);
    
    const created = await db.execute<any>(`
      SELECT * FROM test_cases 
      WHERE story_id = ? AND title = ? AND created_at = (
        SELECT MAX(created_at) FROM test_cases WHERE story_id = ? AND title = ?
      )
    `, [testCase.storyId, testCase.title, testCase.storyId, testCase.title]);

    return this.mapTestCase(created[0]);
  }

  public async getTestCase(id: string): Promise<TestCase | null> {
    const result = await db.execute<any>('SELECT * FROM test_cases WHERE id = ?', [id]);
    return result.length > 0 ? this.mapTestCase(result[0]) : null;
  }

  public async getTestCasesByStory(storyId: string): Promise<TestCase[]> {
    const results = await db.execute<any>(
      'SELECT * FROM test_cases WHERE story_id = ? ORDER BY created_at DESC',
      [storyId]
    );
    return results.map(row => this.mapTestCase(row));
  }

  public async getAllTestCases(): Promise<TestCase[]> {
    const results = await db.execute<any>('SELECT * FROM test_cases ORDER BY created_at DESC');
    return results.map(row => this.mapTestCase(row));
  }

  public async updateTestCase(id: string, updates: Partial<TestCase>): Promise<TestCase> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE test_cases SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);
    
    const updated = await this.getTestCase(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated test case');
    }
    
    return updated;
  }

  public async deleteTestCase(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM test_cases WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Documents
  public async createDocument(document: Partial<Document>): Promise<Document> {
    const query = `
      INSERT INTO documents (
        file_name, original_name, file_type, file_size, file_path,
        uploaded_by, processed, processed_at, extracted_text, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      document.fileName || '',
      document.originalName || '',
      document.fileType || '',
      document.fileSize || 0,
      document.filePath || '',
      document.uploadedBy || null,
      document.processed || false,
      document.processedAt || null,
      document.extractedText || null,
      document.metadata ? JSON.stringify(document.metadata) : null
    ];

    await db.execute(query, values);
    
    const created = await db.execute<any>(`
      SELECT * FROM documents 
      WHERE file_name = ? AND created_at = (SELECT MAX(uploaded_at) FROM documents WHERE file_name = ?)
    `, [document.fileName, document.fileName]);

    return this.mapDocument(created[0]);
  }

  public async getDocument(id: string): Promise<Document | null> {
    const result = await db.execute<any>('SELECT * FROM documents WHERE id = ?', [id]);
    return result.length > 0 ? this.mapDocument(result[0]) : null;
  }

  public async getAllDocuments(): Promise<Document[]> {
    const results = await db.execute<any>('SELECT * FROM documents ORDER BY uploaded_at DESC');
    return results.map(row => this.mapDocument(row));
  }

  public async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'uploadedAt') {
        if (key === 'metadata' && value) {
          fields.push(`metadata = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${this.camelToSnake(key)} = ?`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`;
    
    await db.execute(query, values);
    
    const updated = await this.getDocument(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated document');
    }
    
    return updated;
  }

  public async deleteDocument(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM documents WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // SAFe Mappings
  public async createSafeMapping(mapping: Partial<SafeMapping>): Promise<SafeMapping> {
    const query = `
      INSERT INTO safe_mappings (
        work_item_id, work_item_type, safe_stage, safe_level, safe_artifact,
        mapping_reason, confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        safe_stage = VALUES(safe_stage),
        safe_level = VALUES(safe_level),
        safe_artifact = VALUES(safe_artifact),
        mapping_reason = VALUES(mapping_reason),
        confidence = VALUES(confidence),
        updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      mapping.workItemId || '',
      mapping.workItemType || '',
      mapping.safeStage || '',
      mapping.safeLevel || 'essential',
      mapping.safeArtifact || null,
      mapping.mappingReason || null,
      mapping.confidence || 0.5
    ];

    await db.execute(query, values);
    
    const created = await this.getSafeMappingByWorkItem(mapping.workItemId!, mapping.workItemType!);
    if (!created) {
      throw new Error('Failed to retrieve created SAFe mapping');
    }
    
    return created;
  }

  public async getSafeMappingByWorkItem(workItemId: string, workItemType: string): Promise<SafeMapping | null> {
    const result = await db.execute<any>(
      'SELECT * FROM safe_mappings WHERE work_item_id = ? AND work_item_type = ?',
      [workItemId, workItemType]
    );
    return result.length > 0 ? this.mapSafeMapping(result[0]) : null;
  }

  public async getAllSafeMappings(): Promise<SafeMapping[]> {
    const results = await db.execute<any>('SELECT * FROM safe_mappings ORDER BY created_at DESC');
    return results.map(row => this.mapSafeMapping(row));
  }

  public async updateSafeMapping(id: string, updates: Partial<SafeMapping>): Promise<SafeMapping> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${this.camelToSnake(key)} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE safe_mappings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await db.execute(query, values);
    
    const result = await db.execute<any>('SELECT * FROM safe_mappings WHERE id = ?', [id]);
    return this.mapSafeMapping(result[0]);
  }

  public async deleteSafeMapping(id: string): Promise<boolean> {
    const result = await db.execute('DELETE FROM safe_mappings WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Hierarchy and relationships
  public async getWorkItemHierarchy(): Promise<any> {
    const query = `
      SELECT 
        bb.id as bb_id, bb.title as bb_title, bb.status as bb_status,
        i.id as i_id, i.title as i_title, i.status as i_status,
        f.id as f_id, f.title as f_title, f.status as f_status,
        e.id as e_id, e.title as e_title, e.status as e_status,
        s.id as s_id, s.title as s_title, s.status as s_status
      FROM business_briefs bb
      LEFT JOIN initiatives i ON bb.id = i.business_brief_id
      LEFT JOIN features f ON i.id = f.initiative_id
      LEFT JOIN epics e ON f.id = e.feature_id
      LEFT JOIN stories s ON e.id = s.epic_id
      ORDER BY bb.created_at DESC, i.created_at DESC, f.created_at DESC, e.created_at DESC, s.created_at DESC
    `;

    const results = await db.execute<any>(query);
    
    // Transform flat results into hierarchical structure
    const hierarchy: any = {};
    
    results.forEach(row => {
      const bbId = row.bb_id;
      
      if (!hierarchy[bbId]) {
        hierarchy[bbId] = {
          id: row.bb_id,
          title: row.bb_title,
          status: row.bb_status,
          type: 'business_brief',
          initiatives: {}
        };
      }
      
      if (row.i_id) {
        const iId = row.i_id;
        if (!hierarchy[bbId].initiatives[iId]) {
          hierarchy[bbId].initiatives[iId] = {
            id: row.i_id,
            title: row.i_title,
            status: row.i_status,
            type: 'initiative',
            features: {}
          };
        }
        
        if (row.f_id) {
          const fId = row.f_id;
          if (!hierarchy[bbId].initiatives[iId].features[fId]) {
            hierarchy[bbId].initiatives[iId].features[fId] = {
              id: row.f_id,
              title: row.f_title,
              status: row.f_status,
              type: 'feature',
              epics: {}
            };
          }
          
          if (row.e_id) {
            const eId = row.e_id;
            if (!hierarchy[bbId].initiatives[iId].features[fId].epics[eId]) {
              hierarchy[bbId].initiatives[iId].features[fId].epics[eId] = {
                id: row.e_id,
                title: row.e_title,
                status: row.e_status,
                type: 'epic',
                stories: {}
              };
            }
            
            if (row.s_id) {
              hierarchy[bbId].initiatives[iId].features[fId].epics[eId].stories[row.s_id] = {
                id: row.s_id,
                title: row.s_title,
                status: row.s_status,
                type: 'story'
              };
            }
          }
        }
      }
    });
    
    // Convert objects to arrays for easier iteration in UI
    return Object.values(hierarchy).map((bb: any) => ({
      ...bb,
      initiatives: Object.values(bb.initiatives).map((i: any) => ({
        ...i,
        features: Object.values(i.features).map((f: any) => ({
          ...f,
          epics: Object.values(f.epics).map((e: any) => ({
            ...e,
            stories: Object.values(e.stories)
          }))
        }))
      }))
    }));
  }

  public async getWorkItemsByType(type: string): Promise<any[]> {
    const tableMap: Record<string, string> = {
      'business_brief': 'business_briefs',
      'initiative': 'initiatives',
      'feature': 'features',
      'epic': 'epics',
      'story': 'stories',
      'test_case': 'test_cases'
    };

    const tableName = tableMap[type];
    if (!tableName) {
      throw new Error(`Invalid work item type: ${type}`);
    }

    const results = await db.execute<any>(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
    
    switch (type) {
      case 'business_brief':
        return results.map(row => this.mapBusinessBrief(row));
      case 'initiative':
        return results.map(row => this.mapInitiative(row));
      case 'feature':
        return results.map(row => this.mapFeature(row));
      case 'epic':
        return results.map(row => this.mapEpic(row));
      case 'story':
        return results.map(row => this.mapStory(row));
      case 'test_case':
        return results.map(row => this.mapTestCase(row));
      default:
        return results;
    }
  }

  // Helper methods for mapping database rows to objects
  private mapBusinessBrief(row: any): BusinessBrief {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      businessOwner: row.business_owner,
      leadBusinessUnit: row.lead_business_unit,
      additionalBusinessUnits: row.additional_business_units,
      primaryStrategicTheme: row.primary_strategic_theme,
      businessObjective: row.business_objective,
      quantifiableBusinessOutcomes: row.quantifiable_business_outcomes,
      inScope: row.in_scope,
      impactOfDoNothing: row.impact_of_do_nothing,
      happyPath: row.happy_path,
      exceptions: row.exceptions,
      impactedEndUsers: row.impacted_end_users,
      changeImpactExpected: row.change_impact_expected,
      impactToOtherDepartments: row.impact_to_other_departments,
      otherDepartmentsImpacted: row.other_departments_impacted,
      impactsExistingTechnology: row.impacts_existing_technology,
      technologySolutions: row.technology_solutions,
      relevantBusinessOwners: row.relevant_business_owners,
      otherTechnologyInfo: row.other_technology_info,
      supportingDocuments: row.supporting_documents,
      submittedBy: row.submitted_by,
      submittedAt: row.submitted_at,
      status: row.status,
      priority: row.priority,
      workflowStage: row.workflow_stage,
      completionPercentage: row.completion_percentage,
      // qualityAssessment: row.quality_assessment ? JSON.parse(row.quality_assessment) : undefined, // TODO: Uncomment after migration
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapInitiative(row: any): Initiative {
    return {
      id: row.id,
      businessBriefId: row.business_brief_id,
      title: row.title,
      description: row.description,
      businessValue: row.business_value,
      acceptanceCriteria: row.acceptance_criteria,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      estimatedValue: row.estimated_value,
      workflowStage: row.workflow_stage,
      completionPercentage: row.completion_percentage,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapFeature(row: any): Feature {
    return {
      id: row.id,
      initiativeId: row.initiative_id,
      title: row.title,
      description: row.description,
      businessValue: row.business_value,
      acceptanceCriteria: row.acceptance_criteria,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      storyPoints: row.story_points,
      workflowStage: row.workflow_stage,
      completionPercentage: row.completion_percentage,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapEpic(row: any): Epic {
    return {
      id: row.id,
      featureId: row.feature_id,
      title: row.title,
      description: row.description,
      businessValue: row.business_value,
      acceptanceCriteria: row.acceptance_criteria,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      storyPoints: row.story_points,
      workflowStage: row.workflow_stage,
      completionPercentage: row.completion_percentage,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapStory(row: any): Story {
    return {
      id: row.id,
      epicId: row.epic_id,
      title: row.title,
      description: row.description,
      userStory: row.user_story,
      acceptanceCriteria: row.acceptance_criteria,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      storyPoints: row.story_points,
      workflowStage: row.workflow_stage,
      completionPercentage: row.completion_percentage,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapTestCase(row: any): TestCase {
    return {
      id: row.id,
      storyId: row.story_id,
      title: row.title,
      description: row.description,
      preconditions: row.preconditions,
      steps: row.steps,
      expectedResults: row.expected_results,
      actualResults: row.actual_results,
      status: row.status,
      priority: row.priority,
      testType: row.test_type,
      automationLevel: row.automation_level,
      tags: row.tags,
      assignedTo: row.assigned_to,
      executedBy: row.executed_by,
      executedAt: row.executed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapDocument(row: any): Document {
    return {
      id: row.id,
      fileName: row.file_name,
      originalName: row.original_name,
      fileType: row.file_type,
      fileSize: row.file_size,
      filePath: row.file_path,
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at,
      processed: row.processed,
      processedAt: row.processed_at,
      extractedText: row.extracted_text,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    };
  }

  private mapSafeMapping(row: any): SafeMapping {
    return {
      id: row.id,
      workItemId: row.work_item_id,
      workItemType: row.work_item_type,
      safeStage: row.safe_stage,
      safeLevel: row.safe_level,
      safeArtifact: row.safe_artifact,
      mappingReason: row.mapping_reason,
      confidence: row.confidence,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Utility function to convert camelCase to snake_case
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

// Export singleton instance
export const databaseService = AuraDatabaseService.getInstance();

