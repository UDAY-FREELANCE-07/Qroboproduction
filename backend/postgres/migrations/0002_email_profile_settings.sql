-- 0002: email verification, password reset, notification settings, transactional email outbox.
-- Additive only: no existing column, row or constraint is changed.

-- Email verification state. Existing users stay unverified until they verify.
ALTER TABLE users ADD COLUMN email_verified_at timestamptz;

-- Per-user notification settings (Account > Settings, Admin > My Profile).
ALTER TABLE profiles ADD COLUMN notify_order_updates boolean NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN notify_marketing boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN notify_admin_new_orders boolean NOT NULL DEFAULT true;  -- only used for admins

-- One-time tokens for email links. Only a SHA-256 hash is stored; the raw token is only in the email.
CREATE TABLE email_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_email_tokens_user_purpose ON email_tokens(user_id, purpose);

-- Transactional outbox: messages are inserted in the same transaction as the event (signup,
-- order, status change) and delivered afterwards, so a mail-provider outage never breaks
-- checkout and nothing is lost. Not exposed through the data gateway.
CREATE TABLE email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  template text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  text_body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX idx_email_outbox_pending ON email_outbox(status, next_attempt_at);
