/**
 * Transactional + newsletter email templates.
 *
 * Every dynamic value is HTML-escaped; links are built only from APP_URL + fixed paths +
 * URL-encoded tokens/slugs, and image/tracking URLs are accepted only when they are http(s).
 * Layout uses tables + inline styles so it renders in Gmail, Outlook and phone mail apps.
 */
export interface RenderedEmail {
  template: string;
  subject: string;
  html: string;
  text: string;
}

export const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Returns the URL only if it is an absolute http(s) URL, otherwise null. */
export function safeUrl(u: unknown): string | null {
  if (typeof u !== 'string' || u.length > 1000) return null;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export const rupees = (n: number) => `Rs ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const NAVY = '#0f172a';
const ACCENT = '#facc15';
const BLUE = '#2563eb';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';

interface LayoutOptions {
  /** Hidden preview line shown next to the subject in the inbox. */
  preheader: string;
  title: string;
  body: string;
  cta?: { label: string; url: string };
  appUrl: string;
  /** Marketing emails must carry an unsubscribe link. */
  unsubscribeUrl?: string;
  footerNote?: string;
}

function layout(o: LayoutOptions) {
  const button = o.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr><td style="border-radius:8px;background:${BLUE}">
         <a href="${escapeHtml(o.cta.url)}" style="display:inline-block;padding:13px 26px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px">${escapeHtml(o.cta.label)}</a>
       </td></tr></table>
       <p style="font-size:12px;color:${MUTED};margin:8px 0 0">If the button does not work, copy this link:<br><span style="word-break:break-all">${escapeHtml(o.cta.url)}</span></p>`
    : '';
  const unsub = o.unsubscribeUrl
    ? `<br><a href="${escapeHtml(o.unsubscribeUrl)}" style="color:${MUTED}">Unsubscribe</a> from Qrobo newsletters.`
    : '';
  const note = o.footerNote ?? 'You received this email because of activity on your Qrobo account.';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(o.title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:${NAVY}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BORDER}">
    <tr><td style="background:${NAVY};padding:18px 28px">
      <a href="${escapeHtml(o.appUrl)}" style="text-decoration:none;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:.5px">Q<span style="color:${ACCENT}">ROBO</span></a>
      <div style="color:#94a3b8;font-size:12px;margin-top:2px">Electronics &middot; Robotics &middot; IoT &middot; DIY</div>
    </td></tr>
    <tr><td style="height:4px;background:${ACCENT};line-height:4px;font-size:0">&nbsp;</td></tr>
    <tr><td style="padding:28px">
      <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;color:${NAVY}">${escapeHtml(o.title)}</h1>
      ${o.body}${button}
    </td></tr>
    <tr><td style="padding:18px 28px;background:#f8fafc;border-top:1px solid ${BORDER};font-size:12px;line-height:1.6;color:${MUTED}">
      <strong style="color:${NAVY}">Qrobo</strong> &mdash; components, kits and tools for makers.<br>
      <a href="${escapeHtml(o.appUrl)}/shop" style="color:${BLUE};text-decoration:none">Shop</a> &nbsp;&middot;&nbsp;
      <a href="${escapeHtml(o.appUrl)}/account?tab=orders" style="color:${BLUE};text-decoration:none">My orders</a> &nbsp;&middot;&nbsp;
      <a href="${escapeHtml(o.appUrl)}/learn" style="color:${BLUE};text-decoration:none">Learn</a><br>
      ${escapeHtml(note)}${unsub}
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

const p = (s: string) => `<p style="margin:0 0 12px;line-height:1.6;font-size:15px">${s}</p>`;
const hi = (name: string | null) => p(`Hi ${escapeHtml(name || 'there')},`);
const box = (inner: string, bg = '#f8fafc') =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${bg};border:1px solid ${BORDER};border-radius:10px"><tr><td style="padding:14px 16px;font-size:14px;line-height:1.6">${inner}</td></tr></table>`;
const footerText = (appUrl: string) => `\n--\nQrobo | ${appUrl}\n`;

// ------------------------------------------------------------------ account emails

export function verifyEmail(name: string | null, url: string, appUrl = new URL(url).origin): RenderedEmail {
  return {
    template: 'verify_email',
    subject: 'Verify your Qrobo email address',
    html: layout({
      appUrl,
      preheader: 'One click to confirm your email address.',
      title: 'Confirm your email',
      body: hi(name) + p('Please confirm this is your email address so we can send you order updates. The link expires in 24 hours.'),
      cta: { label: 'Verify email', url },
    }),
    text: `Hi ${name || 'there'},\n\nConfirm your Qrobo email address (link expires in 24 hours):\n${url}\n${footerText(appUrl)}`,
  };
}

export function resetPassword(name: string | null, url: string, appUrl = new URL(url).origin): RenderedEmail {
  return {
    template: 'reset_password',
    subject: 'Reset your Qrobo password',
    html: layout({
      appUrl,
      preheader: 'Use this link within 1 hour to choose a new password.',
      title: 'Reset your password',
      body: hi(name) + p('We received a request to reset your password. The link expires in 1 hour and can be used once.') + p(`If you did not ask for this, you can ignore this email; your password stays the same.`),
      cta: { label: 'Choose a new password', url },
    }),
    text: `Hi ${name || 'there'},\n\nReset your Qrobo password (expires in 1 hour, single use):\n${url}\n\nIf you did not request this, ignore this email.\n${footerText(appUrl)}`,
  };
}

export function passwordChanged(name: string | null, appUrl: string): RenderedEmail {
  return {
    template: 'password_changed',
    subject: 'Your Qrobo password was changed',
    html: layout({
      appUrl,
      preheader: 'Security notice for your Qrobo account.',
      title: 'Password changed',
      body: hi(name) + p('Your password was just changed and all other sessions were signed out.') + box(`<strong>Not you?</strong> Reset your password right away and check your recent orders.`, '#fef2f2'),
      cta: { label: 'Reset password', url: `${appUrl}/forgot-password` },
    }),
    text: `Hi ${name || 'there'},\n\nYour Qrobo password was changed. If this was not you, reset it: ${appUrl}/forgot-password\n${footerText(appUrl)}`,
  };
}

export function adminAccess(name: string | null, appUrl: string): RenderedEmail {
  return {
    template: 'admin_access',
    subject: 'You now have Qrobo admin access',
    html: layout({
      appUrl,
      preheader: 'Your verified account can now manage the store.',
      title: 'Admin access granted',
      body: hi(name) + p('Your verified account now has administrator access to the Qrobo dashboard. New-order alerts and low-stock alerts will be sent to this address.'),
      cta: { label: 'Open admin dashboard', url: `${appUrl}/admin` },
    }),
    text: `Hi ${name || 'there'},\n\nYour account now has Qrobo admin access: ${appUrl}/admin\n${footerText(appUrl)}`,
  };
}

export interface WelcomeCoupon {
  code: string;
  description: string | null;
}

export function welcome(name: string | null, appUrl: string, coupon?: WelcomeCoupon | null): RenderedEmail {
  const couponHtml = coupon
    ? box(
        `<div style="font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">Your welcome offer</div>
         <div style="font-size:26px;font-weight:900;letter-spacing:2px;margin:6px 0;color:${NAVY}">${escapeHtml(coupon.code)}</div>
         <div>${escapeHtml(coupon.description || 'Use this code at checkout.')}</div>`,
        '#fefce8',
      )
    : '';
  const tiles = [
    ['Shop components', 'Arduino, ESP32, sensors, motors and more', '/shop'],
    ['Build a project', 'Step-by-step DIY builds with parts lists', '/projects'],
    ['Learn electronics', 'Beginner-friendly tutorials', '/learn'],
  ]
    .map(([t, d, href]) => `<tr><td style="padding:8px 0;border-bottom:1px solid ${BORDER}"><a href="${escapeHtml(appUrl + href)}" style="color:${BLUE};font-weight:bold;text-decoration:none">${t} &rarr;</a><br><span style="color:${MUTED};font-size:13px">${d}</span></td></tr>`)
    .join('');
  return {
    template: 'welcome',
    subject: `Welcome to Qrobo${name ? `, ${name.split(' ')[0]}` : ''}!`,
    html: layout({
      appUrl,
      preheader: coupon ? `Your welcome code ${coupon.code} is inside.` : 'Your account is ready. Start building.',
      title: `Welcome to Qrobo${name ? `, ${name.split(' ')[0]}` : ''}!`,
      body:
        p('Your email is verified and your account is ready. Here is what you can do next:') +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px">${tiles}</table>` +
        couponHtml,
      cta: { label: 'Start shopping', url: `${appUrl}/shop` },
    }),
    text:
      `Welcome to Qrobo${name ? `, ${name}` : ''}!\n\nYour account is ready.\n- Shop: ${appUrl}/shop\n- Projects: ${appUrl}/projects\n- Learn: ${appUrl}/learn\n` +
      (coupon ? `\nYour welcome code: ${coupon.code} (${coupon.description || 'use at checkout'})\n` : '') +
      footerText(appUrl),
  };
}

// ------------------------------------------------------------------ orders

export interface OrderItemSummary {
  product_name: string;
  quantity: number;
  total: number;
  price?: number;
  image?: string | null;
  slug?: string | null;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
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
  coupon_code?: string | null;
  delivery_method?: string | null;
  shipping_address?: ShippingAddress | null;
  items: OrderItemSummary[];
}

function itemsTable(items: OrderItemSummary[], appUrl: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;font-size:14px">${items
    .map((i) => {
      const img = safeUrl(i.image);
      const name = i.slug
        ? `<a href="${escapeHtml(`${appUrl}/product/${encodeURIComponent(i.slug)}`)}" style="color:${NAVY};text-decoration:none;font-weight:bold">${escapeHtml(i.product_name)}</a>`
        : `<strong>${escapeHtml(i.product_name)}</strong>`;
      return `<tr>
        <td width="64" style="padding:10px 12px 10px 0;border-bottom:1px solid ${BORDER};vertical-align:top">${
          img ? `<img src="${escapeHtml(img)}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid ${BORDER}">` : ''
        }</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};vertical-align:top">${name}<br><span style="color:${MUTED};font-size:13px">Qty ${i.quantity}${i.price !== undefined ? ` &times; ${escapeHtml(rupees(i.price))}` : ''}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${BORDER};vertical-align:top;white-space:nowrap;font-weight:bold">${escapeHtml(rupees(i.total))}</td>
      </tr>`;
    })
    .join('')}</table>`;
}

function totalsTable(o: OrderSummary) {
  const line = (label: string, v: string, strong = false) =>
    `<tr><td style="padding:4px 0;${strong ? `font-weight:bold;font-size:16px;border-top:1px solid ${BORDER};padding-top:10px` : `color:${MUTED}`}">${label}</td><td align="right" style="padding:4px 0;${strong ? `font-weight:bold;font-size:16px;border-top:1px solid ${BORDER};padding-top:10px` : `color:${MUTED}`}">${escapeHtml(v)}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:4px">
    ${line('Subtotal', rupees(o.subtotal))}
    ${o.discount ? line(`Discount${o.coupon_code ? ` (${escapeHtml(o.coupon_code)})` : ''}`, `- ${rupees(o.discount)}`) : ''}
    ${line('Shipping', o.shipping_cost ? rupees(o.shipping_cost) : 'Free')}
    ${line('Tax (GST)', rupees(o.tax))}
    ${line('Total', rupees(o.total), true)}
  </table>`;
}

function addressHtml(a?: ShippingAddress | null) {
  if (!a) return '';
  const lines = [a.fullName, a.addressLine1, a.addressLine2, [a.city, a.state, a.postalCode].filter(Boolean).join(', '), a.country, a.phone ? `Phone: ${a.phone}` : '']
    .filter((l) => l && String(l).trim())
    .map((l) => escapeHtml(l))
    .join('<br>');
  return lines;
}
const addressText = (a?: ShippingAddress | null) =>
  a ? [a.fullName, a.addressLine1, a.addressLine2, [a.city, a.state, a.postalCode].filter(Boolean).join(', '), a.country, a.phone].filter((l) => l && String(l).trim()).join('\n') : '';

const itemsText = (items: OrderItemSummary[]) => items.map((i) => `- ${i.product_name} x${i.quantity}: ${rupees(i.total)}`).join('\n');
const paymentLabel = (m: string) => (m === 'cod' ? 'Cash on Delivery' : m === 'razorpay' ? 'Paid online (Razorpay)' : m);
const deliveryLabel = (d?: string | null) => (d === 'express' ? 'Express delivery (1-2 business days)' : 'Standard delivery (3-7 business days)');

export function orderConfirmation(name: string | null, o: OrderSummary, appUrl: string): RenderedEmail {
  const pay = o.payment_method === 'cod' ? `Please keep <strong>${escapeHtml(rupees(o.total))}</strong> ready to pay when your order arrives.` : 'Your payment has been received.';
  const twoCol = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;line-height:1.6"><tr>
      <td width="50%" style="vertical-align:top;padding-right:8px"><div style="color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Delivering to</div>${addressHtml(o.shipping_address) || '&mdash;'}</td>
      <td width="50%" style="vertical-align:top;padding-left:8px"><div style="color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Payment &amp; delivery</div>${escapeHtml(paymentLabel(o.payment_method))}<br>${escapeHtml(deliveryLabel(o.delivery_method))}</td>
    </tr></table>`;
  return {
    template: 'order_confirmation',
    subject: `Order confirmed: #${o.order_number}`,
    html: layout({
      appUrl,
      preheader: `We have received order #${o.order_number} (${rupees(o.total)}). We will email you when it ships.`,
      title: `Thanks for your order${name ? `, ${name.split(' ')[0]}` : ''}!`,
      body:
        p(`Order <strong>#${escapeHtml(o.order_number)}</strong> is confirmed. We are getting it ready and will email you as soon as it ships.`) +
        box(pay, '#eff6ff') +
        itemsTable(o.items, appUrl) +
        totalsTable(o) +
        twoCol,
      cta: { label: 'View your order', url: `${appUrl}/account?tab=orders` },
    }),
    text:
      `Order #${o.order_number} is confirmed.\n${paymentLabel(o.payment_method)} - ${deliveryLabel(o.delivery_method)}\n\n${itemsText(o.items)}\n` +
      `Subtotal: ${rupees(o.subtotal)}\n${o.discount ? `Discount: -${rupees(o.discount)}\n` : ''}Shipping: ${o.shipping_cost ? rupees(o.shipping_cost) : 'Free'}\nTax: ${rupees(o.tax)}\nTotal: ${rupees(o.total)}\n\n` +
      (o.shipping_address ? `Delivering to:\n${addressText(o.shipping_address)}\n\n` : '') +
      `View: ${appUrl}/account?tab=orders\n${footerText(appUrl)}`,
  };
}

