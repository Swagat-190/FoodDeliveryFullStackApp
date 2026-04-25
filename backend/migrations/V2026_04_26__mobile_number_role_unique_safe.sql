-- Safe migration for adding mobile number with role-scoped uniqueness.
-- Run in maintenance window and review duplicate-check query before adding unique index.

-- 1) Add column (nullable first for backward compatibility)
ALTER TABLE users
    ADD COLUMN mobile_number VARCHAR(15) NULL;

-- 2) Backfill existing nulls with deterministic placeholders per role+id
-- Replace these values with real numbers later if needed.
UPDATE users
SET mobile_number = CONCAT('91', LPAD(CAST(id AS CHAR), 10, '0'))
WHERE mobile_number IS NULL OR TRIM(mobile_number) = '';

-- 3) Normalize existing values: keep digits only
UPDATE users
SET mobile_number = REGEXP_REPLACE(mobile_number, '[^0-9]', '');

-- 4) Normalize India local format to 91XXXXXXXXXX
UPDATE users
SET mobile_number = CONCAT('91', mobile_number)
WHERE CHAR_LENGTH(mobile_number) = 10;

-- Optional normalization for 0XXXXXXXXXX -> 91XXXXXXXXXX
UPDATE users
SET mobile_number = CONCAT('91', SUBSTRING(mobile_number, 2))
WHERE CHAR_LENGTH(mobile_number) = 11
  AND mobile_number LIKE '0%';

-- 5) Validate duplicates before adding unique constraint
-- If this returns rows, resolve manually before continuing.
SELECT role, mobile_number, COUNT(*) AS cnt
FROM users
GROUP BY role, mobile_number
HAVING COUNT(*) > 1;

-- 6) Enforce non-null and uniqueness
ALTER TABLE users
    MODIFY COLUMN mobile_number VARCHAR(15) NOT NULL;

ALTER TABLE users
    ADD CONSTRAINT uq_user_role_mobile UNIQUE (role, mobile_number);
