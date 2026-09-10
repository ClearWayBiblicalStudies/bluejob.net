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
SET name = COALESCE(NULLIF(name, ''), split_part(email, '@', 1))
WHERE COALESCE(name, '') = '';

UPDATE users
SET display_name = COALESCE(NULLIF(display_name, ''), NULLIF(name, ''), split_part(email, '@', 1))
WHERE COALESCE(display_name, '') = '';

UPDATE users
SET force_password_change = false
WHERE force_password_change IS NULL AND COALESCE(BTRIM(password_hash), '') <> '';

UPDATE users
SET password_hash = encode(digest(gen_random_uuid()::text, 'sha256'), 'hex'),
    force_password_change = true,
    updated_at = now()
WHERE COALESCE(BTRIM(password_hash), '') = '';

UPDATE users
SET role = 'WORKER'
WHERE role IS NULL OR role NOT IN ('WORKER', 'CONTRACTOR', 'ADMIN', 'SUPER_ADMIN');

UPDATE users
SET email_verified = false
WHERE email_verified IS NULL;

UPDATE users
SET phone_verified = false
WHERE phone_verified IS NULL;

UPDATE users
SET mfa_enabled = false
WHERE mfa_enabled IS NULL;

UPDATE users
SET membership_status = 'NONE'
WHERE membership_status IS NULL OR membership_status NOT IN ('NONE', 'TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'COMPED');

UPDATE users
SET created_at = now()
WHERE created_at IS NULL;

UPDATE users
SET updated_at = now()
WHERE updated_at IS NULL;

ALTER TABLE users ALTER COLUMN name SET DEFAULT '';
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN display_name SET DEFAULT '';
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'WORKER';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN force_password_change SET DEFAULT false;
ALTER TABLE users ALTER COLUMN force_password_change SET NOT NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN phone_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN phone_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN mfa_enabled SET DEFAULT false;
ALTER TABLE users ALTER COLUMN mfa_enabled SET NOT NULL;
ALTER TABLE users ALTER COLUMN membership_status SET DEFAULT 'NONE';
ALTER TABLE users ALTER COLUMN membership_status SET NOT NULL;
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('WORKER','CONTRACTOR','ADMIN','SUPER_ADMIN'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_membership_status_check;
  ALTER TABLE users ADD CONSTRAINT users_membership_status_check CHECK (membership_status IN ('NONE', 'TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'COMPED'));
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

UPDATE sessions
SET created_at = now()
WHERE created_at IS NULL;

UPDATE sessions
SET expires_at = COALESCE(expires_at, now())
WHERE expires_at IS NULL;

ALTER TABLE sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE sessions ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id, expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

UPDATE password_reset_tokens
SET created_at = now()
WHERE created_at IS NULL;

ALTER TABLE password_reset_tokens ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE password_reset_tokens ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE password_reset_tokens ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE password_reset_tokens ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE password_reset_tokens ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti text PRIMARY KEY,
  expires_at timestamptz NOT NULL
);

UPDATE revoked_tokens
SET expires_at = now()
WHERE expires_at IS NULL;

ALTER TABLE revoked_tokens ALTER COLUMN expires_at SET NOT NULL;

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

UPDATE verification_codes
SET created_at = now()
WHERE created_at IS NULL;

ALTER TABLE verification_codes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE verification_codes ALTER COLUMN type SET NOT NULL;
ALTER TABLE verification_codes ALTER COLUMN target SET NOT NULL;
ALTER TABLE verification_codes ALTER COLUMN code_hash SET NOT NULL;
ALTER TABLE verification_codes ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE verification_codes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE verification_codes ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS verification_codes_lookup ON verification_codes(user_id, type, expires_at);