const STATUS_COPY: Record<string, { verb: string; title: string; message: string }> = {
  confirmed: { verb: 'has been confirmed', title: 'Order confirmed', message: 'We have confirmed your order and will start preparing it.' },
  processing: { verb: 'is being processed', title: 'We are preparing your order', message: 'Our team is picking and checking your items.' },
  packed: { verb: 'has been packed', title: 'Your order is packed', message: 'Your items are packed and waiting for the courier.' },
  shipped: { verb: 'has been shipped', title: 'Your order is on the way!', message: 'Your package has left our warehouse.' },
  out_for_delivery: { verb: 'is out for delivery', title: 'Arriving today', message: 'Your package is out for delivery. Please keep your phone reachable.' },
  delivered: { verb: 'has been delivered', title: 'Delivered!', message: 'Your package has been delivered. We hope you enjoy building with it.' },
  cancelled: { verb: 'has been cancelled', title: 'Order cancelled', message: 'Your order has been cancelled. If you paid online, the refund is processed to the original payment method within 5-7 business days.' },
  returned: { verb: 'has been returned', title: 'Return received', message: 'We have received your returned items.' },
  refunded: { verb: 'has been refunded', title: 'Refund issued', message: 'Your refund has been issued. It can take 5-7 business days to reach your account.' },
};

