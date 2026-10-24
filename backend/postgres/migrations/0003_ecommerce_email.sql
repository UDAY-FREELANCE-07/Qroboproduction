-- 0003: shipment tracking on orders and a double opt-in newsletter list.
-- Additive only: no existing column, row or constraint is changed.

-- Shipment details entered by an admin when an order ships; shown in the customer's
-- "shipped" email and on the Account > Orders page.
ALTER TABLE orders ADD COLUMN courier text CHECK (courier IS NULL OR length(courier) <= 60);
ALTER TABLE orders ADD COLUMN tracking_number text CHECK (tracking_number IS NULL OR length(tracking_number) <= 80);
ALTER TABLE orders ADD COLUMN tracking_url text CHECK (tracking_url IS NULL OR (length(tracking_url) <= 500 AND tracking_url ~ '^https://'));

-- Newsletter subscribers (also for visitors without an account). Double opt-in:
--   pending      -> confirmation email sent, nothing else is ever sent
--   subscribed   -> confirmed by clicking the link
--   unsubscribed -> one click from any newsletter email
-- Only a SHA-256 hash of the confirmation token is stored. The unsubscribe token is kept as-is
-- because it is put into every newsletter email; it can only unsubscribe that one address.
-- Not exposed through the data gateway.
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email) AND position('@' IN email) > 1),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'subscribed', 'unsubscribed')),
  confirm_token_hash text UNIQUE,
  confirm_expires_at timestamptz,
  unsubscribe_token text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'website',
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
CREATE TRIGGER trg_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
