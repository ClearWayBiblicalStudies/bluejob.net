CREATE TABLE IF NOT EXISTS bluejob.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES bluejob.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS password_reset_tokens_lookup_idx
  ON bluejob.password_reset_tokens(token_hash) WHERE used_at IS NULL;

INSERT INTO bluejob.user_roles(user_id, role_id)
SELECT u.id, r.id
FROM bluejob.users u
JOIN bluejob.roles r ON r.name = 'ADMIN'
WHERE lower(u.email) = 'director@clearestway.org'
ON CONFLICT DO NOTHING;
