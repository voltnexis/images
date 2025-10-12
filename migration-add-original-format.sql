-- Migration to add original format columns to existing images table
-- Run this if you already have an existing images table

ALTER TABLE images 
ADD COLUMN IF NOT EXISTS original_url TEXT,
ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS original_file_size INTEGER,
ADD COLUMN IF NOT EXISTS original_format VARCHAR(50);

-- Update existing records to set original format from file_type
UPDATE images 
SET original_format = CASE 
    WHEN file_type LIKE '%jpeg%' OR file_type LIKE '%jpg%' THEN 'jpeg'
    WHEN file_type LIKE '%png%' THEN 'png'
    WHEN file_type LIKE '%gif%' THEN 'gif'
    WHEN file_type LIKE '%webp%' THEN 'webp'
    ELSE 'jpeg'
END
WHERE original_format IS NULL;

-- Set original_url same as image_url for existing records (if no original exists)
UPDATE images 
SET original_url = image_url,
    original_file_name = file_name,
    original_file_size = file_size
WHERE original_url IS NULL;