export const NOTIFY_STATUSES = Object.keys(STATUS_COPY);

const TRACK_STEPS: [string, string][] = [
  ['confirmed', 'Confirmed'],
  ['packed', 'Packed'],
  ['shipped', 'Shipped'],
  ['out_for_delivery', 'Out for delivery'],
  ['delivered', 'Delivered'],
];

function progressTracker(status: string) {
  const idx = status === 'processing' ? 0 : TRACK_STEPS.findIndex(([s]) => s === status);
  if (idx < 0) return '';
  const cells = TRACK_STEPS.map(([, label], i) => {
    const done = i <= idx;
    return `<td align="center" width="20%" style="vertical-align:top;font-size:11px;color:${done ? NAVY : MUTED};font-weight:${i === idx ? 'bold' : 'normal'}">
      <div style="width:22px;height:22px;line-height:22px;border-radius:11px;margin:0 auto 6px;background:${done ? '#16a34a' : BORDER};color:#ffffff;font-size:12px;font-weight:bold">${done ? '&#10003;' : i + 1}</div>${label}</td>`;
  }).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 8px"><tr>${cells}</tr></table>`;
}

export interface StatusEmailInput {
  name: string | null;
  orderNumber: string;
  status: string;
  total?: number;
  paymentMethod?: string;
  courier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items?: OrderItemSummary[];
}

