-- =============================================
-- Aura SDLC Database Setup - Step 5
-- Create Stored Procedures for Common Operations
-- =============================================

USE aura_sdlc;

DELIMITER //

-- Procedure to get complete work item hierarchy
CREATE PROCEDURE IF NOT EXISTS GetWorkItemHierarchy(
    IN work_item_id VARCHAR(36),
    IN work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story')
)
BEGIN
    CASE work_item_type
        WHEN 'business_brief' THEN
            SELECT 
                bb.id as business_brief_id, bb.title as business_brief_title,
                i.id as initiative_id, i.title as initiative_title,
                f.id as feature_id, f.title as feature_title,
                e.id as epic_id, e.title as epic_title,
                s.id as story_id, s.title as story_title
            FROM business_briefs bb
            LEFT JOIN initiatives i ON bb.id = i.business_brief_id
            LEFT JOIN features f ON i.id = f.initiative_id
            LEFT JOIN epics e ON f.id = e.feature_id
            LEFT JOIN stories s ON e.id = s.epic_id
            WHERE bb.id = work_item_id;
            
        WHEN 'story' THEN
            SELECT 
                bb.id as business_brief_id, bb.title as business_brief_title,
                i.id as initiative_id, i.title as initiative_title,
                f.id as feature_id, f.title as feature_title,
                e.id as epic_id, e.title as epic_title,
                s.id as story_id, s.title as story_title
            FROM stories s
            JOIN epics e ON s.epic_id = e.id
            JOIN features f ON e.feature_id = f.id
            JOIN initiatives i ON f.initiative_id = i.id
            JOIN business_briefs bb ON i.business_brief_id = bb.id
            WHERE s.id = work_item_id;
            
        -- Add other cases as needed
        ELSE
            SELECT 'Invalid work item type' as error;
    END CASE;
END//

-- Procedure to update work item progress
CREATE PROCEDURE IF NOT EXISTS UpdateWorkItemProgress(
    IN work_item_id VARCHAR(36),
    IN work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story'),
    IN new_status VARCHAR(50),
    IN completion_percentage DECIMAL(5,2)
)
BEGIN
    CASE work_item_type
        WHEN 'business_brief' THEN
            UPDATE business_briefs 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'initiative' THEN
            UPDATE initiatives 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'feature' THEN
            UPDATE features 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'epic' THEN
            UPDATE epics 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'story' THEN
            UPDATE stories 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
    END CASE;
    
    SELECT ROW_COUNT() as affected_rows;
END//

-- Procedure to get work items by status across all types
CREATE PROCEDURE IF NOT EXISTS GetWorkItemsByStatus(
    IN item_status VARCHAR(50)
)
BEGIN
    SELECT 'business_brief' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM business_briefs WHERE status = item_status
    
    UNION ALL
    
    SELECT 'initiative' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM initiatives WHERE status = item_status
    
    UNION ALL
    
    SELECT 'feature' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM features WHERE status = item_status
    
    UNION ALL
    
    SELECT 'epic' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM epics WHERE status = item_status
    
    UNION ALL
    
    SELECT 'story' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM stories WHERE status = item_status
    
    ORDER BY updated_at DESC;
END//

-- Procedure to get test cases with their story context
CREATE PROCEDURE IF NOT EXISTS GetTestCasesWithContext(
    IN story_id_param VARCHAR(36)
)
BEGIN
    SELECT 
        tc.*,
        s.title as story_title,
        e.title as epic_title,
        f.title as feature_title,
        i.title as initiative_title,
        bb.title as business_brief_title
    FROM test_cases tc
    JOIN stories s ON tc.story_id = s.id
    JOIN epics e ON s.epic_id = e.id
    JOIN features f ON e.feature_id = f.id
    JOIN initiatives i ON f.initiative_id = i.id
    JOIN business_briefs bb ON i.business_brief_id = bb.id
    WHERE tc.story_id = story_id_param OR story_id_param IS NULL
    ORDER BY tc.created_at DESC;
END//

-- Procedure to get dashboard statistics
CREATE PROCEDURE IF NOT EXISTS GetDashboardStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM business_briefs WHERE status = 'approved') as approved_briefs,
        (SELECT COUNT(*) FROM initiatives WHERE status IN ('planning', 'in_progress')) as active_initiatives,
        (SELECT COUNT(*) FROM features WHERE status IN ('planning', 'in_progress')) as active_features,
        (SELECT COUNT(*) FROM stories WHERE status IN ('planning', 'in_progress')) as active_stories,
        (SELECT COUNT(*) FROM test_cases WHERE status IN ('ready', 'executing')) as pending_tests,
        (SELECT COUNT(*) FROM test_cases WHERE status = 'passed') as passed_tests,
        (SELECT COUNT(*) FROM test_cases WHERE status = 'failed') as failed_tests,
        (SELECT COUNT(*) FROM documents WHERE processed = true) as processed_documents;
END//

-- Procedure to search work items by text
CREATE PROCEDURE IF NOT EXISTS SearchWorkItems(
    IN search_text VARCHAR(255)
)
BEGIN
    SELECT 'business_brief' as type, id, title, description, status, priority, created_at
    FROM business_briefs 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'initiative' as type, id, title, description, status, priority, created_at
    FROM initiatives 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'feature' as type, id, title, description, status, priority, created_at
    FROM features 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'epic' as type, id, title, description, status, priority, created_at
    FROM epics 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'story' as type, id, title, description, status, priority, created_at
    FROM stories 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    ORDER BY created_at DESC
    LIMIT 50;
END//

DELIMITER ;

-- Show all created procedures
SHOW PROCEDURE STATUS WHERE Db = 'aura_sdlc';

SELECT 'Stored procedures created successfully!' as Status;
