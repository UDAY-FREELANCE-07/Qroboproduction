/**
 * Transactional email templates. Every dynamic value is HTML-escaped; links are built only from
 * APP_URL + fixed paths + URL-encoded tokens/ids, never from user input.
 */
export interface RenderedEmail {
  template: string;
  subject: string;
  html: string;
  text: string;
}

export const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const rupees = (n: number) => `Rs ${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function layout(title: string, bodyHtml: string, cta?: { label: string; url: string }) {
  const button = cta
    ? `<p style="margin:28px 0"><a href="${escapeHtml(cta.url)}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;display:inline-block">${escapeHtml(cta.label)}</a></p>
       <p style="font-size:12px;color:#64748b">If the button does not work, copy this link:<br><span style="word-break:break-all">${escapeHtml(cta.url)}</span></p>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">
    <tr><td style="background:#0f172a;padding:18px 24px;color:#fff;font-size:20px;font-weight:bold">Q<span style="color:#60a5fa">robo</span></td></tr>
    <tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>${bodyHtml}${button}</td></tr>
    <tr><td style="padding:16px 24px;background:#f8fafc;font-size:12px;color:#64748b">Qrobo — electronics, robotics &amp; DIY hardware. You received this email because of activity on your Qrobo account.</td></tr>
  </table></td></tr></table></body></html>`;
}

const p = (s: string) => `<p style="margin:0 0 12px;line-height:1.5">${s}</p>`;

export function verifyEmail(name: string | null, url: string): RenderedEmail {
  return {
    template: 'verify_email',
    subject: 'Verify your Qrobo email address',
    html: layout('Confirm your email', p(`Hi ${escapeHtml(name || 'there')},`) + p('Please confirm this is your email address. The link expires in 24 hours.'), { label: 'Verify email', url }),
    text: `Hi ${name || 'there'},\n\nConfirm your Qrobo email address (link expires in 24 hours):\n${url}\n`,
  };
}

export function resetPassword(name: string | null, url: string): RenderedEmail {
  return {
    template: 'reset_password',
    subject: 'Reset your Qrobo password',
    html: layout('Reset your password', p(`Hi ${escapeHtml(name || 'there')},`) + p('We received a request to reset your password. The link expires in 1 hour and can be used once. If you did not ask for this, you can ignore this email.'), { label: 'Choose a new password', url }),
    text: `Hi ${name || 'there'},\n\nReset your Qrobo password (expires in 1 hour, single use):\n${url}\n\nIf you did not request this, ignore this email.\n`,
  };
}

export function passwordChanged(name: string | null, appUrl: string): RenderedEmail {
  return {
    template: 'password_changed',
    subject: 'Your Qrobo password was changed',
    html: layout('Password changed', p(`Hi ${escapeHtml(name || 'there')},`) + p('Your password was just changed and all other sessions were signed out. If this was not you, reset your password immediately.'), { label: 'Reset password', url: `${appUrl}/forgot-password` }),
    text: `Hi ${name || 'there'},\n\nYour Qrobo password was changed. If this was not you, reset it: ${appUrl}/forgot-password\n`,
  };
}

export function adminAccess(name: string | null, appUrl: string): RenderedEmail {
  return {
    template: 'admin_access',
    subject: 'You now have Qrobo admin access',
    html: layout('Admin access granted', p(`Hi ${escapeHtml(name || 'there')},`) + p('Your verified account now has administrator access to the Qrobo dashboard.'), { label: 'Open admin dashboard', url: `${appUrl}/admin` }),
    text: `Hi ${name || 'there'},\n\nYour account now has Qrobo admin access: ${appUrl}/admin\n`,
  };
}

export interface OrderSummary {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  status: string;
  payment_method: string;
  items: { product_name: string; quantity: number; total: number }[];
}

function itemsTable(o: OrderSummary) {
  const rows = o.items
    .map((i) => `<tr><td style="padding:6px 0">${escapeHtml(i.product_name)} × ${i.quantity}</td><td align="right">${escapeHtml(rupees(i.total))}</td></tr>`)
    .join('');
  const line = (label: string, v: number) => `<tr><td style="padding:4px 0;color:#64748b">${label}</td><td align="right" style="color:#64748b">${escapeHtml(rupees(v))}</td></tr>`;
  return `<table role="presentation" width="100%" style="border-top:1px solid #e2e8f0;margin-top:8px;font-size:14px">${rows}
    ${line('Subtotal', o.subtotal)}${o.discount ? line('Discount', -o.discount) : ''}${line('Shipping', o.shipping_cost)}${line('Tax', o.tax)}
    <tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #e2e8f0">Total</td><td align="right" style="font-weight:bold;border-top:1px solid #e2e8f0">${escapeHtml(rupees(o.total))}</td></tr></table>`;
}

