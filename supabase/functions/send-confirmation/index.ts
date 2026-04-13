import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, reg_id } = await req.json()

    if (!name || !email || !reg_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, reg_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY secret is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const html = `
<!DOCTYPE html>
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

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a0f1e 0%,#1a2a4a 100%);padding:32px 40px;text-align:center;border-bottom:2px solid #c9a84c;">
              <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;">A.P.J. Abdul Kalam Technical Fest</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Kalam Conclave 2.0</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#94a3b8;font-style:italic;">Science In the Shadow of War</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px 0;font-size:22px;color:#60a5fa;">You&rsquo;re Registered! 🎉</h2>
              <p style="margin:0 0 24px 0;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${name}</strong>, your registration has been received successfully.</p>

              <!-- ID Box -->
              <div style="background:#0a0f1e;border:1px dashed #c9a84c;border-radius:8px;padding:16px 20px;margin-bottom:28px;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Your Registration ID</p>
                <p style="margin:0;font-size:24px;font-weight:700;color:#c9a84c;letter-spacing:4px;">${reg_id}</p>
                <p style="margin:8px 0 0 0;font-size:11px;color:#64748b;">Keep this ID safe — you will need it at the venue</p>
              </div>

              <!-- Event Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3a5f;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#60a5fa;">📅 Date &amp; Time</span><br/>
                    <span style="color:#e2e8f0;font-size:15px;">21st April 2026 &nbsp;|&nbsp; 10:00 AM Onwards</span>
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

              <!-- Status Note -->
              <div style="background:#1e3a5f;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;font-size:13px;color:#fcd34d;font-weight:600;">⏳ Payment Verification Pending</p>
                <p style="margin:6px 0 0 0;font-size:13px;color:#94a3b8;">Your payment is currently being reviewed. You will receive a final confirmation once it is verified by our team. Please bring your transaction proof and this registration ID to the event.</p>
              </div>

              <!-- WhatsApp CTA -->
              <div style="text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 12px 0;font-size:14px;color:#94a3b8;">Join our official WhatsApp group for updates, schedules, and announcements:</p>
                <a href="https://chat.whatsapp.com/EMJS5MYaNNk63UI1y73NER?mode=gi_t"
                   style="display:inline-block;background:#25d366;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
                  💬 Join WhatsApp Group
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#64748b;">If you have any questions, reply to this email or contact us on Instagram <strong style="color:#60a5fa;">@kalamconclave</strong>.</p>
            </td>
          </tr>

          <!-- Footer -->
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

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kalam Conclave 2.0 <noreply@kalamconclave.org>',
        to: [email],
        subject: `✅ Registration Confirmed — Kalam Conclave 2.0 [${reg_id}]`,
        html,
      }),
    })

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text()
      console.error('Resend API error:', resendResponse.status, errorBody)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', detail: errorBody }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const result = await resendResponse.json()
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