export function orderStatus(input: StatusEmailInput, appUrl: string): RenderedEmail {
  const { name, orderNumber, status } = input;
  const copy = STATUS_COPY[status] ?? { verb: `status changed to ${status.replace(/_/g, ' ')}`, title: 'Order update', message: '' };
  const trackUrl = safeUrl(input.trackingUrl);
  const hasTracking = Boolean(input.trackingNumber || input.courier || trackUrl);
  const showTracking = hasTracking && ['shipped', 'out_for_delivery', 'delivered'].includes(status);

  const trackingHtml = showTracking
    ? box(
        `<div style="color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Shipment details</div>
         ${input.courier ? `Courier: <strong>${escapeHtml(input.courier)}</strong><br>` : ''}
         ${input.trackingNumber ? `Tracking number: <strong style="letter-spacing:1px">${escapeHtml(input.trackingNumber)}</strong><br>` : ''}
         ${trackUrl ? `<a href="${escapeHtml(trackUrl)}" style="color:${BLUE};font-weight:bold">Track on courier website &rarr;</a>` : ''}`,
        '#eff6ff',
      )
    : '';
  const codHtml =
    input.paymentMethod === 'cod' && ['shipped', 'out_for_delivery'].includes(status) && input.total
      ? box(`Cash on Delivery: please keep <strong>${escapeHtml(rupees(input.total))}</strong> ready.`, '#fefce8')
      : '';
  const reviewHtml =
    status === 'delivered' && input.items?.some((i) => i.slug)
      ? p('<strong>How did it go?</strong> A quick review helps other makers choose the right parts:') +
        `<ul style="margin:0 0 12px;padding-left:20px;line-height:1.8;font-size:14px">${input.items
          .filter((i) => i.slug)
          .slice(0, 5)
          .map((i) => `<li><a href="${escapeHtml(`${appUrl}/product/${encodeURIComponent(i.slug!)}`)}" style="color:${BLUE}">Review ${escapeHtml(i.product_name)}</a></li>`)
          .join('')}</ul>`
      : '';
  const itemsHtml = input.items?.length && status !== 'delivered' ? itemsTable(input.items, appUrl) : '';

  const ctaUrl = showTracking && trackUrl ? trackUrl : `${appUrl}/account?tab=orders`;
  const textTracking = showTracking
    ? `\n${input.courier ? `Courier: ${input.courier}\n` : ''}${input.trackingNumber ? `Tracking number: ${input.trackingNumber}\n` : ''}${trackUrl ? `Track: ${trackUrl}\n` : ''}`
    : '';

  return {
    template: 'order_status',
    subject: `Order #${orderNumber} ${copy.verb}`,
    html: layout({
      appUrl,
      preheader: `Order #${orderNumber} ${copy.verb}.`,
      title: copy.title,
      body:
        hi(name) +
        p(`Your order <strong>#${escapeHtml(orderNumber)}</strong> ${escapeHtml(copy.verb)}. ${escapeHtml(copy.message)}`) +
        progressTracker(status) +
        trackingHtml +
        codHtml +
        reviewHtml +
        itemsHtml,
      cta: { label: showTracking && trackUrl ? 'Track your package' : 'View your order', url: ctaUrl },
    }),
    text: `Hi ${name || 'there'},\n\nYour order #${orderNumber} ${copy.verb}. ${copy.message}\n${textTracking}\nView: ${appUrl}/account?tab=orders\n${footerText(appUrl)}`,
  };
}