const itemsText = (o: OrderSummary) => o.items.map((i) => `- ${i.product_name} x${i.quantity}: ${rupees(i.total)}`).join('\n');

export function orderConfirmation(name: string | null, o: OrderSummary, appUrl: string): RenderedEmail {
  const pay = o.payment_method === 'cod' ? 'Cash on Delivery — pay when your order arrives.' : 'Online payment.';
  return {
    template: 'order_confirmation',
    subject: `Order confirmed: #${o.order_number}`,
    html: layout(`Thanks for your order, ${name || 'maker'}!`, p(`Order <strong>#${escapeHtml(o.order_number)}</strong> is confirmed. ${escapeHtml(pay)}`) + itemsTable(o), { label: 'View your order', url: `${appUrl}/account?tab=orders` }),
    text: `Order #${o.order_number} is confirmed. ${pay}\n\n${itemsText(o)}\nTotal: ${rupees(o.total)}\n\nView: ${appUrl}/account?tab=orders\n`,
  };
}

const STATUS_COPY: Record<string, string> = {
  confirmed: 'has been confirmed',
  processing: 'is being processed',
  packed: 'has been packed',
  shipped: 'has been shipped',
  out_for_delivery: 'is out for delivery',
  delivered: 'has been delivered',
  cancelled: 'has been cancelled',
  returned: 'has been returned',
  refunded: 'has been refunded',
};

export const NOTIFY_STATUSES = Object.keys(STATUS_COPY);

export function orderStatus(name: string | null, orderNumber: string, status: string, appUrl: string): RenderedEmail {
  const copy = STATUS_COPY[status] ?? `status changed to ${status.replace(/_/g, ' ')}`;
  return {
    template: 'order_status',
    subject: `Order #${orderNumber} ${copy}`,
    html: layout('Order update', p(`Hi ${escapeHtml(name || 'there')},`) + p(`Your order <strong>#${escapeHtml(orderNumber)}</strong> ${escapeHtml(copy)}.`), { label: 'Track your order', url: `${appUrl}/account?tab=orders` }),
    text: `Hi ${name || 'there'},\n\nYour order #${orderNumber} ${copy}.\nTrack: ${appUrl}/account?tab=orders\n`,
  };
}

export function adminNewOrder(o: OrderSummary, customerEmail: string, appUrl: string): RenderedEmail {
  return {
    template: 'admin_new_order',
    subject: `New order #${o.order_number} — ${rupees(o.total)}`,
    html: layout('New order received', p(`<strong>#${escapeHtml(o.order_number)}</strong> from ${escapeHtml(customerEmail)} (${escapeHtml(o.payment_method.toUpperCase())}).`) + itemsTable(o), { label: 'Open in admin', url: `${appUrl}/admin/orders` }),
    text: `New order #${o.order_number} from ${customerEmail}\n\n${itemsText(o)}\nTotal: ${rupees(o.total)}\n${appUrl}/admin/orders\n`,
  };
}

export function testEmail(appUrl: string): RenderedEmail {
  return {
    template: 'test',
    subject: 'Qrobo test email',
    html: layout('Email is working', p('This is a test message from the Qrobo admin dashboard.'), { label: 'Open Qrobo', url: appUrl }),
    text: `This is a test message from the Qrobo admin dashboard. ${appUrl}\n`,
  };
}
