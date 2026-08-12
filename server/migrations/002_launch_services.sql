ALTER TABLE bluejob.jobs ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
ALTER TABLE bluejob.jobs ADD COLUMN IF NOT EXISTS eligible_matches integer NOT NULL DEFAULT 0;
ALTER TABLE bluejob.jobs ADD COLUMN IF NOT EXISTS response_signal text NOT NULL DEFAULT 'INSUFFICIENT_DATA';
ALTER TABLE bluejob.users ADD COLUMN IF NOT EXISTS onboarding_path text;
ALTER TABLE bluejob.companies ADD COLUMN IF NOT EXISTS slug text UNIQUE;