// ------------------------------------------------------------------ admin alerts

export interface AdminCustomer {
  email: string;
  name?: string | null;
}

export function adminNewOrder(o: OrderSummary, customer: AdminCustomer | string, appUrl: string): RenderedEmail {
  const c = typeof customer === 'string' ? { email: customer } : customer;
  const units = o.items.reduce((n, i) => n + i.quantity, 0);
  return {
    template: 'admin_new_order',
    subject: `New order #${o.order_number} - ${rupees(o.total)} (${o.payment_method.toUpperCase()})`,
    html: layout({
      appUrl,
      preheader: `${units} item(s) from ${c.email}. Pack and ship it from the admin dashboard.`,
      title: 'New order received',
      body:
        box(
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.7">
            <tr><td style="color:${MUTED}">Order</td><td align="right"><strong>#${escapeHtml(o.order_number)}</strong></td></tr>
            <tr><td style="color:${MUTED}">Customer</td><td align="right">${escapeHtml(c.name || '')} &lt;${escapeHtml(c.email)}&gt;</td></tr>
            <tr><td style="color:${MUTED}">Payment</td><td align="right">${escapeHtml(paymentLabel(o.payment_method))}</td></tr>
            <tr><td style="color:${MUTED}">Delivery</td><td align="right">${escapeHtml(deliveryLabel(o.delivery_method))}</td></tr>
            <tr><td style="color:${MUTED}">Total</td><td align="right" style="font-size:18px;font-weight:bold">${escapeHtml(rupees(o.total))}</td></tr>
          </table>`,
          '#f0fdf4',
        ) +
        itemsTable(o.items, appUrl) +
        totalsTable(o) +
        (o.shipping_address ? box(`<div style="color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Ship to</div>${addressHtml(o.shipping_address)}`) : ''),
      cta: { label: 'Open in admin', url: `${appUrl}/admin/orders` },
      footerNote: 'You receive new-order alerts as a Qrobo administrator. Turn them off in Admin > My Profile.',
    }),
    text:
      `New order #${o.order_number} from ${c.name ? `${c.name} ` : ''}<${c.email}>\n${paymentLabel(o.payment_method)} - ${deliveryLabel(o.delivery_method)}\n\n${itemsText(o.items)}\nTotal: ${rupees(o.total)}\n\n` +
      (o.shipping_address ? `Ship to:\n${addressText(o.shipping_address)}\n\n` : '') +
      `${appUrl}/admin/orders\n`,
  };
}

export interface LowStockItem {
  name: string;
  sku: string;
  stock: number;
  threshold: number;
}

export function adminLowStock(items: LowStockItem[], appUrl: string): RenderedEmail {
  const out = items.filter((i) => i.stock <= 0).length;
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${BORDER}"><strong>${escapeHtml(i.name)}</strong><br><span style="color:${MUTED};font-size:12px">SKU ${escapeHtml(i.sku)}</span></td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid ${BORDER};white-space:nowrap;font-weight:bold;color:${i.stock <= 0 ? '#dc2626' : '#d97706'}">${i.stock <= 0 ? 'Out of stock' : `${i.stock} left`}</td>
      </tr>`,
    )
    .join('');
  return {
    template: 'admin_low_stock',
    subject: out ? `Out of stock: ${items.find((i) => i.stock <= 0)!.name}${items.length > 1 ? ` (+${items.length - 1} more)` : ''}` : `Low stock: ${items[0].name}${items.length > 1 ? ` (+${items.length - 1} more)` : ''}`,
    html: layout({
      appUrl,
      preheader: `${items.length} product(s) need restocking.`,
      title: out ? 'Products out of stock' : 'Low stock alert',
      body: p('These products dropped to or below their low-stock threshold after a recent order:') + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}</table>`,
      cta: { label: 'Manage products', url: `${appUrl}/admin/products` },
      footerNote: 'You receive stock alerts as a Qrobo administrator.',
    }),
    text: `Low stock alert:\n${items.map((i) => `- ${i.name} (SKU ${i.sku}): ${i.stock <= 0 ? 'OUT OF STOCK' : `${i.stock} left`}`).join('\n')}\n\n${appUrl}/admin/products\n`,
  };
}

