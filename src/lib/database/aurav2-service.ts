// AuraV2 Database Service
import { db } from './connection';
import { databaseService } from './service';
import { APP_CONFIG, AppRole, WorkflowType, WorkflowStage } from '@/lib/config/app-config';

export interface AuraV2WorkflowStage {
  id: string;
  name: string;
  description: string;
  icon: string;
  stageOrder: number;
  workflowType: 'new_system' | 'enhancement' | 'both';
  definitionOfReady: string[];
  keyPlayers: Array<{role: string; name: string}>;
  definitionOfDone: string[];
  activities: Array<{owner: string; activity: string}>;
  referenceDocuments: string[];
  aiConsolidationEnabled: boolean;
}

export interface AuraV2WorkflowProgress {
  id: string;
  businessBriefId: string;
  workflowType: WorkflowType;
  currentStageId: string;
  stageCompletion: Record<string, boolean>;
  stageHistory: Array<{stage: string; timestamp: string; user: string}>;
  aiRecommendations: any[];
  consolidationData: any;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuraV2BusinessBriefExtension {
  id: string;
  businessBriefId: string;
  workflowType?: WorkflowType;
  estimationSize?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
  estimationConfidence?: 'bronze' | 'silver' | 'gold';
  buildOrBuyDecision?: 'build' | 'buy' | 'enhance' | 'pending';
  rfiData?: any;
  capacityPlanning?: any;
  discoveryFindings?: any;
  qualityScore?: number;
  aiAnalysis?: any;
  stakeholderAlignment?: any;
  appliedRecommendations?: Array<{
    recommendation: string;
    appliedAt: string;
    appliedBy: string;
  }>;
}

export interface AuraV2UserRole {
  id: string;
  userId: string;
  email?: string;
  name?: string;
  role: AppRole;
  department?: string;
  isActive: boolean;
}

class AuraV2Service {

  // =============================================
  // Workflow Stages Management
  // =============================================

  async getWorkflowStages(workflowType?: WorkflowType): Promise<AuraV2WorkflowStage[]> {
    try {
      let query = `
        SELECT 
          id, name, description, icon, stage_order as stageOrder,
          workflow_type as workflowType, definition_of_ready as definitionOfReady,
          key_players as keyPlayers, definition_of_done as definitionOfDone,
          activities, reference_documents as referenceDocuments,
          ai_consolidation_enabled as aiConsolidationEnabled
        FROM aurav2_workflow_stages
      `;
      
      const params: any[] = [];
      if (workflowType) {
        query += ' WHERE workflow_type = ? OR workflow_type = "both"';
        params.push(workflowType);
      }
      
      query += ' ORDER BY stage_order ASC';

      const stages = await db.execute(query, params) as any[];
      return stages.map(stage => ({
        ...stage,
        definitionOfReady: JSON.parse(stage.definitionOfReady || '[]'),
        keyPlayers: JSON.parse(stage.keyPlayers || '[]'),
        definitionOfDone: JSON.parse(stage.definitionOfDone || '[]'),
        activities: JSON.parse(stage.activities || '[]'),
        referenceDocuments: JSON.parse(stage.referenceDocuments || '[]')
      }));
    } catch (error) {
      console.error('❌ Failed to get workflow stages:', error);
      throw error;
    }
  }

  async getWorkflowStage(stageId: string): Promise<AuraV2WorkflowStage | null> {
    try {
      const query = `
        SELECT 
          id, name, description, icon, stage_order as stageOrder,
          workflow_type as workflowType, definition_of_ready as definitionOfReady,
          key_players as keyPlayers, definition_of_done as definitionOfDone,
          activities, reference_documents as referenceDocuments,
          ai_consolidation_enabled as aiConsolidationEnabled
        FROM aurav2_workflow_stages
        WHERE id = ?
      `;

      const stages = await db.execute(query, [stageId]) as any[];
      if (stages.length === 0) return null;

      const stage = stages[0];
      return {
        ...stage,
        definitionOfReady: JSON.parse(stage.definitionOfReady || '[]'),
        keyPlayers: JSON.parse(stage.keyPlayers || '[]'),
        definitionOfDone: JSON.parse(stage.definitionOfDone || '[]'),
        activities: JSON.parse(stage.activities || '[]'),
        referenceDocuments: JSON.parse(stage.referenceDocuments || '[]')
      };
    } catch (error) {
      console.error('❌ Failed to get workflow stage:', error);
      throw error;
    }
  }

  // =============================================
  // Workflow Progress Management
  // =============================================

