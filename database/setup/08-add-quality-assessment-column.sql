-- =============================================
-- Add Quality Assessment Column to Business Briefs
-- =============================================

-- Add quality_assessment column to store AI assessment data
ALTER TABLE business_briefs 
ADD COLUMN quality_assessment TEXT DEFAULT NULL 
COMMENT 'JSON data containing AI quality assessment results (overallGrade, score, suggestions, etc.)';
