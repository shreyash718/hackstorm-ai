-- Add unique constraint to company_benchmarks to prevent duplicates
DELETE FROM company_benchmarks a
USING company_benchmarks b
WHERE a.id > b.id
AND a.company_name = b.company_name
AND a.role = b.role
AND a.level = b.level;

ALTER TABLE company_benchmarks 
DROP CONSTRAINT IF EXISTS unique_company_role_level;

ALTER TABLE company_benchmarks 
ADD CONSTRAINT unique_company_role_level 
UNIQUE (company_name, role, level);
