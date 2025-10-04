import * as nodemailer from "nodemailer";

const APP_NAME = process.env.APP_NAME || "MyApp";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Reusable email template
function emailTemplate({
  title,
  message,
  actionText,
  actionUrl,
}: {
  title: string;
  message: string;
  actionText: string;
  actionUrl: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
    <h2 style="color: #333; text-align:center;">${APP_NAME}</h2>
    <h3 style="color: #444;">${title}</h3>
    <p style="color: #555;">${message}</p>
    <p style="text-align:center; margin: 24px 0;">
      <a href="${actionUrl}" style="display:inline-block; padding: 12px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        ${actionText}
      </a>
    </p>
    <p style="color: #777; font-size: 12px;">If you did not request this, please ignore this email.</p>
    <p style="color: #777; font-size: 12px;">&copy; ${new Date().getFullYear()} <a href="${APP_URL}" style="color:#2563eb; text-decoration:none;">${APP_NAME}</a></p>
  </div>
  `;
}

// Send Verification Email
export async function sendVerificationLink({
  to,
  subject,
  url,
}: {
  to: string;
  subject: string;
  url: string;
}) {
  await transporter.sendMail({
    to,
    subject,
    html: emailTemplate({
      title: "Verify your email address",
      message: "Click the button below to verify your email address.",
      actionText: "Verify Email",
      actionUrl: url,
    }),
  });
}

// Send Reset Password Email
export async function sendResetLink({
  to,
  subject,
  url,
}: {
  to: string;
  subject: string;
  url: string;
}) {
  await transporter.sendMail({
    to,
    subject,
    html: emailTemplate({
      title: "Reset your password",
      message: "Click the button below to reset your password.",
      actionText: "Reset Password",
      actionUrl: url,
    }),
  });
}
