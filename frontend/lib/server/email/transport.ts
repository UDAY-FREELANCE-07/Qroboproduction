/**
 * Email transports. `log` never sends anything (development default); `smtp` uses nodemailer
 * (e.g. Gmail with an App Password, Amazon SES SMTP); `resend` calls the Resend HTTP API.
 * Credentials are never logged.
 */
import nodemailer from 'nodemailer';
import type { EmailConfig } from './config';

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendFn = (msg: OutgoingEmail) => Promise<void>;

export function createTransport(cfg: EmailConfig, log: (line: string) => void = console.log): SendFn {
  if (cfg.provider === 'log') {
    return async (msg) => {
      // Only metadata + the plain-text body (contains links) — useful for local testing.
      log(`[email:log] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    };
  }

  if (cfg.provider === 'resend') {
    return async (msg) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: cfg.from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    };
  }

  const smtp = cfg.smtp!;
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465, // 587 upgrades with STARTTLS
    requireTLS: smtp.port !== 465,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return async (msg) => {
    await transporter.sendMail({ from: cfg.from, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text });
  };
}
