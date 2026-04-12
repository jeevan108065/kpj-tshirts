// ─── Brevo SMTP Email Service ───
// Uses nodemailer with Brevo's SMTP relay.
// Free tier: 300 emails/day.
//
// Required env vars:
//   BREVO_SMTP_USER     — Brevo SMTP login (e.g. a7e2f3001@smtp-brevo.com)
//   BREVO_SMTP_KEY      — Brevo SMTP key (from Settings > SMTP & API)
//   BREVO_SENDER_EMAIL  — verified sender email in Brevo
//   BREVO_SENDER_NAME   — display name (optional, defaults to "KPJ Garments")

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER || "",
    pass: process.env.BREVO_SMTP_KEY || "",
  },
});

export async function sendEmail({ to, subject, html }) {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
    console.warn("BREVO_SMTP credentials not set — email not sent. Logging instead:");
    console.log(`📧 To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  const info = await transporter.sendMail({
    from: `"${process.env.BREVO_SENDER_NAME || "KPJ Garments"}" <${process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`📧 Email sent to ${to} — messageId: ${info.messageId}`);
  return info;
}

export function passwordResetEmail(resetUrl) {
  return `
    <div style="font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1E3A5F; margin: 0;">KPJ Garments</h2>
      </div>
      <h3 style="color: #1E3A5F; margin-bottom: 8px;">Reset Your Password</h3>
      <p style="color: #5A6F8A; line-height: 1.6;">
        We received a request to reset your password. Click the button below to set a new one.
        This link expires in 30 minutes.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3393E0, #2578B5); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="color: #5A6F8A; font-size: 13px; line-height: 1.5;">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
      <hr style="border: none; border-top: 1px solid #E8F4FD; margin: 24px 0;" />
      <p style="color: #9AA5B4; font-size: 12px; text-align: center;">
        KPJ Garments — Quality T-Shirts & Uniforms
      </p>
    </div>
  `;
}
