-- Fix security warning: Enable leaked password protection
-- This updates the auth configuration to enable leaked password protection
UPDATE auth.config 
SET leaked_password_check = true 
WHERE id = (SELECT id FROM auth.config LIMIT 1);

-- If no config exists, insert it
INSERT INTO auth.config (leaked_password_check) 
SELECT true 
WHERE NOT EXISTS (SELECT 1 FROM auth.config);