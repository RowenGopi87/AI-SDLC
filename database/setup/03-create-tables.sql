-- =============================================
-- Create Aura SDLC Tables
-- =============================================

-- Create business_briefs table
CREATE TABLE IF NOT EXISTS business_briefs (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_owner VARCHAR(255),
    lead_business_unit VARCHAR(255),
    additional_business_units TEXT,
    primary_strategic_theme VARCHAR(255),
    business_objective TEXT,
    quantifiable_business_outcomes TEXT,
    in_scope TEXT,
    out_of_scope TEXT,
    impact_of_do_nothing TEXT,
    happy_path TEXT,
    exceptions TEXT,
    impacted_end_users TEXT,
    change_impact_expected TEXT,
    impact_to_other_departments TEXT,
    other_departments_impacted TEXT,
    impacts_existing_technology TEXT,
    technology_solutions TEXT,
    relevant_business_owners TEXT,
    other_technology_info TEXT,
    supporting_documents TEXT,
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected') DEFAULT 'draft',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    workflow_stage VARCHAR(50),
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
    id VARCHAR(255) PRIMARY KEY,
    business_brief_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_value TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    estimated_value DECIMAL(10, 2),
    workflow_stage VARCHAR(50),
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_brief_id) REFERENCES business_briefs(id) ON DELETE CASCADE
);

-- Create features table
CREATE TABLE IF NOT EXISTS features (
    id VARCHAR(255) PRIMARY KEY,
    initiative_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_value TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    story_points INT,
    workflow_stage VARCHAR(50),
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE CASCADE
);

-- Create epics table
CREATE TABLE IF NOT EXISTS epics (
    id VARCHAR(255) PRIMARY KEY,
    feature_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    business_value TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    story_points INT,
    workflow_stage VARCHAR(50),
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
    id VARCHAR(255) PRIMARY KEY,
    epic_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_story TEXT,
    acceptance_criteria TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('backlog', 'planning', 'in_progress', 'done', 'cancelled') DEFAULT 'backlog',
    assigned_to VARCHAR(255),
    story_points INT,
    workflow_stage VARCHAR(50),
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE
);

-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
    id VARCHAR(255) PRIMARY KEY,
    work_item_id VARCHAR(255),
    work_item_type ENUM('feature', 'epic', 'story'),
    design_type VARCHAR(50),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create code_items table
CREATE TABLE IF NOT EXISTS code_items (
    id VARCHAR(255) PRIMARY KEY,
    work_item_id VARCHAR(255),
    work_item_type ENUM('feature', 'epic', 'story'),
    language VARCHAR(50),
    code TEXT,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create test_cases table
CREATE TABLE IF NOT EXISTS test_cases (
    id VARCHAR(255) PRIMARY KEY,
    work_item_id VARCHAR(255),
    work_item_type ENUM('feature', 'epic', 'story'),
    test_type VARCHAR(50),
    description TEXT,
    steps TEXT,
    expected_result TEXT,
    status ENUM('pass', 'fail', 'not_run') DEFAULT 'not_run',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create SAFe mappings table
CREATE TABLE IF NOT EXISTS safe_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_item_status VARCHAR(50),
    safe_stage VARCHAR(50),
    description TEXT
);
