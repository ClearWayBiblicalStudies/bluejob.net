CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'WORKER' CHECK (role IN ('WORKER','CONTRACTOR','ADMIN','SUPER_ADMIN')),
  organization_id uuid REFERENCES organizations(id),
  onboarding_path text,
  force_password_change boolean NOT NULL DEFAULT false,
  membership_status text NOT NULL DEFAULT 'NONE',
  membership_started_at timestamptz,
  membership_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_path text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'NONE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_started_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expires_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE users
SET display_name = COALESCE(NULLIF(display_name, ''), NULLIF(name, ''), split_part(email, '@', 1))
WHERE COALESCE(display_name, '') = '';

DO $$ BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('WORKER','CONTRACTOR','ADMIN','SUPER_ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

INSERT INTO roles(name)
VALUES ('WORKER'), ('CONTRACTOR'), ('ADMIN'), ('SUPER_ADMIN')
ON CONFLICT(name) DO NOTHING;

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  mfa_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id, expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti text PRIMARY KEY,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS revoked_tokens_expires_idx ON revoked_tokens(expires_at);

CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'phone')),
  target text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verification_codes_lookup ON verification_codes(user_id, type, expires_at);
