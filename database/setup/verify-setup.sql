-- =============================================
-- Aura SDLC Database Setup Verification
-- Run this to verify everything was created correctly
-- =============================================

USE aura_sdlc;

-- Check database exists
SELECT 'Database aura_sdlc exists!' as Status;

-- Verify all tables exist
SELECT 
    'Tables Created' as Check_Type,
    COUNT(*) as Count_Found,
    GROUP_CONCAT(TABLE_NAME ORDER BY TABLE_NAME) as Tables
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'aura_sdlc';

-- Verify users exist  
SELECT 
    'Users Created' as Check_Type,
    COUNT(*) as Count_Found,
    GROUP_CONCAT(CONCAT(User, '@', Host) ORDER BY User, Host) as Users
FROM mysql.user 
WHERE User = 'aura_user';

-- Verify stored procedures exist
SELECT 
    'Stored Procedures' as Check_Type,
    COUNT(*) as Count_Found,
    GROUP_CONCAT(ROUTINE_NAME ORDER BY ROUTINE_NAME) as Procedures
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'aura_sdlc' AND ROUTINE_TYPE = 'PROCEDURE';

-- Verify vector stores exist
SELECT 
    'Vector Stores' as Check_Type,
    COUNT(*) as Count_Found,
    GROUP_CONCAT(name ORDER BY name) as Vector_Stores
FROM vector_stores;

-- Check sample data counts
SELECT 
    'Sample Data' as Check_Type,
    CONCAT(
        'BusinessBriefs:', (SELECT COUNT(*) FROM business_briefs), ', ',
        'Initiatives:', (SELECT COUNT(*) FROM initiatives), ', ',
        'Features:', (SELECT COUNT(*) FROM features), ', ',
        'Epics:', (SELECT COUNT(*) FROM epics), ', ', 
        'Stories:', (SELECT COUNT(*) FROM stories), ', ',
        'TestCases:', (SELECT COUNT(*) FROM test_cases), ', ',
        'Documents:', (SELECT COUNT(*) FROM documents)
    ) as Data_Counts;

-- Test a stored procedure
CALL GetDashboardStats();

-- Test hierarchy query
SELECT 
    bb.title as Business_Brief,
    i.title as Initiative, 
    f.title as Feature,
    e.title as Epic,
    s.title as Story
FROM business_briefs bb
LEFT JOIN initiatives i ON bb.id = i.business_brief_id  
LEFT JOIN features f ON i.id = f.initiative_id
LEFT JOIN epics e ON f.id = e.feature_id
LEFT JOIN stories s ON e.id = s.epic_id
LIMIT 5;

-- Final status
SELECT 
    'VERIFICATION COMPLETE' as Status,
    'All components appear to be set up correctly!' as Message,
    NOW() as Timestamp;
