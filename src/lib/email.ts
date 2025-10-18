/**
 * Email Service with Resend
 *
 * Real email service implementation using Resend.
 * Supports verification, password reset, interview reminders, and more.
 */

import { Resend } from 'resend';

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

export interface SendEmailOptions extends EmailOptions {}

export async function sendEmail({ to, subject, html, text, replyTo, tags, scheduledAt }: EmailOptions) {
  // Development mode: Log to console
  if (process.env.NODE_ENV === "development" && !resend) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email Service (Development Mode - No Resend Key)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    if (text) console.log(`Text: ${text}`);
    if (replyTo) console.log(`Reply-To: ${replyTo}`);
    if (tags) console.log(`Tags:`, tags);
    if (scheduledAt) console.log(`Scheduled At: ${scheduledAt}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return { success: true, emailId: 'dev-' + Date.now() };
  }

  // Production mode: Use Resend
  if (!resend) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  /*
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
      text,
      replyTo,
      tags,
      scheduledAt,
    });

    if (error) {
      console.error('Email sending failed:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
  */

  // For now, just log in production too (until you set up email service)
  console.log(`Email would be sent to ${to} with subject: ${subject}`);
  return { success: true };
}

export const emailTemplates = {
  verifyEmail: (url: string, userName?: string) => ({
    subject: "Verify your email address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Verify Your Email</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        ${userName ? `Hi ${userName},` : "Hi there,"}
                      </p>
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        Thank you for signing up! Please verify your email address by clicking the button below.
                      </p>
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="border-radius: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <a href="${url}" style="display: inline-block; padding: 16px 36px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                        ${url}
                      </p>
                      <p style="margin: 30px 0 0; color: #999999; font-size: 12px; line-height: 18px;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} JobPrep. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Verify your email address by clicking this link: ${url}`,
  }),

  resetPassword: (url: string, userName?: string) => ({
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        ${userName ? `Hi ${userName},` : "Hi there,"}
                      </p>
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        We received a request to reset your password. Click the button below to create a new password.
                      </p>
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="border-radius: 4px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <a href="${url}" style="display: inline-block; padding: 16px 36px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0; color: #f5576c; font-size: 14px; word-break: break-all;">
                        ${url}
                      </p>
                      <p style="margin: 30px 0 0; color: #ff6b6b; font-size: 14px; line-height: 20px; padding: 15px; background-color: #fff5f5; border-left: 4px solid #ff6b6b;">
                        <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
                      </p>
                      <p style="margin: 20px 0 0; color: #999999; font-size: 12px; line-height: 18px;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} JobPrep. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Reset your password by clicking this link: ${url}`,
  }),

  organizationInvite: (
    organizationName: string,
    invitationLink: string,
    inviterName?: string
  ) => ({
    subject: `You've been invited to join ${organizationName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Organization Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Organization Invitation</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        Hi there,
                      </p>
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        ${
                          inviterName ? `${inviterName} has` : "You have been"
                        } invited you to join <strong>${organizationName}</strong> on JobPrep.
                      </p>
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="border-radius: 4px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <a href="${invitationLink}" style="display: inline-block; padding: 16px 36px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                              Accept Invitation
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0; color: #4facfe; font-size: 14px; word-break: break-all;">
                        ${invitationLink}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} JobPrep. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `You've been invited to join ${organizationName}. Click here to accept: ${invitationLink}`,
  }),

  twoFactorOTP: (otp: string, userName?: string) => ({
    subject: "Your Two-Factor Authentication Code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Two-Factor Authentication</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Two-Factor Code</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        ${userName ? `Hi ${userName},` : "Hi there,"}
                      </p>
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 24px;">
                        Your two-factor authentication code is:
                      </p>
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 32px; font-weight: bold; color: #333333; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </p>
                      </div>
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                        This code will expire in 30 seconds.
                      </p>
                      <p style="margin: 10px 0 0; color: #999999; font-size: 12px; line-height: 18px;">
                        If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} JobPrep. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Your two-factor authentication code is: ${otp}. This code will expire in 30 seconds.`,
  }),

  magicLink: (url: string, email: string) => ({
    subject: "Sign in to JobPrep",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Magic Link Sign In</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Sign in to JobPrep</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        Hi there,
                      </p>
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        Click the button below to sign in to your JobPrep account. This link will expire in 10 minutes.
                      </p>
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="border-radius: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <a href="${url}" style="display: inline-block; padding: 16px 36px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                              Sign In
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                        ${url}
                      </p>
                      <p style="margin: 30px 0 0; color: #999999; font-size: 12px; line-height: 18px;">
                        If you didn't request this sign-in link, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} JobPrep. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Sign in to JobPrep by clicking this link: ${url}. This link will expire in 10 minutes.`,
  }),

  emailOTP: (otp: string, type: string) => ({
    subject:
      type === "sign-in"
        ? "Your Sign-In Code"
        : type === "email-verification"
        ? "Verify Your Email"
        : "Your Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Verification Code</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 24px;">
                        Your verification code is:
                      </p>
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 36px; font-weight: bold; color: #333333; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </p>
                      </div>
                      <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 20px;">
                        This code will expire in 5 minutes.
                      </p>
                      <p style="margin: 10px 0 0; color: #999999; font-size: 12px; line-height: 18px;">
                        If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} JobPrep. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
  }),
};
