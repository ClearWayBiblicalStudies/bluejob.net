ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'NONE'
  CHECK (membership_status IN ('NONE','TRIAL','ACTIVE','PAST_DUE','CANCELED','EXPIRED','COMPED'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_started_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at timestamptz;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'users'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('WORKER','CONTRACTOR','ADMIN','SUPER_ADMIN'));
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
