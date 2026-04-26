import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// ---------------------------------------------------------------------------
// HTML templates
// ---------------------------------------------------------------------------

function buildRegistrationHtml(name, regId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmed — Kalam Conclave 2.0</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0d1526;border:1px solid #1e3a5f;border-radius:12px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background:linear-gradient(135deg,#0a0f1e 0%,#1a2a4a 100%);padding:32px 40px;text-align:center;border-bottom:2px solid #c9a84c;">
              <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;">A.P.J. Abdul Kalam Technical Fest</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Kalam Conclave 2.0</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#94a3b8;font-style:italic;">Science In the Shadow of War</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px 0;font-size:22px;color:#60a5fa;">You&rsquo;re Registered! 🎉</h2>
              <p style="margin:0 0 24px 0;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${name}</strong>, your registration has been received successfully.</p>
              <div style="background:#0a0f1e;border:1px dashed #c9a84c;border-radius:8px;padding:16px 20px;margin-bottom:28px;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Your Registration ID</p>
                <p style="margin:0;font-size:24px;font-weight:700;color:#c9a84c;letter-spacing:4px;">${regId}</p>
                <p style="margin:8px 0 0 0;font-size:11px;color:#64748b;">Keep this ID safe — you will need it at the venue</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3a5f;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#60a5fa;">📅 Date &amp; Time</span><br/>
                    <span style="color:#e2e8f0;font-size:15px;">28th April 2026 &nbsp;|&nbsp; 10:00 AM Onwards</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3a5f;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#60a5fa;">📍 Venue</span><br/>
                    <span style="color:#e2e8f0;font-size:15px;">MultiPurpose Hall, A-Block<br/>K.R. Mangalam University</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#60a5fa;">🎯 Theme</span><br/>
                    <span style="color:#e2e8f0;font-size:15px;font-style:italic;">Science In the Shadow of War</span>
                  </td>
                </tr>
              </table>
              <div style="background:#1e3a5f;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;font-size:13px;color:#fcd34d;font-weight:600;">⏳ Payment Verification Pending</p>
                <p style="margin:6px 0 0 0;font-size:13px;color:#94a3b8;">Your payment is currently being reviewed. You will receive a final confirmation once it is verified by our team. Please bring your transaction proof and this registration ID to the event.</p>
              </div>
              <div style="text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 12px 0;font-size:14px;color:#94a3b8;">Join our official WhatsApp group for updates, schedules, and announcements:</p>
                <a href="https://chat.whatsapp.com/EMJS5MYaNNk63UI1y73NER?mode=gi_t" style="display:inline-block;background:#25d366;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">💬 Join WhatsApp Group</a>
              </div>
              <p style="margin:0;font-size:13px;color:#64748b;">If you have any questions, contact us on Instagram <strong style="color:#60a5fa;">@kalamconclave</strong>.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#060c18;padding:20px 40px;text-align:center;border-top:1px solid #1e3a5f;">
              <p style="margin:0;font-size:12px;color:#475569;">© 2026 Kalam Conclave 2.0 · K.R. Mangalam University</p>
              <p style="margin:4px 0 0 0;font-size:11px;color:#334155;">This is an automated confirmation. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildVerifiedHtml(name, regId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Verified — Kalam Conclave 2.0</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0d1526;border:1px solid #1e3a5f;border-radius:12px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background:linear-gradient(135deg,#0a0f1e 0%,#1a2a4a 100%);padding:32px 40px;text-align:center;border-bottom:2px solid #c9a84c;">
              <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;">A.P.J. Abdul Kalam Technical Fest</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Kalam Conclave 2.0</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#94a3b8;font-style:italic;">Science In the Shadow of War</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px 0;font-size:22px;color:#22c55e;">Payment Verified! ✅</h2>
              <p style="margin:0 0 24px 0;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${name}</strong>, your payment has been verified by our team. You are officially confirmed for Kalam Conclave 2.0!</p>
              <div style="background:#0a0f1e;border:1px dashed #c9a84c;border-radius:8px;padding:16px 20px;margin-bottom:28px;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Your Registration ID</p>
                <p style="margin:0;font-size:24px;font-weight:700;color:#c9a84c;letter-spacing:4px;">${regId}</p>
                <p style="margin:8px 0 0 0;font-size:11px;color:#64748b;">Keep this ID safe — you will need it at the venue</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3a5f;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#60a5fa;">📅 Date &amp; Time</span><br/>
                    <span style="color:#e2e8f0;font-size:15px;">28th April 2026 &nbsp;|&nbsp; 10:00 AM Onwards</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3a5f;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#60a5fa;">📍 Venue</span><br/>
                    <span style="color:#e2e8f0;font-size:15px;">MultiPurpose Hall, A-Block<br/>K.R. Mangalam University</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#60a5fa;">🎯 Theme</span><br/>
                    <span style="color:#e2e8f0;font-size:15px;font-style:italic;">Science In the Shadow of War</span>
                  </td>
                </tr>
              </table>
              <div style="background:#14532d;border-left:4px solid #22c55e;border-radius:4px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;font-size:13px;color:#86efac;font-weight:600;">✅ Payment Confirmed</p>
                <p style="margin:6px 0 0 0;font-size:13px;color:#94a3b8;">Your spot is confirmed. Please bring a valid photo ID and your Registration ID to the event. We look forward to seeing you!</p>
              </div>
              <div style="text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 12px 0;font-size:14px;color:#94a3b8;">Join our official WhatsApp group for updates, schedules, and announcements:</p>
                <a href="https://chat.whatsapp.com/EMJS5MYaNNk63UI1y73NER?mode=gi_t" style="display:inline-block;background:#25d366;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">💬 Join WhatsApp Group</a>
              </div>
              <p style="margin:0;font-size:13px;color:#64748b;">If you have any questions, contact us on Instagram <strong style="color:#60a5fa;">@kalamconclave</strong>.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#060c18;padding:20px 40px;text-align:center;border-top:1px solid #1e3a5f;">
              <p style="margin:0;font-size:12px;color:#475569;">© 2026 Kalam Conclave 2.0 · K.R. Mangalam University</p>
              <p style="margin:4px 0 0 0;font-size:11px;color:#334155;">This is an automated confirmation. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Send helpers
// ---------------------------------------------------------------------------

function assertConfig() {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error(
      'EmailJS is not configured. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env file.',
    )
  }
}

/**
 * Send the initial registration confirmation email.
 * @param {string} name
 * @param {string} email
 * @param {string} regId
 */
export async function sendRegistrationEmail(name, email, regId) {
  assertConfig()
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_name: name,
      to_email: email,
      subject: `✅ Registration Confirmed — Kalam Conclave 2.0 [${regId}]`,
      message_html: buildRegistrationHtml(name, regId),
    },
    PUBLIC_KEY,
  )
}

/**
 * Send the payment-verified confirmation email.
 * @param {string} name
 * @param {string} email
 * @param {string} regId
 */
export async function sendVerificationEmail(name, email, regId) {
  assertConfig()
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_name: name,
      to_email: email,
      subject: `✅ Payment Verified — Kalam Conclave 2.0 [${regId}]`,
      message_html: buildVerifiedHtml(name, regId),
    },
    PUBLIC_KEY,
  )
}
