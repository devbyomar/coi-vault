import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const emailFrom = process.env.EMAIL_FROM || "COI Vault <noreply@coivault.com>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    console.log(html);
    return;
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function buildExpiryReminderEmail(
  orgName: string,
  documents: { title: string; vendorName: string; expiryDate: Date }[]
): { subject: string; html: string } {
  const docRows = documents
    .map(
      (d) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${d.vendorName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${d.title}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;color:#dc2626;">${d.expiryDate.toLocaleDateString()}</td>
        </tr>`
    )
    .join("");

  return {
    subject: `⚠️ COI Vault: ${documents.length} document(s) expiring soon`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1e40af;">COI Vault — Expiry Reminder</h2>
        <p>Hi <strong>${orgName}</strong> team,</p>
        <p>The following vendor documents are expiring within 7 days:</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:8px;text-align:left;">Vendor</th>
              <th style="padding:8px;text-align:left;">Document</th>
              <th style="padding:8px;text-align:left;">Expiry</th>
            </tr>
          </thead>
          <tbody>${docRows}</tbody>
        </table>
        <p style="margin-top:16px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="background:#1e40af;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
            View Dashboard
          </a>
        </p>
        <p style="color:#6b7280;font-size:12px;margin-top:24px;">
          This is an automated reminder from COI Vault. No insurance or legal advice is provided.
        </p>
      </div>
    `,
  };
}
