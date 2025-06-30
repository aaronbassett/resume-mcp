-- Add new columns for key parts and hash
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_first_chars text;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_last_chars text;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_hash text;

-- Make the original key column nullable for transition
ALTER TABLE api_keys ALTER COLUMN key DROP NOT NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);

-- Update existing keys to add first/last chars and hash
-- This is a safe migration that won't affect existing data
DO $$
DECLARE
    key_record RECORD;
BEGIN
    FOR key_record IN SELECT id, key FROM api_keys WHERE key IS NOT NULL AND key_first_chars IS NULL LOOP
        UPDATE api_keys 
        SET 
            key_first_chars = SUBSTRING(key_record.key, 1, 4),
            key_last_chars = SUBSTRING(key_record.key, LENGTH(key_record.key) - 3, 4),
            key_hash = encode(sha256(key_record.key::bytea), 'hex')
        WHERE id = key_record.id;
    END LOOP;
END $$;