  async initializeWorkflowProgress(businessBriefId: string, workflowType: WorkflowType): Promise<AuraV2WorkflowProgress> {
    try {
      const firstStage = await this.getFirstStageForWorkflow(workflowType);
      if (!firstStage) {
        throw new Error(`No stages found for workflow type: ${workflowType}`);
      }

      const progressId = `WP-${Date.now().toString(36).toUpperCase()}`;
      const progressData = {
        id: progressId,
        business_brief_id: businessBriefId,
        workflow_type: workflowType,
        current_stage_id: firstStage.id,
        stage_completion: JSON.stringify({}),
        stage_history: JSON.stringify([{
          stage: firstStage.id,
          timestamp: new Date().toISOString(),
          user: 'system',
          action: 'initialized'
        }]),
        ai_recommendations: JSON.stringify([]),
        consolidation_data: JSON.stringify({})
      };

      await db.execute(`
        INSERT INTO aurav2_workflow_progress 
        (id, business_brief_id, workflow_type, current_stage_id, stage_completion, stage_history, ai_recommendations, consolidation_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        progressData.id,
        progressData.business_brief_id,
        progressData.workflow_type,
        progressData.current_stage_id,
        progressData.stage_completion,
        progressData.stage_history,
        progressData.ai_recommendations,
        progressData.consolidation_data
      ]);

      return await this.getWorkflowProgress(businessBriefId) as AuraV2WorkflowProgress;
    } catch (error) {
      console.error('❌ Failed to initialize workflow progress:', error);
      throw error;
    }
  }

  async getWorkflowProgress(businessBriefId: string): Promise<AuraV2WorkflowProgress | null> {
    try {
      const query = `
        SELECT 
          id, business_brief_id as businessBriefId, workflow_type as workflowType,
          current_stage_id as currentStageId, stage_completion as stageCompletion,
          stage_history as stageHistory, ai_recommendations as aiRecommendations,
          consolidation_data as consolidationData, estimated_completion_date as estimatedCompletionDate,
          actual_completion_date as actualCompletionDate, created_at as createdAt, updated_at as updatedAt
        FROM aurav2_workflow_progress
        WHERE business_brief_id = ?
      `;

      const results = await db.execute(query, [businessBriefId]) as any[];
      if (results.length === 0) return null;

      const progress = results[0];
      return {
        ...progress,
        stageCompletion: JSON.parse(progress.stageCompletion || '{}'),
        stageHistory: JSON.parse(progress.stageHistory || '[]'),
        aiRecommendations: JSON.parse(progress.aiRecommendations || '[]'),
        consolidationData: JSON.parse(progress.consolidationData || '{}')
      };
    } catch (error) {
      console.error('❌ Failed to get workflow progress:', error);
      throw error;
    }
  }

  async updateStageCompletion(businessBriefId: string, stageId: string, completionData: Record<string, boolean>, userId: string = 'system'): Promise<void> {
    try {
      const progress = await this.getWorkflowProgress(businessBriefId);
      if (!progress) {
        throw new Error('Workflow progress not found');
      }

      const updatedCompletion = { ...progress.stageCompletion, [stageId]: completionData };
      const updatedHistory = [...progress.stageHistory, {
        stage: stageId,
        timestamp: new Date().toISOString(),
        user: userId,
        action: 'updated_completion'
      }];

      await db.execute(`
        UPDATE aurav2_workflow_progress
        SET stage_completion = ?, stage_history = ?, updated_at = CURRENT_TIMESTAMP
        WHERE business_brief_id = ?
      `, [
        JSON.stringify(updatedCompletion),
        JSON.stringify(updatedHistory),
        businessBriefId
      ]);
    } catch (error) {
      console.error('❌ Failed to update stage completion:', error);
      throw error;
    }
  }

  // =============================================
  // Business Brief Extensions
  // =============================================

  async createBusinessBriefExtension(extensionData: Omit<AuraV2BusinessBriefExtension, 'id'>): Promise<AuraV2BusinessBriefExtension> {
    try {
      const extensionId = `BBE-${Date.now().toString(36).toUpperCase()}`;
      
      await db.execute(`
        INSERT INTO aurav2_business_brief_extensions
        (id, business_brief_id, workflow_type, estimation_size, estimation_confidence,
         build_or_buy_decision, rfi_data, capacity_planning, discovery_findings,
         quality_score, ai_analysis, stakeholder_alignment, applied_recommendations)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        extensionId,
        extensionData.businessBriefId,
        extensionData.workflowType || null,
        extensionData.estimationSize || null,
        extensionData.estimationConfidence || null,
        extensionData.buildOrBuyDecision || 'pending',
        JSON.stringify(extensionData.rfiData || {}),
        JSON.stringify(extensionData.capacityPlanning || {}),
        JSON.stringify(extensionData.discoveryFindings || {}),
        extensionData.qualityScore || null,
        JSON.stringify(extensionData.aiAnalysis || {}),
        JSON.stringify(extensionData.stakeholderAlignment || {}),
        JSON.stringify(extensionData.appliedRecommendations || [])
      ]);

      return await this.getBusinessBriefExtension(extensionData.businessBriefId) as AuraV2BusinessBriefExtension;
    } catch (error) {
      console.error('❌ Failed to create business brief extension:', error);
      throw error;
    }
  }

