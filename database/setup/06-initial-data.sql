-- =============================================
-- Aura SDLC Database Setup - Step 6
-- Insert Initial/Sample Data
-- =============================================

USE aura_sdlc;

-- Insert sample business brief
INSERT IGNORE INTO business_briefs (
    id, title, description, business_owner, status, priority, 
    workflow_stage, submitted_by, submitted_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Customer Portal Enhancement',
    'Enhance the existing customer portal with modern UI/UX, improved performance, and new self-service features to reduce support calls and improve customer satisfaction.',
    'John Smith',
    'approved',
    'high',
    'execution',
    'john.smith@company.com',
    NOW()
);

-- Insert sample initiative
INSERT IGNORE INTO initiatives (
    id, business_brief_id, title, description, status, priority,
    workflow_stage, estimated_value
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Modernize Customer Dashboard',
    'Redesign and rebuild the customer dashboard with React and modern design principles',
    'in_progress',
    'high',
    'development',
    150000.00
);

-- Insert sample feature
INSERT IGNORE INTO features (
    id, initiative_id, title, description, status, priority,
    workflow_stage, story_points
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    'Interactive Dashboard Widgets',
    'Create interactive widgets for account summary, recent transactions, and quick actions',
    'planning',
    'medium',
    'planning',
    21
);

-- Insert sample epic
INSERT IGNORE INTO epics (
    id, feature_id, title, description, status, priority,
    workflow_stage, story_points
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    'Account Summary Widget',
    'Develop an interactive widget showing account balance, recent activity, and key metrics',
    'backlog',
    'medium',
    'planning',
    8
);

-- Insert sample story
INSERT IGNORE INTO stories (
    id, epic_id, title, description, user_story, acceptance_criteria,
    status, priority, workflow_stage, story_points
) VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440004',
    'Display Account Balance',
    'Create a component that displays the current account balance with proper formatting',
    'As a customer, I want to see my current account balance prominently on the dashboard so that I can quickly check my financial status',
    'Given I am logged into the customer portal, When I view the dashboard, Then I should see my current account balance displayed in large, easy-to-read text with proper currency formatting',
    'backlog',
    'medium',
    'planning',
    3
);

-- Insert sample test case
INSERT IGNORE INTO test_cases (
    id, story_id, title, description, preconditions, steps, expected_results,
    status, priority, test_type, automation_level
) VALUES (
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440005',
    'Verify Account Balance Display',
    'Test that account balance is correctly displayed on dashboard',
    'User must be logged in with valid account having balance > 0',
    '1. Log into customer portal\n2. Navigate to dashboard\n3. Locate account balance widget\n4. Verify balance format and amount',
    'Account balance should be displayed with correct currency symbol, proper decimal formatting, and match the actual account balance',
    'draft',
    'medium',
    'system',
    'automated'
);

-- Insert sample design
INSERT IGNORE INTO designs (
    id, story_id, title, description, design_type, status, created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440005',
    'Account Balance Widget Mockup',
    'Visual design mockup for the account balance display widget',
    'mockup',
    'approved',
    'design.team@company.com'
);

-- Insert sample code item
INSERT IGNORE INTO code_items (
    id, story_id, title, description, code_type, language, framework,
    status, created_by
) VALUES (
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440005',
    'AccountBalanceWidget Component',
    'React component for displaying formatted account balance',
    'component',
    'TypeScript',
    'React',
    'generated',
    'dev.team@company.com'
);

-- Insert sample document for RAG
INSERT IGNORE INTO documents (
    id, file_name, original_name, file_type, file_size, file_path,
    uploaded_by, processed, extracted_text
) VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    'safe_framework_guide_v1.pdf',
    'SAFe Framework Implementation Guide.pdf',
    'pdf',
    2048000,
    '/documents/safe_framework_guide_v1.pdf',
    'admin@company.com',
    true,
    'This is sample extracted text from the SAFe framework guide discussing portfolio management, program execution, and team collaboration practices...'
);

-- Insert sample SAFe mapping
INSERT IGNORE INTO safe_mappings (
    id, work_item_id, work_item_type, safe_stage, safe_level,
    safe_artifact, confidence
) VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    'business_brief',
    'Portfolio Backlog',
    'portfolio',
    'Epic',
    0.85
);

-- Verify sample data
SELECT 'Sample data inserted successfully!' as Status;

-- Show counts of sample data
SELECT 
    (SELECT COUNT(*) FROM business_briefs) as business_briefs,
    (SELECT COUNT(*) FROM initiatives) as initiatives,
    (SELECT COUNT(*) FROM features) as features,
    (SELECT COUNT(*) FROM epics) as epics,
    (SELECT COUNT(*) FROM stories) as stories,
    (SELECT COUNT(*) FROM test_cases) as test_cases,
    (SELECT COUNT(*) FROM designs) as designs,
    (SELECT COUNT(*) FROM code_items) as code_items,
    (SELECT COUNT(*) FROM documents) as documents,
    (SELECT COUNT(*) FROM safe_mappings) as safe_mappings;
