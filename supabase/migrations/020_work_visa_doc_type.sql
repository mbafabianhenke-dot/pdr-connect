-- Add WORK_VISA to the doc_type enum so technicians can upload their approved
-- Australia Subclass 400 work visa to their profile (Documents → Work Visa).
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'WORK_VISA';
