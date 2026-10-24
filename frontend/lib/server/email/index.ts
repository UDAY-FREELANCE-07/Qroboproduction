import 'server-only';
import { getPool } from '../db';
import { loadEmailConfig, type EmailConfig } from './config';
import { deliverPending } from './outbox';
import { createTransport, type SendFn } from './transport';

export { enqueueEmail } from './outbox';
export * as templates from './templates';

const g = globalThis as unknown as { __qroboEmail?: { cfg: EmailConfig; send: SendFn }; __qroboEmailBusy?: boolean };

/** Loaded once per process; throws ConfigError on invalid configuration. */
export function emailRuntime() {
  if (!g.__qroboEmail) {
    const cfg = loadEmailConfig();
    g.__qroboEmail = { cfg, send: createTransport(cfg) };
  }
  return g.__qroboEmail;
}

export const appUrl = () => emailRuntime().cfg.appUrl;

/** Test hook. */
export function setEmailRuntimeForTesting(rt: { cfg: EmailConfig; send: SendFn } | undefined) {
  g.__qroboEmail = rt;
}

/** Deliver queued mail in the background after a response is ready. Never throws. */
export function kickOutbox() {
  if (g.__qroboEmailBusy) return;
  g.__qroboEmailBusy = true;
  Promise.resolve()
    .then(() => deliverPending(getPool(), emailRuntime().send))
    .catch((err) => console.error('[email] delivery run failed:', (err as Error).message))
    .finally(() => {
      g.__qroboEmailBusy = false;
    });
}
