-- =============================================
-- Create AuraV2 Enhanced Tables
-- =============================================

-- AuraV2 Workflow Stages Configuration
CREATE TABLE IF NOT EXISTS aurav2_workflow_stages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    stage_order INT NOT NULL,
    workflow_type ENUM('new_system', 'enhancement', 'both') DEFAULT 'both',
    definition_of_ready JSON,
    key_players JSON,
    definition_of_done JSON,
    activities JSON,
    reference_documents JSON,
    ai_consolidation_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AuraV2 Workflow Progress Tracking
CREATE TABLE IF NOT EXISTS aurav2_workflow_progress (
    id VARCHAR(36) PRIMARY KEY,
    business_brief_id VARCHAR(36) NOT NULL,
    workflow_type ENUM('new_system', 'enhancement') NOT NULL,
    current_stage_id VARCHAR(50) NOT NULL,
    stage_completion JSON, -- Track completion of Definition of Done items
    stage_history JSON, -- Track stage transitions and timestamps
    ai_recommendations JSON, -- Store AI-generated recommendations
    consolidation_data JSON, -- Store AI consolidation results
    estimated_completion_date DATE,
    actual_completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE,
    FOREIGN KEY (current_stage_id) REFERENCES aurav2_workflow_stages(id),
    INDEX idx_business_brief (business_brief_id),
    INDEX idx_workflow_type (workflow_type),
    INDEX idx_current_stage (current_stage_id)
);

-- AuraV2 Enhanced Business Brief Extensions
CREATE TABLE IF NOT EXISTS aurav2_business_brief_extensions (
    id VARCHAR(36) PRIMARY KEY,
    business_brief_id VARCHAR(36) NOT NULL UNIQUE,
    workflow_type ENUM('new_system', 'enhancement'),
    estimation_size ENUM('xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'),
    estimation_confidence ENUM('bronze', 'silver', 'gold'),
    build_or_buy_decision ENUM('build', 'buy', 'enhance', 'pending') DEFAULT 'pending',
    rfi_data JSON, -- Store RFI results and vendor information
    capacity_planning JSON, -- Store capacity requirements and allocations
    discovery_findings JSON, -- Store discovery phase outcomes
    quality_score DECIMAL(3,2), -- AI-generated quality score (0.00-1.00)
    ai_analysis JSON, -- Store comprehensive AI analysis
    stakeholder_alignment JSON, -- Track stakeholder approvals by stage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE,
    INDEX idx_workflow_type (workflow_type),
    INDEX idx_estimation_size (estimation_size),
    INDEX idx_quality_score (quality_score)
);

-- AuraV2 User Roles and Access Control
CREATE TABLE IF NOT EXISTS aurav2_user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    role ENUM('product_owner', 'product_manager', 'portfolio_manager', 'delivery_manager', 'business_owner', 'art_leadership', 'initiative_lead') NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

