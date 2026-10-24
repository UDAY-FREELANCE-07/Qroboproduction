-- QROBO database roles (TEMPLATE - review and run manually as the RDS master user).
-- Never commit real passwords. Replace every <PLACEHOLDER> and generate passwords with a
-- secret manager (e.g. AWS Secrets Manager). Not executed by any script in this repo.
--
--   qrobo_migrator : owns the schema, runs migrations and seeds (used only during deploys).
--   qrobo_app      : used by the running Next.js app. DML only, no DDL, cannot alter schema.

CREATE ROLE qrobo_migrator LOGIN PASSWORD '<MIGRATOR_PASSWORD>';
CREATE ROLE qrobo_app LOGIN PASSWORD '<APP_PASSWORD>';

-- Database <DB_NAME> must already exist (e.g. created by RDS as the initial database).
REVOKE ALL ON DATABASE <DB_NAME> FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE <DB_NAME> TO qrobo_migrator;
GRANT CONNECT ON DATABASE <DB_NAME> TO qrobo_app;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO qrobo_migrator;
GRANT USAGE ON SCHEMA public TO qrobo_app;

-- Tables/sequences created later by qrobo_migrator are usable (DML only) by qrobo_app.
ALTER DEFAULT PRIVILEGES FOR ROLE qrobo_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO qrobo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qrobo_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO qrobo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE qrobo_migrator IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO qrobo_app;

-- Migration bookkeeping is not needed by the app.
-- (Run after the first migration:)
-- REVOKE ALL ON schema_migrations, seed_history FROM qrobo_app;

-- Optional hardening for the app role.
ALTER ROLE qrobo_app SET statement_timeout = '15s';
ALTER ROLE qrobo_app SET idle_in_transaction_session_timeout = '30s';
