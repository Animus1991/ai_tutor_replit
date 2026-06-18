-- Better Auth tables (used when AUTH_PROVIDER=better-auth).
-- Safe to apply under any auth provider — Clerk/bypass simply leave them empty.

CREATE TABLE IF NOT EXISTS "auth_user" (
  "id" text PRIMARY KEY,
  "email" text NOT NULL,
  "email_verified" boolean NOT NULL DEFAULT false,
  "name" text,
  "image" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_user_email_unique" ON "auth_user" ("email");

CREATE TABLE IF NOT EXISTS "auth_session" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "auth_user"("id") ON DELETE CASCADE,
  "expires_at" timestamptz NOT NULL,
  "token" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_session_token_unique" ON "auth_session" ("token");
CREATE INDEX IF NOT EXISTS "auth_session_user_id_idx" ON "auth_session" ("user_id");

CREATE TABLE IF NOT EXISTS "auth_account" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "auth_user"("id") ON DELETE CASCADE,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamptz,
  "refresh_token_expires_at" timestamptz,
  "scope" text,
  "password" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "auth_account_user_id_idx" ON "auth_account" ("user_id");
CREATE INDEX IF NOT EXISTS "auth_account_provider_idx" ON "auth_account" ("provider_id", "account_id");

CREATE TABLE IF NOT EXISTS "auth_verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "auth_verification_identifier_idx" ON "auth_verification" ("identifier");