// ------------------------------------------------------------------ newsletter

export function newsletterConfirm(confirmUrl: string, appUrl: string): RenderedEmail {
  return {
    template: 'newsletter_confirm',
    subject: 'Confirm your Qrobo newsletter subscription',
    html: layout({
      appUrl,
      preheader: 'One click to start receiving new products, deals and tutorials.',
      title: 'Confirm your subscription',
      body: p('Thanks for signing up! Please confirm that you want to receive Qrobo emails about new products, deals and project tutorials.') + p(`<span style="color:${MUTED};font-size:13px">If you did not sign up, ignore this email and you will not hear from us again.</span>`),
      cta: { label: 'Yes, subscribe me', url: confirmUrl },
      footerNote: 'Someone entered this address in the newsletter form on the Qrobo website.',
    }),
    text: `Confirm your Qrobo newsletter subscription:\n${confirmUrl}\n\nIf you did not sign up, ignore this email.\n${footerText(appUrl)}`,
  };
}

export function newsletterWelcome(appUrl: string, unsubscribeUrl: string): RenderedEmail {
  return {
    template: 'newsletter_welcome',
    subject: "You're subscribed to Qrobo updates",
    html: layout({
      appUrl,
      preheader: 'New arrivals, weekly deals and build guides, straight to your inbox.',
      title: "You're in!",
      body: p('You will now hear from us about new arrivals, weekly deals and new project tutorials. No spam, and you can leave any time.'),
      cta: { label: "See this week's deals", url: `${appUrl}/deals` },
      unsubscribeUrl,
      footerNote: 'You are receiving this because you subscribed to Qrobo newsletters.',
    }),
    text: `You're subscribed to Qrobo updates.\nDeals: ${appUrl}/deals\n\nUnsubscribe: ${unsubscribeUrl}\n`,
  };
}

export function testEmail(appUrl: string): RenderedEmail {
  return {
    template: 'test',
    subject: 'Qrobo test email',
    html: layout({
      appUrl,
      preheader: 'Your email settings work.',
      title: 'Email is working',
      body: p('This is a test message from the Qrobo admin dashboard. Order confirmations, shipping updates and admin alerts will be delivered the same way.'),
      cta: { label: 'Open Qrobo', url: appUrl },
    }),
    text: `This is a test message from the Qrobo admin dashboard. ${appUrl}\n`,
  };
}
