CREATE TABLE IF NOT EXISTS job_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  rated_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rater_role text NOT NULL CHECK (rater_role IN ('GC','SUB')),
  showed_up_as_agreed smallint NOT NULL CHECK (showed_up_as_agreed BETWEEN 1 AND 5),
  completed_agreed_scope smallint NOT NULL CHECK (completed_agreed_scope BETWEEN 1 AND 5),
  quality_right_first_time smallint NOT NULL CHECK (quality_right_first_time BETWEEN 1 AND 5),
  stayed_on_schedule smallint NOT NULL CHECK (stayed_on_schedule BETWEEN 1 AND 5),
  communicated_early smallint NOT NULL CHECK (communicated_early BETWEEN 1 AND 5),
  handled_changes_fairly smallint NOT NULL CHECK (handled_changes_fairly BETWEEN 1 AND 5),
  respected_agreed_budget smallint NOT NULL CHECK (respected_agreed_budget BETWEEN 1 AND 5),
  professional_and_reliable smallint NOT NULL CHECK (professional_and_reliable BETWEEN 1 AND 5),
  trust_with_larger_job smallint NOT NULL CHECK (trust_with_larger_job BETWEEN 1 AND 5),
  work_together_again smallint NOT NULL CHECK (work_together_again BETWEEN 1 AND 5),
  private_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, rated_by_user_id),
  CHECK (rated_by_user_id <> rated_user_id)
);
CREATE INDEX IF NOT EXISTS job_ratings_rated_user_idx ON job_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS job_ratings_job_idx ON job_ratings(job_id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_score integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_score_rating_count integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_score_updated_at timestamptz;