  async getBusinessBriefExtension(businessBriefId: string): Promise<AuraV2BusinessBriefExtension | null> {
    try {
      const query = `
        SELECT 
          id, business_brief_id as businessBriefId, workflow_type as workflowType,
          estimation_size as estimationSize, estimation_confidence as estimationConfidence,
          build_or_buy_decision as buildOrBuyDecision, rfi_data as rfiData,
          capacity_planning as capacityPlanning, discovery_findings as discoveryFindings,
          quality_score as qualityScore, ai_analysis as aiAnalysis,
          stakeholder_alignment as stakeholderAlignment, applied_recommendations as appliedRecommendations
        FROM aurav2_business_brief_extensions
        WHERE business_brief_id = ?
      `;

      const results = await db.execute(query, [businessBriefId]) as any[];
      if (results.length === 0) return null;

      const extension = results[0];
      return {
        ...extension,
        rfiData: JSON.parse(extension.rfiData || '{}'),
        capacityPlanning: JSON.parse(extension.capacityPlanning || '{}'),
        discoveryFindings: JSON.parse(extension.discoveryFindings || '{}'),
        aiAnalysis: JSON.parse(extension.aiAnalysis || '{}'),
        stakeholderAlignment: JSON.parse(extension.stakeholderAlignment || '{}'),
        appliedRecommendations: JSON.parse(extension.appliedRecommendations || '[]')
      };
    } catch (error) {
      console.error('❌ Failed to get business brief extension:', error);
      throw error;
    }
  }

  async updateBusinessBriefExtension(businessBriefId: string, updateData: Partial<AuraV2BusinessBriefExtension>): Promise<AuraV2BusinessBriefExtension> {
    try {
      console.log('🔄 Updating business brief extension for:', businessBriefId);
      
      // Get current extension to merge with updates
      const currentExtension = await this.getBusinessBriefExtension(businessBriefId);
      if (!currentExtension) {
        throw new Error('Business brief extension not found');
      }

      // Build dynamic update query based on provided fields
      const updateFields = [];
      const updateValues = [];

      if (updateData.workflowType !== undefined) {
        updateFields.push('workflow_type = ?');
        updateValues.push(updateData.workflowType);
      }

      if (updateData.estimationSize !== undefined) {
        updateFields.push('estimation_size = ?');
        updateValues.push(updateData.estimationSize);
      }

      if (updateData.estimationConfidence !== undefined) {
        updateFields.push('estimation_confidence = ?');
        updateValues.push(updateData.estimationConfidence);
      }

      if (updateData.buildOrBuyDecision !== undefined) {
        updateFields.push('build_or_buy_decision = ?');
        updateValues.push(updateData.buildOrBuyDecision);
      }

      if (updateData.rfiData !== undefined) {
        updateFields.push('rfi_data = ?');
        updateValues.push(JSON.stringify(updateData.rfiData));
      }

      if (updateData.capacityPlanning !== undefined) {
        updateFields.push('capacity_planning = ?');
        updateValues.push(JSON.stringify(updateData.capacityPlanning));
      }

      if (updateData.discoveryFindings !== undefined) {
        updateFields.push('discovery_findings = ?');
        updateValues.push(JSON.stringify(updateData.discoveryFindings));
      }

      if (updateData.qualityScore !== undefined) {
        updateFields.push('quality_score = ?');
        updateValues.push(updateData.qualityScore);
      }

      if (updateData.aiAnalysis !== undefined) {
        updateFields.push('ai_analysis = ?');
        updateValues.push(JSON.stringify(updateData.aiAnalysis));
      }

      if (updateData.stakeholderAlignment !== undefined) {
        updateFields.push('stakeholder_alignment = ?');
        updateValues.push(JSON.stringify(updateData.stakeholderAlignment));
      }

      if (updateData.appliedRecommendations !== undefined) {
        updateFields.push('applied_recommendations = ?');
        updateValues.push(JSON.stringify(updateData.appliedRecommendations));
      }

      // Always update the timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(businessBriefId); // For WHERE clause

      if (updateFields.length === 1) { // Only timestamp was added
        console.log('⚠️ No fields to update');
        return currentExtension;
      }

      // Execute update
      const query = `
        UPDATE aurav2_business_brief_extensions 
        SET ${updateFields.join(', ')}
        WHERE business_brief_id = ?
      `;

      await db.execute(query, updateValues);

      console.log('✅ Business brief extension updated successfully');
      
      // Return updated extension
      return await this.getBusinessBriefExtension(businessBriefId) as AuraV2BusinessBriefExtension;
      
    } catch (error) {
      console.error('❌ Failed to update business brief extension:', error);
      throw error;
    }
  }

