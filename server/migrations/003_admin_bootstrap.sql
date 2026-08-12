CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id);

INSERT INTO users(email,password_hash,display_name,force_password_change)
VALUES ('director@clearestway.org','','BlueJob Director',true)
ON CONFLICT (email) DO UPDATE
  SET updated_at=now();

INSERT INTO user_roles(user_id,role_id)
SELECT u.id,r.id
FROM users u
JOIN roles r ON r.name='ADMIN'
WHERE u.email='director@clearestway.org'
ON CONFLICT DO NOTHING;
