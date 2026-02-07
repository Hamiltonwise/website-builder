import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Strip HTML tags from user input
function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

// Extract site hostname from Origin or Referer header
// e.g. "http://bright-dental.sites.localhost:7777" → "bright-dental"
function extractHostname(request: NextRequest): string | null {
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  const match = origin.match(/\/\/([^.]+)\.sites\./);
  return match ? match[1] : null;
}

// Build the HTML email body server-side
function buildEmailBody(data: {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  siteName: string;
}): string {
  const { name, phone, email, service, message, siteName } = data;

  const messageRow = message
    ? `<tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">Message</td><td style="padding:10px 0;color:#111827;">${message}</td></tr>`
    : '';

  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#0e8988;color:#fff;padding:24px 32px;border-radius:16px 16px 0 0;">
      <h1 style="margin:0;font-size:22px;">New Appointment Request</h1>
      <p style="margin:8px 0 0;opacity:0.9;font-size:14px;">from ${siteName} landing page</p>
    </div>
    <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr><td style="padding:10px 0;color:#6b7280;width:120px;vertical-align:top;">Name</td><td style="padding:10px 0;color:#111827;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">Phone</td><td style="padding:10px 0;color:#111827;font-weight:600;">${phone}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">Email</td><td style="padding:10px 0;color:#111827;font-weight:600;"><a href="mailto:${email}" style="color:#0e8988;">${email}</a></td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;vertical-align:top;">Service</td><td style="padding:10px 0;color:#111827;font-weight:600;">${service}</td></tr>
        ${messageRow}
      </table>
    </div>
    <p style="margin-top:16px;font-size:12px;color:#9ca3af;text-align:center;">Sent via ${siteName} appointment form</p>
  </div>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, service, message, captchaToken } = body;

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Name, phone, and email are required' }, { status: 400 });
    }

    if (!captchaToken) {
      return NextResponse.json({ error: 'reCAPTCHA verification is required' }, { status: 400 });
    }

    // Verify reCAPTCHA token with Google
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${recaptchaSecret}&response=${captchaToken}`,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
      }
    }

    // Extract hostname to identify the site
    const hostname = extractHostname(request);

    // TODO: Look up site-specific config from DB by hostname
    // e.g. const siteConfig = await getSiteConfig(hostname);
    // For now, use defaults from env vars:
    const recipients = (process.env.CONTACT_FORM_RECIPIENTS || '').split(',').filter(Boolean);
    const fromEmail = process.env.CONTACT_FORM_FROM || '';
    const webhookUrl = process.env.N8N_WEBHOOK_EMAIL || '';

    if (!webhookUrl) {
      console.error('[Contact API] N8N_WEBHOOK_EMAIL not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Sanitize all inputs
    const sanitizedData = {
      name: sanitize(name),
      phone: sanitize(phone),
      email: sanitize(email),
      service: sanitize(service || ''),
      message: sanitize(message || ''),
      siteName: hostname || 'Website',
    };

    // Build email body server-side
    const emailBody = buildEmailBody(sanitizedData);

    // Forward to n8n webhook
    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cc: [],
        bcc: [],
        body: emailBody,
        from: fromEmail,
        subject: `New Appointment Request — ${sanitizedData.name} (${sanitizedData.service})`,
        fromName: sanitizedData.siteName,
        recipients,
      }),
    });

    if (!webhookRes.ok) {
      console.error('[Contact API] Webhook failed:', webhookRes.status, await webhookRes.text());
      return NextResponse.json({ error: 'Failed to send email' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