  async deleteBusinessBriefExtension(businessBriefId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting business brief extension for:', businessBriefId);
      
      const result = await db.execute(`
        DELETE FROM aurav2_business_brief_extensions 
        WHERE business_brief_id = ?
      `, [businessBriefId]);

      console.log('✅ Business brief extension deleted successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to delete business brief extension:', error);
      throw error;
    }
  }

  // =============================================
  // User Role Management
  // =============================================

  async getUserRoles(userId: string): Promise<AuraV2UserRole[]> {
    try {
      const query = `
        SELECT id, user_id as userId, email, name, role, department, is_active as isActive
        FROM aurav2_user_roles
        WHERE user_id = ? AND is_active = TRUE
      `;

      const roles = await db.execute(query, [userId]) as any[];
      return roles;
    } catch (error) {
      console.error('❌ Failed to get user roles:', error);
      throw error;
    }
  }

  async hasStageAccess(userId: string, stageId: string): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId);
      if (userRoles.length === 0) return false;

      // Check if any of the user's roles have access to this stage
      return userRoles.some(userRole => 
        APP_CONFIG.STAGE_ACCESS[stageId as WorkflowStage]?.includes(userRole.role)
      );
    } catch (error) {
      console.error('❌ Failed to check stage access:', error);
      return false;
    }
  }

  // =============================================
  // Helper Methods
  // =============================================

  private async getFirstStageForWorkflow(workflowType: WorkflowType): Promise<AuraV2WorkflowStage | null> {
    const stages = await this.getWorkflowStages(workflowType);
    return stages.find(stage => stage.stageOrder === 1) || null;
  }

  // =============================================
  // AI Integration Methods
  // =============================================

  async assessBusinessBriefQuality(businessBriefId: string): Promise<any> {
    try {
      console.log('🤖 Starting AI quality assessment for business brief:', businessBriefId);

      // Get the business brief data
      const businessBrief = await databaseService.getBusinessBrief(businessBriefId);
      if (!businessBrief) {
        throw new Error('Business brief not found');
      }

      // Prepare assessment criteria
      const assessmentCriteria = {
        clarity: {
          description: "How clear and well-defined is the business brief?",
          weight: 0.25,
          score: 0,
          feedback: ""
        },
        completeness: {
          description: "Are all required fields and information provided?",
          weight: 0.20,
          score: 0,
          feedback: ""
        },
        businessValue: {
          description: "Is the business value clearly articulated and quantifiable?",
          weight: 0.20,
          score: 0,
          feedback: ""
        },
        feasibility: {
          description: "How feasible is the proposed solution?",
          weight: 0.15,
          score: 0,
          feedback: ""
        },
        riskAssessment: {
          description: "Are risks and mitigation strategies identified?",
          weight: 0.10,
          score: 0,
          feedback: ""
        },
        alignment: {
          description: "How well does this align with strategic objectives?",
          weight: 0.10,
          score: 0,
          feedback: ""
        }
      };

      // AI-powered assessment (simplified version - can be enhanced with actual LLM)
      const assessment = await this.performQualityAssessment(businessBrief, assessmentCriteria);

      // Calculate overall quality score
      const overallScore = Object.values(assessment.criteria).reduce(
        (total, criterion: any) => total + (criterion.score * criterion.weight), 0
      );

      const qualityAssessment = {
        id: `QA-${Date.now().toString(36).toUpperCase()}`,
        businessBriefId,
        overallScore: Math.round(overallScore * 100) / 100,
        criteria: assessment.criteria,
        recommendations: assessment.recommendations,
        requiredActions: assessment.requiredActions,
        estimatedQualityLevel: this.getQualityLevel(overallScore),
        assessedAt: new Date().toISOString(),
        assessedBy: 'AI_SYSTEM'
      };

      // Store the assessment result
      await this.saveQualityAssessment(qualityAssessment);

      console.log('✅ AI quality assessment completed:', {
        overallScore: qualityAssessment.overallScore,
        qualityLevel: qualityAssessment.estimatedQualityLevel
      });

      return qualityAssessment;

    } catch (error) {
      console.error('❌ Failed to assess business brief quality:', error);
      throw error;
    }
  }

  private async performQualityAssessment(businessBrief: any, criteria: any): Promise<any> {
    // Enhanced AI assessment logic with comprehensive business brief evaluation
    const assessment = { criteria: { ...criteria }, recommendations: [], requiredActions: [] };

    console.log('🤖 Performing detailed AI quality assessment...');

    // 1. Clarity Assessment - Enhanced with business writing standards
    const titleLength = businessBrief.title?.length || 0;
    const descriptionLength = businessBrief.description?.length || 0;
    const title = businessBrief.title?.toLowerCase() || '';
    const description = businessBrief.description?.toLowerCase() || '';
    
    let clarityScore = 0;
    let clarityFeedback = [];

    // Title analysis
    if (titleLength >= 10 && titleLength <= 100) {
      clarityScore += 0.3;
      clarityFeedback.push("Title length is appropriate");
    } else {
      clarityFeedback.push("Title should be 10-100 characters for optimal clarity");
    }

    // Description analysis
    if (descriptionLength >= 100 && descriptionLength <= 500) {
      clarityScore += 0.3;
      clarityFeedback.push("Description is well-detailed");
    } else if (descriptionLength >= 50) {
      clarityScore += 0.2;
      clarityFeedback.push("Description is adequate but could be more detailed");
    } else {
      clarityFeedback.push("Description should be at least 50 characters with clear business context");
    }

    // Business terminology check
    const businessKeywords = ['business', 'customer', 'revenue', 'efficiency', 'cost', 'process', 'value', 'strategy', 'objective'];
    const foundKeywords = businessKeywords.filter(keyword => 
      title.includes(keyword) || description.includes(keyword)
    ).length;
    
    if (foundKeywords >= 3) {
      clarityScore += 0.4;
      clarityFeedback.push("Uses appropriate business terminology");
    } else {
      clarityScore += 0.2;
      clarityFeedback.push("Consider using more specific business terminology");
    }

    assessment.criteria.clarity.score = Math.min(clarityScore, 1.0);
    assessment.criteria.clarity.feedback = clarityFeedback.join('. ') + '.';

    if (clarityScore < 0.6) {
      assessment.requiredActions.push("Improve title and description clarity with better business context");
    }

    // 2. Completeness Assessment - Enhanced field analysis
    const coreFields = ['title', 'description', 'businessOwner'];
    const businessFields = ['businessObjective', 'quantifiableBusinessOutcomes', 'primaryStrategicTheme'];
    const scopeFields = ['inScope', 'outOfScope', 'impactOfDoNothing'];
    
    const coreCompleted = coreFields.filter(field => businessBrief[field]?.trim()).length;
    const businessCompleted = businessFields.filter(field => businessBrief[field]?.trim()).length;
    const scopeCompleted = scopeFields.filter(field => businessBrief[field]?.trim()).length;
    
    let completenessScore = 0;
    let completenessFeedback = [];

    // Core fields (must have)
    if (coreCompleted === coreFields.length) {
      completenessScore += 0.4;
      completenessFeedback.push("Core information is complete");
    } else {
      completenessFeedback.push(`Missing ${coreFields.length - coreCompleted} core field(s)`);
      assessment.requiredActions.push("Complete all core fields: title, description, business owner");
    }

    // Business fields (important)
    if (businessCompleted >= 2) {
      completenessScore += 0.4;
      completenessFeedback.push("Business context is well documented");
    } else {
      completenessScore += 0.2;
      completenessFeedback.push("Business context could be more comprehensive");
      assessment.recommendations.push("Add business objectives and strategic alignment details");
    }

    // Scope fields (valuable)
    if (scopeCompleted >= 2) {
      completenessScore += 0.2;
      completenessFeedback.push("Scope boundaries are defined");
    } else {
      completenessFeedback.push("Consider defining scope boundaries more clearly");
    }

    assessment.criteria.completeness.score = completenessScore;
    assessment.criteria.completeness.feedback = completenessFeedback.join('. ') + '.';

    // 3. Business Value Assessment - Enhanced value identification
    let businessValueScore = 0;
    let businessValueFeedback = [];

    // Check for quantifiable outcomes
    const outcomes = businessBrief.quantifiableBusinessOutcomes || '';
    const hasNumbers = /\d+/.test(outcomes);
    const hasPercentages = /%/.test(outcomes);
    const hasCurrency = /\$|revenue|cost|saving/i.test(outcomes);
    const hasKPIs = /kpi|metric|measure|target/i.test(outcomes);

    if (outcomes.length > 50) {
      businessValueScore += 0.3;
      businessValueFeedback.push("Business outcomes are documented");
      
      if (hasNumbers) {
        businessValueScore += 0.2;
        businessValueFeedback.push("Includes quantitative metrics");
      }
      
      if (hasPercentages || hasCurrency) {
        businessValueScore += 0.2;
        businessValueFeedback.push("Contains specific financial or percentage targets");
      }
      
      if (hasKPIs) {
        businessValueScore += 0.2;
        businessValueFeedback.push("References measurable KPIs");
      }
    } else {
      businessValueFeedback.push("Business value needs better quantification");
      assessment.recommendations.push("Add specific KPIs, cost savings, revenue targets, and measurable outcomes");
    }

    // Check business objective quality
    const objective = businessBrief.businessObjective || '';
    if (objective.length > 30) {
      businessValueScore += 0.1;
      businessValueFeedback.push("Business objective is stated");
    }

    assessment.criteria.businessValue.score = Math.min(businessValueScore, 1.0);
    assessment.criteria.businessValue.feedback = businessValueFeedback.join('. ') + '.';

    // 4. Feasibility Assessment - Enhanced with complexity indicators
    let feasibilityScore = 0.5; // Base score
    let feasibilityFeedback = [];

    // Check if technology solutions are mentioned
    const techSolutions = businessBrief.technologySolutions || '';
    if (techSolutions.length > 20) {
      feasibilityScore += 0.2;
      feasibilityFeedback.push("Technology approach is documented");
    }

    // Check for realistic scope
    const inScope = businessBrief.inScope || '';
    const outScope = businessBrief.outOfScope || '';
    if (inScope.length > 30 && outScope.length > 20) {
      feasibilityScore += 0.2;
      feasibilityFeedback.push("Scope boundaries help assess feasibility");
    }

    // Default reasonable assessment
    feasibilityScore += 0.1;
    feasibilityFeedback.push("Feasibility assessment requires stakeholder validation");

    assessment.criteria.feasibility.score = Math.min(feasibilityScore, 1.0);
    assessment.criteria.feasibility.feedback = feasibilityFeedback.join('. ') + '.';

    // 5. Risk Assessment - Enhanced risk evaluation
    let riskScore = 0;
    let riskFeedback = [];

    const impactOfNothing = businessBrief.impactOfDoNothing || '';
    if (impactOfNothing.length > 50) {
      riskScore += 0.4;
      riskFeedback.push("Risk of inaction is documented");
      
      // Check for specific risk indicators
      const riskKeywords = ['cost', 'competitive', 'compliance', 'security', 'efficiency', 'customer satisfaction'];
      const foundRisks = riskKeywords.filter(risk => impactOfNothing.toLowerCase().includes(risk)).length;
      
      if (foundRisks >= 2) {
        riskScore += 0.3;
        riskFeedback.push("Multiple risk categories identified");
      } else {
        riskScore += 0.1;
        riskFeedback.push("Some risk factors mentioned");
      }
    } else {
      riskFeedback.push("Risk assessment needs enhancement");
      assessment.recommendations.push("Document potential risks and impact of not proceeding");
    }

    // Check for change impact consideration
    const changeImpact = businessBrief.changeImpactExpected || '';
    if (changeImpact.length > 20) {
      riskScore += 0.2;
      riskFeedback.push("Change impact is considered");
    }

    // Check for department impact analysis
    const deptImpact = businessBrief.impactToOtherDepartments || '';
    if (deptImpact.length > 20) {
      riskScore += 0.1;
      riskFeedback.push("Cross-functional impact assessed");
    }

    assessment.criteria.riskAssessment.score = Math.min(riskScore, 1.0);
    assessment.criteria.riskAssessment.feedback = riskFeedback.join('. ') + '.';

    // 6. Strategic Alignment - Enhanced alignment assessment
    let alignmentScore = 0;
    let alignmentFeedback = [];

    const strategicTheme = businessBrief.primaryStrategicTheme || '';
    if (strategicTheme.length > 10) {
      alignmentScore += 0.4;
      alignmentFeedback.push("Strategic theme is identified");
      
      // Check for alignment keywords
      const alignmentKeywords = ['digital', 'transformation', 'efficiency', 'customer', 'innovation', 'growth'];
      const foundAlignment = alignmentKeywords.filter(keyword => 
        strategicTheme.toLowerCase().includes(keyword)
      ).length;
      
      if (foundAlignment >= 1) {
        alignmentScore += 0.3;
        alignmentFeedback.push("Aligns with common strategic priorities");
      }
    } else {
      alignmentFeedback.push("Strategic alignment needs clarification");
      assessment.recommendations.push("Define how this initiative supports strategic objectives");
    }

    // Check business unit alignment
    const leadUnit = businessBrief.leadBusinessUnit || '';
    if (leadUnit.length > 3) {
      alignmentScore += 0.2;
      alignmentFeedback.push("Lead business unit is identified");
    }

    // Check for business owners involvement
    const relevantOwners = businessBrief.relevantBusinessOwners || '';
    if (relevantOwners.length > 10) {
      alignmentScore += 0.1;
      alignmentFeedback.push("Relevant stakeholders are identified");
    }

    assessment.criteria.alignment.score = Math.min(alignmentScore, 1.0);
    assessment.criteria.alignment.feedback = alignmentFeedback.join('. ') + '.';

    // Enhanced recommendations based on comprehensive assessment
    const overallScore = Object.values(assessment.criteria).reduce(
      (total, criterion: any) => total + (criterion.score * criterion.weight), 0
    );

    console.log(`📊 Overall score calculated: ${overallScore.toFixed(2)}`);

    // Score-based recommendations
    if (overallScore < 0.4) {
      assessment.recommendations.push("🔴 Significant improvements needed before proceeding to qualification stage");
      assessment.recommendations.push("📋 Schedule stakeholder workshop to clarify requirements");
      assessment.recommendations.push("📊 Consider business case development support");
      assessment.requiredActions.push("Address critical gaps in business brief before workflow continuation");
    } else if (overallScore < 0.6) {
      assessment.recommendations.push("🟡 Good foundation, but needs refinement before proceeding");
      assessment.recommendations.push("👥 Review with business stakeholders for additional detail");
      assessment.recommendations.push("📈 Consider adding more quantitative targets");
    } else if (overallScore < 0.8) {
      assessment.recommendations.push("🟢 Well-structured brief, ready for qualification stage");
      assessment.recommendations.push("🔍 Consider adding implementation timeline estimates");
      assessment.recommendations.push("💡 Identify potential quick wins within scope");
    } else {
      assessment.recommendations.push("⭐ Excellent quality - exemplary business brief");
      assessment.recommendations.push("🚀 Fast-track candidate for priority consideration");
      assessment.recommendations.push("📖 Consider using as template for future briefs");
      assessment.recommendations.push("⚡ Ready for immediate qualification and prioritization");
    }

    // Specific improvement suggestions based on criteria scores
    Object.entries(assessment.criteria).forEach(([criterionName, criterion]: [string, any]) => {
      if (criterion.score < 0.5) {
        switch (criterionName) {
          case 'clarity':
            assessment.recommendations.push("📝 Improve clarity: Use specific business language and measurable terms");
            break;
          case 'completeness':
            assessment.recommendations.push("📋 Add missing information: Focus on business objectives and outcomes");
            break;
          case 'businessValue':
            assessment.recommendations.push("💰 Enhance value proposition: Add ROI, cost savings, or revenue targets");
            break;
          case 'feasibility':
            assessment.recommendations.push("🔧 Address feasibility: Consider technology constraints and resource requirements");
            break;
          case 'riskAssessment':
            assessment.recommendations.push("⚠️ Strengthen risk analysis: Identify threats and mitigation strategies");
            break;
          case 'alignment':
            assessment.recommendations.push("🎯 Clarify strategic alignment: Connect to business strategy and priorities");
            break;
        }
      }
    });

    console.log(`✅ Generated ${assessment.recommendations.length} recommendations and ${assessment.requiredActions.length} required actions`);

    return assessment;
  }

  private async saveQualityAssessment(assessment: any): Promise<void> {
    try {
      // Update the business brief extension with quality data
      const extension = await this.getBusinessBriefExtension(assessment.businessBriefId);
      
      if (extension) {
        // Update existing extension
        await db.execute(`
          UPDATE aurav2_business_brief_extensions
          SET quality_score = ?, ai_analysis = ?, updated_at = CURRENT_TIMESTAMP
          WHERE business_brief_id = ?
        `, [
          assessment.overallScore,
          JSON.stringify(assessment),
          assessment.businessBriefId
        ]);
      } else {
        // Create new extension with quality data
        await this.createBusinessBriefExtension({
          businessBriefId: assessment.businessBriefId,
          qualityScore: assessment.overallScore,
          aiAnalysis: assessment
        });
      }

      // Also store in AI consolidations table
      await db.execute(`
        INSERT INTO aurav2_ai_consolidations
        (id, business_brief_id, consolidation_type, input_data, ai_recommendations, confidence_score, implementation_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        assessment.id,
        assessment.businessBriefId,
        'requirement_analysis',
        JSON.stringify({ businessBriefData: 'analyzed' }),
        JSON.stringify(assessment),
        assessment.overallScore,
        'pending'
      ]);

    } catch (error) {
      console.error('❌ Failed to save quality assessment:', error);
      throw error;
    }
  }

  private getQualityLevel(score: number): string {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.7) return 'Good';
    if (score >= 0.6) return 'Acceptable';
    if (score >= 0.4) return 'Needs Improvement';
    return 'Poor';
  }

  private getQualityLevelDescription(score: number): string {
    if (score >= 0.9) return 'Outstanding business brief that exceeds standards and is ready for fast-track processing';
    if (score >= 0.8) return 'High-quality brief with clear value proposition and comprehensive details';
    if (score >= 0.7) return 'Good quality brief that meets most standards with minor improvements needed';
    if (score >= 0.6) return 'Acceptable brief that meets minimum standards but could benefit from enhancements';
    if (score >= 0.4) return 'Below standards - requires significant improvements before proceeding';
    return 'Poor quality - major rework needed across multiple areas';
  }

  async generateAIRecommendations(businessBriefId: string): Promise<any> {
    try {
      // Get latest quality assessment
      const extension = await this.getBusinessBriefExtension(businessBriefId);
      
      if (extension?.aiAnalysis) {
        return {
          stageConsolidation: ["Consider combining qualification and prioritization steps for high-quality briefs"],
          qualityImprovements: extension.aiAnalysis.recommendations || [],
          riskAssessment: {
            level: extension.qualityScore >= 0.8 ? 'Low' : extension.qualityScore >= 0.6 ? 'Medium' : 'High',
            factors: extension.aiAnalysis.requiredActions || []
          },
          estimationRefinement: {
            suggestedSize: extension.qualityScore >= 0.8 ? 'Well-defined' : 'Requires clarification',
            confidence: extension.qualityScore >= 0.8 ? 'High' : 'Medium'
          }
        };
      }

      // Fallback recommendations
      return {
        stageConsolidation: ["Run quality assessment first"],
        qualityImprovements: ["Complete quality assessment to get personalized recommendations"],
        riskAssessment: { level: 'Unknown', factors: [] },
        estimationRefinement: { suggestedSize: 'Unknown', confidence: 'Low' }
      };

    } catch (error) {
      console.error('❌ Failed to generate AI recommendations:', error);
      return {
        stageConsolidation: [],
        qualityImprovements: ["Error generating recommendations"],
        riskAssessment: { level: 'Unknown', factors: [] },
        estimationRefinement: { suggestedSize: 'Unknown', confidence: 'Low' }
      };
    }
  }

  // =============================================
  // Qualified Ideas Management
  // =============================================

  async getQualifiedIdeas(options: { status?: string; limit?: number; offset?: number } = {}): Promise<any[]> {
    try {
      let query = `
        SELECT 
          qi.*,
          bb.title as briefTitle,
          bb.description as briefDescription,
          bb.business_owner as businessOwner
        FROM aurav2_qualified_ideas qi
        LEFT JOIN business_briefs bb ON qi.business_brief_id = bb.id
      `;
      
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (options.status) {
        conditions.push('qi.recommended_action = ?');
        params.push(options.status);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY qi.qualification_score DESC, qi.created_at DESC';
      
      if (options.limit) {
        query += ' LIMIT ?';
        params.push(options.limit);
        
        if (options.offset) {
          query += ' OFFSET ?';
          params.push(options.offset);
        }
      }

      const results = await db.execute(query, params) as any[];
      
      return results.map(row => ({
        id: row.id,
        businessBriefId: row.business_brief_id,
        title: row.briefTitle || row.title,
        description: row.briefDescription,
        qualificationScore: row.qualification_score,
        businessValue: row.business_value,
        complexity: row.complexity,
        effort: row.effort,
        riskLevel: row.risk_level,
        strategicAlignment: row.strategic_alignment,
        marketImpact: row.market_impact,
        priority: row.priority || 999,
        recommendedAction: row.recommended_action,
        qualifiedAt: row.created_at,
        qualifiedBy: row.qualified_by,
        estimatedROI: row.estimated_roi,
        timeToMarket: row.time_to_market,
        resourceRequirement: row.resource_requirement,
        criteria: {
          marketDemand: row.market_demand,
          technicalFeasibility: row.technical_feasibility,
          businessValue: row.business_value,
          resourceAvailability: row.resource_availability,
          strategicAlignment: row.strategic_alignment,
          riskLevel: row.risk_level
        }
      }));
    } catch (error) {
      console.error('❌ Failed to get qualified ideas:', error);
      throw error;
    }
  }

  async createQualifiedIdea(ideaData: any): Promise<any> {
    try {
      const ideaId = `QI-${Date.now().toString(36).toUpperCase()}`;
      
      await db.execute(`
        INSERT INTO aurav2_qualified_ideas
        (id, business_brief_id, title, qualification_score, market_demand, technical_feasibility,
         business_value, resource_availability, strategic_alignment, risk_level,
         market_research, competitor_analysis, technical_assessment, business_case,
         risk_assessment, recommended_action, qualified_by, estimated_roi, 
         time_to_market, resource_requirement, complexity, effort, market_impact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ideaId,
        ideaData.businessBriefId,
        ideaData.title,
        ideaData.qualificationScore,
        ideaData.marketDemand,
        ideaData.technicalFeasibility,
        ideaData.businessValue,
        ideaData.resourceAvailability,
        ideaData.strategicAlignment,
        ideaData.riskLevel,
        ideaData.marketResearch,
        ideaData.competitorAnalysis,
        ideaData.technicalAssessment,
        ideaData.businessCase,
        ideaData.riskAssessment,
        ideaData.recommendedAction,
        ideaData.qualifiedBy,
        ideaData.estimatedROI,
        ideaData.timeToMarket,
        ideaData.resourceRequirement,
        ideaData.complexity || 5,
        ideaData.effort || 5,
        ideaData.marketImpact || 5
      ]);

      const qualifiedIdeas = await this.getQualifiedIdeas();
      return qualifiedIdeas.find(idea => idea.id === ideaId);
    } catch (error) {
      console.error('❌ Failed to create qualified idea:', error);
      throw error;
    }
  }

  // =============================================
  // Portfolio Prioritization Management
  // =============================================

  async getPortfolioPrioritization(options: { theme?: string; quarter?: string } = {}): Promise<any> {
    try {
      const qualifiedIdeas = await this.getQualifiedIdeas();
      
      // Calculate portfolio metrics
      const totalIdeas = qualifiedIdeas.length;
      const proceedIdeas = qualifiedIdeas.filter(idea => idea.recommendedAction === 'proceed');
      const averageScore = qualifiedIdeas.reduce((sum, idea) => sum + idea.qualificationScore, 0) / totalIdeas || 0;
      
      const totalROI = qualifiedIdeas.reduce((sum, idea) => {
        const roi = parseFloat(idea.estimatedROI?.replace('%', '') || '0');
        return sum + roi;
      }, 0);
      
      const totalResourceNeeds = qualifiedIdeas.reduce((sum, idea) => {
        const fte = parseFloat(idea.resourceRequirement?.split(' ')[0] || '0');
        return sum + fte;
      }, 0);

      return {
        portfolioSummary: {
          theme: options.theme || 'Q1 2024 Portfolio',
          totalIdeas,
          qualifiedIdeas: proceedIdeas.length,
          averageQualificationScore: averageScore,
          estimatedTotalROI: `${totalROI}%`,
          totalResourceRequirement: `${totalResourceNeeds} FTE`,
          portfolioValue: 'High'
        },
        prioritizedIdeas: qualifiedIdeas.sort((a, b) => a.priority - b.priority),
        valueEffortMatrix: this.generateValueEffortMatrix(qualifiedIdeas),
        roadmapQuarters: this.generateRoadmapQuarters(qualifiedIdeas)
      };
    } catch (error) {
      console.error('❌ Failed to get portfolio prioritization:', error);
      throw error;
    }
  }

  private generateValueEffortMatrix(ideas: any[]): any {
    const matrix = {
      high_value_low_effort: ideas.filter(idea => idea.businessValue >= 7 && idea.effort < 7),
      high_value_high_effort: ideas.filter(idea => idea.businessValue >= 7 && idea.effort >= 7),
      low_value_low_effort: ideas.filter(idea => idea.businessValue < 7 && idea.effort < 7),
      low_value_high_effort: ideas.filter(idea => idea.businessValue < 7 && idea.effort >= 7)
    };

    return {
      matrix,
      insights: {
        quickWins: matrix.high_value_low_effort.length,
        majorProjects: matrix.high_value_high_effort.length,
        fillIns: matrix.low_value_low_effort.length,
        questionable: matrix.low_value_high_effort.length
      }
    };
  }

  private generateRoadmapQuarters(ideas: any[]): any {
    const sortedIdeas = ideas.sort((a, b) => a.priority - b.priority);
    const quartersData = {
      'Q1 2024': sortedIdeas.slice(0, 2),
      'Q2 2024': sortedIdeas.slice(2, 4),
      'Q3 2024': sortedIdeas.slice(4, 6),
      'Q4 2024': sortedIdeas.slice(6, 8)
    };

    return quartersData;
  }
}

export const auraV2Service = new AuraV2Service();

export async function getAuraV2Service(): Promise<AuraV2Service> {
  return auraV2Service;
}
