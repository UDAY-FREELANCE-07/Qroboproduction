/**
 * Email configuration (server-only values; nothing here is NEXT_PUBLIC_).
 *
 *   EMAIL_PROVIDER = log | smtp | resend   (default: log — prints emails to the server log, sends nothing)
 *   EMAIL_FROM     = "Qrobo <no-reply@your-domain>"   required for smtp/resend
 *   APP_URL        = https://your-domain              used to build links in emails
 *   ADMIN_EMAILS   = comma-separated addresses that become admins once they VERIFY their email
 *   smtp:   SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS
 *   resend: RESEND_API_KEY
 */
import { ConfigError } from '../config';

type Env = Record<string, string | undefined>;

export type EmailProvider = 'log' | 'smtp' | 'resend';

export interface EmailConfig {
  provider: EmailProvider;
  from: string;
  appUrl: string;
  smtp?: { host: string; port: number; user: string; pass: string };
  resendApiKey?: string;
}

const PLACEHOLDER = /your[-_]|change[-_]?me|placeholder|example\.(com|org)/i;

function required(env: Env, key: string): string {
  const v = env[key]?.trim();
  if (!v || PLACEHOLDER.test(v)) throw new ConfigError(`${key} must be set for EMAIL_PROVIDER=${env.EMAIL_PROVIDER}.`);
  return v;
}

export function loadEmailConfig(env: Env = process.env): EmailConfig {
  const provider = (env.EMAIL_PROVIDER?.trim().toLowerCase() || 'log') as EmailProvider;
  if (!['log', 'smtp', 'resend'].includes(provider)) {
    throw new ConfigError('EMAIL_PROVIDER must be "log", "smtp" or "resend".');
  }
  const appUrl = (env.APP_URL?.trim() || 'http://localhost:3000').replace(/\/+$/, '');
  if (!/^https?:\/\//.test(appUrl)) throw new ConfigError('APP_URL must start with http:// or https://.');
  if (env.NODE_ENV === 'production' && provider !== 'log' && !appUrl.startsWith('https://')) {
    throw new ConfigError('APP_URL must use https:// in production.');
  }

  if (provider === 'log') return { provider, from: env.EMAIL_FROM?.trim() || 'Qrobo <no-reply@localhost>', appUrl };

  const from = required(env, 'EMAIL_FROM');
  if (provider === 'resend') return { provider, from, appUrl, resendApiKey: required(env, 'RESEND_API_KEY') };

  const port = Number(env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ConfigError('SMTP_PORT must be a valid port.');
  return {
    provider,
    from,
    appUrl,
    smtp: { host: required(env, 'SMTP_HOST'), port, user: required(env, 'SMTP_USER'), pass: required(env, 'SMTP_PASS') },
  };
}

/** Lower-cased admin bootstrap list. These accounts are promoted only after verifying their email. */
export function adminEmails(env: Env = process.env): string[] {
  return (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes('@'));
}
