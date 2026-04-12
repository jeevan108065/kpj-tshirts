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

export function orderConfirmationEmail(order, items) {
  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount_amount || 0);
  const gstPct = Number(order.gst_percent || 0);
  const gstAmt = Number(order.gst_amount || 0);
  const total = Number(order.total_amount || 0);

  const itemRows = (items || []).map((i) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name} (${i.size})</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">₹${(Number(i.price) * Number(i.qty)).toLocaleString("en-IN")}</td>
    </tr>`
  ).join("");

  return `
    <div style="font-family:'Inter','Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
      <div style="text-align:center;margin-bottom:24px">
        <h2 style="color:#1E3A5F;margin:0">KPJ Garments</h2>
        <p style="color:#10B981;font-weight:700;font-size:18px;margin:8px 0">Order Confirmed ✓</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr><td style="color:#5A6F8A;padding:4px 0">Order ID</td><td style="text-align:right;font-weight:600">#${order.id}</td></tr>
        <tr><td style="color:#5A6F8A;padding:4px 0">School</td><td style="text-align:right">${order.school_name || ""}</td></tr>
        <tr><td style="color:#5A6F8A;padding:4px 0">Student</td><td style="text-align:right">${order.student_name} — ${order.student_class}</td></tr>
        <tr><td style="color:#5A6F8A;padding:4px 0">Parent</td><td style="text-align:right">${order.parent_name} (${order.parent_phone})</td></tr>
        <tr><td style="color:#5A6F8A;padding:4px 0">Payment ID</td><td style="text-align:right;font-family:monospace;font-size:12px">${order.razorpay_payment_id || "—"}</td></tr>
      </table>

      <h3 style="color:#1E3A5F;margin:20px 0 8px;font-size:16px">Items</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f0f4f8">
          <th style="padding:8px 12px;text-align:left;font-size:13px;color:#5A6F8A">Item</th>
          <th style="padding:8px 12px;text-align:center;font-size:13px;color:#5A6F8A">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:13px;color:#5A6F8A">Amount</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%;margin-top:16px;border-collapse:collapse">
        <tr><td style="padding:4px 12px;color:#5A6F8A">Subtotal</td><td style="padding:4px 12px;text-align:right">₹${subtotal.toLocaleString("en-IN")}</td></tr>
        ${discount > 0 ? `<tr><td style="padding:4px 12px;color:#10B981">Discount${order.coupon_code ? " (" + order.coupon_code + ")" : ""}</td><td style="padding:4px 12px;text-align:right;color:#10B981">-₹${discount.toLocaleString("en-IN")}</td></tr>` : ""}
        ${gstPct > 0 ? `<tr><td style="padding:4px 12px;color:#5A6F8A">GST (${gstPct}%)</td><td style="padding:4px 12px;text-align:right">₹${gstAmt.toLocaleString("en-IN")}</td></tr>` : ""}
        <tr style="border-top:2px solid #1E3A5F"><td style="padding:8px 12px;font-weight:700;color:#1E3A5F;font-size:16px">Total Paid</td><td style="padding:8px 12px;text-align:right;font-weight:700;color:#3393E0;font-size:16px">₹${total.toLocaleString("en-IN")}</td></tr>
      </table>

      <div style="background:#f0f9f4;border-radius:8px;padding:16px;margin:24px 0;text-align:center">
        <p style="color:#1E3A5F;margin:0;line-height:1.6">
          The uniform will be delivered to the student on <strong>school opening day</strong>.<br/>
          If the school has already opened, please allow up to <strong>1 week</strong> for delivery.
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #E8F4FD;margin:24px 0"/>
      <p style="color:#9AA5B4;font-size:12px;text-align:center">KPJ Garments — Quality T-Shirts & Uniforms<br/>support@kpj.app | +91 80741 75884</p>
    </div>
  `;
}
