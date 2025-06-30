-- Block Position Management Functions
-- This migration adds database functions to handle block position updates in resumes

-- Function to shift block positions when inserting or removing blocks
CREATE OR REPLACE FUNCTION shift_block_positions(
    p_resume_id UUID,
    p_start_position INTEGER,
    p_shift_amount INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE resume_blocks
    SET position = position + p_shift_amount
    WHERE resume_id = p_resume_id
    AND position >= p_start_position;
END;
$$ LANGUAGE plpgsql;

-- Function to reorder a block's position within a resume
CREATE OR REPLACE FUNCTION reorder_block_position(
    p_resume_id UUID,
    p_block_id UUID,
    p_old_position INTEGER,
    p_new_position INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- If moving down (higher position number)
    IF p_new_position > p_old_position THEN
        -- Shift blocks between old and new position up
        UPDATE resume_blocks
        SET position = position - 1
        WHERE resume_id = p_resume_id
        AND position > p_old_position
        AND position <= p_new_position;
    -- If moving up (lower position number)
    ELSIF p_new_position < p_old_position THEN
        -- Shift blocks between new and old position down
        UPDATE resume_blocks
        SET position = position + 1
        WHERE resume_id = p_resume_id
        AND position >= p_new_position
        AND position < p_old_position;
    END IF;
    
    -- Update the block to its new position
    UPDATE resume_blocks
    SET position = p_new_position
    WHERE resume_id = p_resume_id
    AND block_id = p_block_id;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint to prevent duplicate positions within a resume
ALTER TABLE resume_blocks 
ADD CONSTRAINT unique_resume_block_position 
UNIQUE (resume_id, position);

-- Add constraint to prevent duplicate blocks in the same resume
ALTER TABLE resume_blocks 
ADD CONSTRAINT unique_resume_block 
UNIQUE (resume_id, block_id);

-- Function to get the next available position for a resume
CREATE OR REPLACE FUNCTION get_next_block_position(p_resume_id UUID)
RETURNS INTEGER AS $$
DECLARE
    max_position INTEGER;
BEGIN
    SELECT COALESCE(MAX(position), -1) + 1
    INTO max_position
    FROM resume_blocks
    WHERE resume_id = p_resume_id;
    
    RETURN max_position;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION shift_block_positions IS 'Shifts block positions by a given amount starting from a specified position';
COMMENT ON FUNCTION reorder_block_position IS 'Moves a block from one position to another within a resume, adjusting other blocks as needed';
COMMENT ON FUNCTION get_next_block_position IS 'Returns the next available position number for adding a block to a resume';