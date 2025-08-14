// Database schema definitions for Aura's SDLC workflow
import { db } from './connection';

export interface BusinessBrief {
  id: string;
  title: string;
  description: string;
  businessOwner?: string;
  leadBusinessUnit?: string;
  additionalBusinessUnits?: string;
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
  otherDepartmentsImpacted?: string;
  impactsExistingTechnology?: boolean;
  technologySolutions?: string;
  relevantBusinessOwners?: string;
  otherTechnologyInfo?: string;
  supportingDocuments?: string;
  submittedBy?: string;
  submittedAt?: Date;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  workflowStage: 'idea' | 'discovery' | 'design' | 'execution';
  completionPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Initiative {
  id: string;
  businessBriefId: string;
  title: string;
  description: string;
  businessValue?: string;
  acceptanceCriteria?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'planning' | 'in_progress' | 'done' | 'cancelled';
  assignedTo?: string;
  estimatedValue?: number;
  workflowStage: 'planning' | 'development' | 'testing' | 'done';
  completionPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Feature {
  id: string;
  initiativeId: string;
  title: string;
  description: string;
  businessValue?: string;
  acceptanceCriteria?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'planning' | 'in_progress' | 'done' | 'cancelled';
  assignedTo?: string;
  storyPoints?: number;
  workflowStage: 'planning' | 'development' | 'testing' | 'done';
  completionPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Epic {
  id: string;
  featureId: string;
  title: string;
  description: string;
  businessValue?: string;
  acceptanceCriteria?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'planning' | 'in_progress' | 'done' | 'cancelled';
  assignedTo?: string;
  storyPoints?: number;
  workflowStage: 'planning' | 'development' | 'testing' | 'done';
  completionPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Story {
  id: string;
  epicId: string;
  title: string;
  description: string;
  userStory?: string;
  acceptanceCriteria?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'planning' | 'in_progress' | 'done' | 'cancelled';
  assignedTo?: string;
  storyPoints?: number;
  workflowStage: 'planning' | 'development' | 'testing' | 'done';
  completionPercentage?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TestCase {
  id: string;
  storyId: string;
  title: string;
  description: string;
  preconditions?: string;
  steps: string;
  expectedResults: string;
  actualResults?: string;
  status: 'draft' | 'ready' | 'executing' | 'passed' | 'failed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  testType: 'unit' | 'integration' | 'system' | 'acceptance' | 'performance' | 'security';
  automationLevel: 'manual' | 'semi-automated' | 'automated';
  tags?: string;
  assignedTo?: string;
  executedBy?: string;
  executedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedBy?: string;
  uploadedAt: Date;
  processed: boolean;
  processedAt?: Date;
  extractedText?: string;
  metadata?: string;
}

export interface SafeMapping {
  id: string;
  workItemId: string;
  workItemType: 'business_brief' | 'initiative' | 'feature' | 'epic' | 'story';
  safeStage: string;
  safeLevel: 'portfolio' | 'large_solution' | 'essential' | 'team';
  safeArtifact?: string;
  mappingReason?: string;
  confidence?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DatabaseSchema {
  public static async initializeSchema(): Promise<void> {
    console.log('🔄 Initializing Aura database schema...');
    
    try {
      // Create database if it doesn't exist
      await db.createDatabase('aura_sdlc');
      
      // Create tables in dependency order
      await this.createBusinessBriefsTable();
      await this.createInitiativesTable();
      await this.createFeaturesTable();
      await this.createEpicsTable();
      await this.createStoriesTable();
      await this.createTestCasesTable();
      await this.createDocumentsTable();
      await this.createSafeMappingsTable();
      
      console.log('✅ Aura database schema initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize database schema:', error);
      throw error;
    }
  }

  private static async createBusinessBriefsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS business_briefs (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        business_owner VARCHAR(255),
        lead_business_unit VARCHAR(255),
        additional_business_units TEXT,
        primary_strategic_theme VARCHAR(255),
        business_objective TEXT,
        quantifiable_business_outcomes TEXT,
        in_scope TEXT,
        impact_of_do_nothing TEXT,
        happy_path TEXT,
        exceptions TEXT,
        impacted_end_users TEXT,
        change_impact_expected TEXT,
        impact_to_other_departments TEXT,
        other_departments_impacted TEXT,
        impacts_existing_technology BOOLEAN DEFAULT FALSE,
        technology_solutions TEXT,
        relevant_business_owners TEXT,
        other_technology_info TEXT,
        supporting_documents TEXT,
        submitted_by VARCHAR(255),
        submitted_at TIMESTAMP NULL,
        status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        workflow_stage ENUM('idea', 'discovery', 'design', 'execution') DEFAULT 'idea',
        completion_percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_workflow_stage (workflow_stage),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created business_briefs table');
  }

  private static async createInitiativesTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS initiatives (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        business_brief_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        business_value TEXT,
        acceptance_criteria TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
        assigned_to VARCHAR(255),
        estimated_value DECIMAL(15,2),
        workflow_stage ENUM('planning', 'development', 'testing', 'done') DEFAULT 'planning',
        completion_percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE,
        INDEX idx_business_brief_id (business_brief_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_workflow_stage (workflow_stage)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created initiatives table');
  }

  private static async createFeaturesTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS features (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        initiative_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        business_value TEXT,
        acceptance_criteria TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
        assigned_to VARCHAR(255),
        story_points INT,
        workflow_stage ENUM('planning', 'development', 'testing', 'done') DEFAULT 'planning',
        completion_percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE,
        INDEX idx_initiative_id (initiative_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_workflow_stage (workflow_stage)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created features table');
  }

  private static async createEpicsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS epics (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        feature_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        business_value TEXT,
        acceptance_criteria TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
        assigned_to VARCHAR(255),
        story_points INT,
        workflow_stage ENUM('planning', 'development', 'testing', 'done') DEFAULT 'planning',
        completion_percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE,
        INDEX idx_feature_id (feature_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_workflow_stage (workflow_stage)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created epics table');
  }

  private static async createStoriesTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS stories (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        epic_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        user_story TEXT,
        acceptance_criteria TEXT,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
        assigned_to VARCHAR(255),
        story_points INT,
        workflow_stage ENUM('planning', 'development', 'testing', 'done') DEFAULT 'planning',
        completion_percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE,
        INDEX idx_epic_id (epic_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_workflow_stage (workflow_stage)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created stories table');
  }

  private static async createTestCasesTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS test_cases (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        story_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        preconditions TEXT,
        steps TEXT NOT NULL,
        expected_results TEXT NOT NULL,
        actual_results TEXT,
        status ENUM('draft', 'ready', 'executing', 'passed', 'failed', 'blocked') DEFAULT 'draft',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        test_type ENUM('unit', 'integration', 'system', 'acceptance', 'performance', 'security') DEFAULT 'system',
        automation_level ENUM('manual', 'semi-automated', 'automated') DEFAULT 'manual',
        tags TEXT,
        assigned_to VARCHAR(255),
        executed_by VARCHAR(255),
        executed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
        INDEX idx_story_id (story_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_test_type (test_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created test_cases table');
  }

  private static async createDocumentsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size BIGINT NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        uploaded_by VARCHAR(255),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT FALSE,
        processed_at TIMESTAMP NULL,
        extracted_text LONGTEXT,
        metadata JSON,
        
        INDEX idx_file_type (file_type),
        INDEX idx_processed (processed),
        INDEX idx_uploaded_at (uploaded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created documents table');
  }

  private static async createSafeMappingsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS safe_mappings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        work_item_id VARCHAR(36) NOT NULL,
        work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story') NOT NULL,
        safe_stage VARCHAR(255) NOT NULL,
        safe_level ENUM('portfolio', 'large_solution', 'essential', 'team') NOT NULL,
        safe_artifact VARCHAR(255),
        mapping_reason TEXT,
        confidence DECIMAL(3,2) DEFAULT 0.50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_work_item (work_item_id, work_item_type),
        INDEX idx_safe_stage (safe_stage),
        INDEX idx_safe_level (safe_level),
        UNIQUE KEY unique_work_item_mapping (work_item_id, work_item_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.execute(query);
    console.log('✅ Created safe_mappings table');
  }
}

