/**
 * Email Service with Resend
 *
 * Real email service implementation using Resend.
 * Supports verification, password reset, interview reminders, and more.
 */

import { Resend } from "resend";

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
  scheduledAt?: string; // ISO 8601 format
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  tags,
  scheduledAt,
}: EmailOptions) {
  // Development mode: Log to console
  if (process.env.NODE_ENV === "development" && !resend) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email Service (Development Mode - No Resend Key)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    if (text) console.log(`Text: ${text}`);
    if (replyTo) console.log(`Reply-To: ${replyTo}`);
    if (tags) console.log(`Tags:`, tags);
    if (scheduledAt) console.log(`Scheduled At: ${scheduledAt}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return { success: true, emailId: "dev-" + Date.now() };
  }

  // Production mode: Use Resend
  if (!resend) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html,
      text,
      replyTo,
      tags,
      scheduledAt,
    });

    if (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendBatchEmails(emails: EmailOptions[]) {
  if (!resend) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.batch.send(
      emails.map((email) => ({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        replyTo: email.replyTo,
        tags: email.tags,
      }))
    );

    if (error) {
      console.error("Batch email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Batch email service error:", error);
    return { success: false, error: "Failed to send batch emails" };
  }
}

// Email Templates
export function getVerificationEmailTemplate(
  verificationUrl: string,
  userName?: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Verify Your Email Address</h1>
          ${userName ? `<p>Hi ${userName},</p>` : "<p>Hi there,</p>"}
          <p>Thank you for signing up for JobPrep! Please verify your email address to complete your registration.</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getPasswordResetEmailTemplate(
  resetUrl: string,
  userName?: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Reset Your Password</h1>
          ${userName ? `<p>Hi ${userName},</p>` : "<p>Hi there,</p>"}
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getInterviewReminderEmailTemplate(interviewDetails: {
  position: string;
  date: string;
  time: string;
  interviewUrl: string;
  candidateName?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Interview Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Interview Reminder</h1>
          ${
            interviewDetails.candidateName
              ? `<p>Hi ${interviewDetails.candidateName},</p>`
              : "<p>Hi there,</p>"
          }
          <p>This is a reminder about your upcoming interview:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Position:</strong> ${interviewDetails.position}</p>
            <p><strong>Date:</strong> ${interviewDetails.date}</p>
            <p><strong>Time:</strong> ${interviewDetails.time}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${interviewDetails.interviewUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Interview Room
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Please join 5 minutes early to test your audio and video setup.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function getWelcomeEmailTemplate(userName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to JobPrep</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Welcome to JobPrep! 🎉</h1>
          <p>Hi ${userName},</p>
          <p>We're excited to have you on board! JobPrep helps you ace your interviews with:</p>
          <ul style="line-height: 2;">
            <li>AI-powered mock interviews</li>
            <li>Real-time feedback and coaching</li>
            <li>Live video practice sessions</li>
            <li>Comprehensive performance analytics</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${appUrl}/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Need help? Reply to this email or visit our resource center.
          </p>
        </div>
      </body>
    </html>
  `;
}

// Helper functions for common email flows
export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  userName?: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

  return await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html: getVerificationEmailTemplate(verificationUrl, userName),
    tags: [
      { name: "category", value: "verification" },
      { name: "user_type", value: "new_user" },
    ],
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  return await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: getPasswordResetEmailTemplate(resetUrl, userName),
    tags: [{ name: "category", value: "password_reset" }],
  });
}

export async function sendWelcomeEmail(email: string, userName: string) {
  return await sendEmail({
    to: email,
    subject: "Welcome to JobPrep! 🎉",
    html: getWelcomeEmailTemplate(userName),
    tags: [{ name: "category", value: "welcome" }],
  });
}

export async function scheduleInterviewReminder(
  email: string,
  interviewDetails: {
    position: string;
    date: string;
    time: string;
    interviewUrl: string;
    candidateName?: string;
  },
  sendAt: Date
) {
  return await sendEmail({
    to: email,
    subject: `Interview Reminder: ${interviewDetails.position}`,
    html: getInterviewReminderEmailTemplate(interviewDetails),
    scheduledAt: sendAt.toISOString(),
    tags: [
      { name: "category", value: "interview_reminder" },
      { name: "position", value: interviewDetails.position },
    ],
  });
}