-- AuraV2 AI Consolidation Results
CREATE TABLE IF NOT EXISTS aurav2_ai_consolidations (
    id VARCHAR(36) PRIMARY KEY,
    business_brief_id VARCHAR(36) NOT NULL,
    consolidation_type ENUM('stage_optimization', 'requirement_analysis', 'risk_assessment', 'estimation_refinement') NOT NULL,
    input_data JSON NOT NULL,
    ai_recommendations JSON NOT NULL,
    confidence_score DECIMAL(3,2),
    human_review_status ENUM('pending', 'approved', 'rejected', 'modified') DEFAULT 'pending',
    human_reviewer VARCHAR(255),
    implementation_status ENUM('pending', 'applied', 'discarded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE,
    INDEX idx_business_brief (business_brief_id),
    INDEX idx_consolidation_type (consolidation_type),
    INDEX idx_review_status (human_review_status)
);

-- AuraV2 Qualified Ideas
CREATE TABLE IF NOT EXISTS aurav2_qualified_ideas (
    id VARCHAR(36) PRIMARY KEY,
    business_brief_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    qualification_score DECIMAL(3,2) NOT NULL,
    market_demand INT DEFAULT 5, -- 1-10 scale
    technical_feasibility INT DEFAULT 5, -- 1-10 scale
    business_value INT DEFAULT 5, -- 1-10 scale
    resource_availability INT DEFAULT 5, -- 1-10 scale
    strategic_alignment INT DEFAULT 5, -- 1-10 scale
    risk_level INT DEFAULT 5, -- 1-10 scale
    complexity INT DEFAULT 5, -- 1-10 scale
    effort INT DEFAULT 5, -- 1-10 scale
    market_impact INT DEFAULT 5, -- 1-10 scale
    priority INT DEFAULT 999, -- Portfolio priority ranking
    market_research TEXT,
    competitor_analysis TEXT,
    technical_assessment TEXT,
    business_case TEXT,
    risk_assessment TEXT,
    recommended_action ENUM('proceed', 'research_more', 'decline', 'defer') NOT NULL,
    qualified_by VARCHAR(255) NOT NULL,
    estimated_roi VARCHAR(50),
    time_to_market VARCHAR(50),
    resource_requirement VARCHAR(100),
    portfolio_quarter VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE,
    INDEX idx_business_brief (business_brief_id),
    INDEX idx_qualification_score (qualification_score),
    INDEX idx_recommended_action (recommended_action),
    INDEX idx_priority (priority)
);

-- Insert default workflow stages for AuraV2
INSERT INTO aurav2_workflow_stages (id, name, description, icon, stage_order, workflow_type, definition_of_ready, key_players, definition_of_done, activities, reference_documents) VALUES
('idea', 'Capture Idea as Business Brief', 'Outlines a new business idea and facilitating effective decision-making', 'lightbulb', 1, 'both', 
 JSON_ARRAY('Idea to be pursued identified', 'Business features or tech enablers defined', 'Business Sponsor identified'),
 JSON_ARRAY(
   JSON_OBJECT('role', 'business_owner', 'name', 'Business Owner (BO)'),
   JSON_OBJECT('role', 'business_sponsor', 'name', 'Business Sponsor'),
   JSON_OBJECT('role', 'portfolio_leadership', 'name', 'Portfolio Leadership')
 ),
 JSON_ARRAY('Idea captured as Business Brief', 'High level impact analysis completed', 'Ready to be Qualified'),
 JSON_ARRAY(
   JSON_OBJECT('owner', 'BO', 'activity', 'Raise and submit the Idea via the Idea Management tool'),
   JSON_OBJECT('owner', 'BO', 'activity', 'Present the idea to stakeholders'),
   JSON_OBJECT('owner', 'MPD', 'activity', 'Perform internal business review and Impact analysis')
 ),
 JSON_ARRAY('Idea Management App', 'Idea Management Workflow', 'Small Enhancement Guidelines')
),

('qualify', 'Qualify the Idea', 'Research, filter and assess new business ideas against available products', 'search', 2, 'both',
 JSON_ARRAY('Business brief captured', 'Idea impact assessment completed'),
 JSON_ARRAY(
   JSON_OBJECT('role', 'business_owner', 'name', 'Business Owner (BO)'),
   JSON_OBJECT('role', 'portfolio_leadership', 'name', 'Portfolio Leadership'),
   JSON_OBJECT('role', 'art_leadership', 'name', 'ART Leadership'),
   JSON_OBJECT('role', 'pmo', 'name', 'PMO')
 ),
 JSON_ARRAY('Idea qualification complete', 'Owning ART identified', 'Build/buy decision preliminary', 'Business brief qualified'),
 JSON_ARRAY(
   JSON_OBJECT('owner', 'MPD', 'activity', 'Manage the Idea Backlog and lifecycle'),
   JSON_OBJECT('owner', 'BO', 'activity', 'Present the business brief to IT stakeholders'),
   JSON_OBJECT('owner', 'MPD', 'activity', 'Evaluate and prioritise ideas with required players'),
   JSON_OBJECT('owner', 'MEA', 'activity', 'Review feasibility with Business Platform teams')
 ),
 JSON_ARRAY('Idea Management App', 'Generic Service Level Agreement', 'Small Enhancement Guidelines')
),

('prioritize', 'Prioritise the Initiative', 'Initiative prioritised by business & IT to pull from Portfolio funnel', 'list-ordered', 3, 'both',
 JSON_ARRAY('Idea qualified as Initiative', 'Initiative added to Portfolio funnel', 'Latest updated view of Portfolio roadmap'),
 JSON_ARRAY(
   JSON_OBJECT('role', 'business_owner', 'name', 'Business Owner (BO)'),
   JSON_OBJECT('role', 'vp_portfolio', 'name', 'VP Portfolio'),
   JSON_OBJECT('role', 'portfolio_leadership', 'name', 'Portfolio Leadership')
 ),
 JSON_ARRAY('Initiative prioritized and PPM updated', 'Stakeholders aligned', 'Build/buy decision revalidated'),
 JSON_ARRAY(
   JSON_OBJECT('owner', 'MPD', 'activity', 'Review and prioritise initiative and capture in PPM portfolio'),
   JSON_OBJECT('owner', 'MPD', 'activity', 'Update and present Roadmap to stakeholders'),
   JSON_OBJECT('owner', 'VP', 'activity', 'Manage capacity and priority conflicts'),
   JSON_OBJECT('owner', 'MEA', 'activity', 'Provide inputs on technical complexity and NFR requirements')
 ),
 JSON_ARRAY('PPM Tool', 'Non-functional requirements')
);

-- Insert default user roles (can be updated later)
INSERT INTO aurav2_user_roles (id, user_id, email, name, role, department) VALUES
(UUID(), 'admin', 'admin@emirates.com', 'System Administrator', 'portfolio_manager', 'IT'),
(UUID(), 'demo_po', 'po@emirates.com', 'Demo Product Owner', 'product_owner', 'Business'),
(UUID(), 'demo_pm', 'pm@emirates.com', 'Demo Product Manager', 'product_manager', 'IT')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
