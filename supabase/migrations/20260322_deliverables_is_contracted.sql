-- Add is_contracted boolean to deliverables table
-- Tracks whether a deliverable is contracted (sponsored) vs organic

ALTER TABLE deliverables
  ADD COLUMN IF NOT EXISTS is_contracted boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN deliverables.is_contracted IS
  'true = contracted/paid deliverable, false = organic content';
