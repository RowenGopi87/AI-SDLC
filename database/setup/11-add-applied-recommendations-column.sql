-- =============================================
-- Add applied_recommendations column to aurav2_business_brief_extensions
-- Migration: 11-add-applied-recommendations-column.sql
-- =============================================

-- Add the applied_recommendations column to track which AI recommendations have been applied
ALTER TABLE aurav2_business_brief_extensions 
ADD COLUMN IF NOT EXISTS applied_recommendations JSON COMMENT 'Track applied AI recommendations with timestamps';

-- Add index for efficient querying of applied recommendations
CREATE INDEX IF NOT EXISTS idx_applied_recommendations 
ON aurav2_business_brief_extensions(business_brief_id, (JSON_LENGTH(applied_recommendations)));

-- Verify the column was added
DESCRIBE aurav2_business_brief_extensions;

