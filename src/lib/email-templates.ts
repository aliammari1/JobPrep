/**
 * Email Templates for Interview Reminders and Notifications
 */

export interface InterviewEmailData {
  candidateName: string;
  candidateEmail: string;
  position: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  interviewType: "video" | "phone" | "in-person";
  interviewerName?: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
  reschedulingLink?: string;
  googleCalendarLink?: string;
}

/**
 * Reminder Email - Sent 24 hours before interview
 */
export function getReminderEmailTemplate(data: InterviewEmailData): {
  subject: string;
  html: string;
} {
  const meetingDetails = getMeetingDetails(data);
  const calendarEmoji = "📅";
  const clockEmoji = "🕐";
  const videoEmoji = data.interviewType === "video" ? "📹" : "📞";

  return {
    subject: `Reminder: ${data.position} Interview with ${data.position} - ${data.date} at ${data.time}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .details { background: white; padding: 15px; border-left: 4px solid #667eea; margin-bottom: 15px; }
            .detail-row { display: flex; margin-bottom: 10px; }
            .detail-icon { margin-right: 10px; font-size: 18px; }
            .detail-text { flex: 1; }
            .button { background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px; }
            .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
            .badge { background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Reminder 🎯</h1>
              <p>Your ${data.position} interview is coming up!</p>
            </div>

            <div class="content">
              <h2>Hello ${data.candidateName},</h2>
              <p>This is a friendly reminder about your upcoming interview.</p>

              <div class="details">
                <h3 style="margin-top: 0; color: #667eea;">Interview Details</h3>
                
                <div class="detail-row">
                  <div class="detail-icon">${calendarEmoji}</div>
                  <div class="detail-text">
                    <strong>Date:</strong> ${formatDate(data.date)}
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-icon">${clockEmoji}</div>
                  <div class="detail-text">
                    <strong>Time:</strong> ${data.time} (${data.duration} minutes)
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-icon">${videoEmoji}</div>
                  <div class="detail-text">
                    <strong>Type:</strong> ${data.interviewType === "video" ? "Video Interview" : data.interviewType === "phone" ? "Phone Interview" : "In-Person Interview"}
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-icon">👔</div>
                  <div class="detail-text">
                    <strong>Position:</strong> ${data.position}
                  </div>
                </div>

                ${
                  data.interviewerName
                    ? `
                <div class="detail-row">
                  <div class="detail-icon">👨‍💼</div>
                  <div class="detail-text">
                    <strong>Interviewer:</strong> ${data.interviewerName}
                  </div>
                </div>
                `
                    : ""
                }

                ${
                  meetingDetails
                    ? `
                <div class="detail-row">
                  <div class="detail-icon">🔗</div>
                  <div class="detail-text">
                    <strong>Meeting Link:</strong><br/>
                    <a href="${meetingDetails}" style="color: #667eea;">Join Meeting</a>
                  </div>
                </div>
                `
                    : ""
                }

                ${
                  data.location
                    ? `
                <div class="detail-row">
                  <div class="detail-icon">📍</div>
                  <div class="detail-text">
                    <strong>Location:</strong> ${data.location}
                  </div>
                </div>
                `
                    : ""
                }
              </div>

              ${
                data.notes
                  ? `
              <div class="details">
                <h4 style="margin-top: 0;">Additional Notes</h4>
                <p>${data.notes}</p>
              </div>
              `
                  : ""
              }

              <div style="text-align: center; margin-top: 30px;">
                ${
                  data.googleCalendarLink
                    ? `
                <a href="${data.googleCalendarLink}" class="button" style="margin-right: 10px;">Add to Calendar</a>
                `
                    : ""
                }
                ${
                  data.reschedulingLink
                    ? `
                <a href="${data.reschedulingLink}" class="button" style="background: #f0f0f0; color: #333;">Reschedule</a>
                `
                    : ""
                }
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you have any questions, please don't hesitate to reach out. We're looking forward to speaking with you!
              </p>
            </div>

            <div class="footer">
              <p>JobPrep Interview Scheduler • ${new Date().getFullYear()}</p>
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Confirmation Email - Sent when interview is scheduled
 */
export function getConfirmationEmailTemplate(data: InterviewEmailData): {
  subject: string;
  html: string;
} {
  const meetingDetails = getMeetingDetails(data);

  return {
    subject: `Interview Confirmation: ${data.position} - ${data.date}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .content { background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dcfce7; }
            .details { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; border-radius: 4px; }
            .button { background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px; }
            .footer { text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Interview Confirmed!</h1>
              <p>Your interview has been successfully scheduled</p>
            </div>

            <div class="content">
              <h2>Great news, ${data.candidateName}!</h2>
              <p>We're excited to confirm your interview for the <strong>${data.position}</strong> position.</p>

              <div class="details">
                <h3 style="margin-top: 0; color: #10b981;">Interview Details</h3>
                <p><strong>📅 Date:</strong> ${formatDate(data.date)}</p>
                <p><strong>🕐 Time:</strong> ${data.time}</p>
                <p><strong>⏱️ Duration:</strong> ${data.duration} minutes</p>
                <p><strong>📹 Type:</strong> ${data.interviewType === "video" ? "Video" : data.interviewType === "phone" ? "Phone" : "In-Person"}</p>
                ${data.interviewerName ? `<p><strong>👔 Interviewer:</strong> ${data.interviewerName}</p>` : ""}
              </p>
              </div>

              ${
                meetingDetails
                  ? `
              <div class="details">
                <h4>📞 How to Join</h4>
                <p><a href="${meetingDetails}" style="color: #10b981; font-weight: bold;">Click here to join the meeting</a></p>
              </div>
              `
                  : ""
              }

              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>💡 Tips for Success:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Log in 5 minutes early to test your audio/video</li>
                  <li>Use a professional background or quiet space</li>
                  <li>Have any relevant documents ready</li>
                  <li>Dress professionally</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${data.googleCalendarLink || "#"}" class="button">Add to Calendar</a>
              </div>

              <p style="margin-top: 30px; color: #666;">
                If you need to reschedule or have questions, please let us know as soon as possible.
              </p>
            </div>

            <div class="footer">
              <p>JobPrep Interview Scheduler • ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Rescheduling Email - Sent when interview is rescheduled
 */
export function getRescheduleEmailTemplate(
  data: InterviewEmailData & { oldDate: string; oldTime: string },
): {
  subject: string;
  html: string;
} {
  return {
    subject: `Interview Rescheduled: ${data.position} - New Time: ${data.date} ${data.time}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .old-date { background: #fee2e2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ef4444; }
            .new-date { background: #dcfce7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981; }
            .button { background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Interview Rescheduled</h1>
            </div>

            <div>
              <h2>Hi ${data.candidateName},</h2>
              <p>Your interview has been rescheduled. Please see the updated details below:</p>

              <div class="old-date">
                <h4 style="margin-top: 0;">❌ Original Time</h4>
                <p><strong>${formatDate(data.oldDate)}</strong> at <strong>${data.oldTime}</strong></p>
              </div>

              <div class="new-date">
                <h4 style="margin-top: 0;">✅ New Time</h4>
                <p><strong>${formatDate(data.date)}</strong> at <strong>${data.time}</strong></p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.googleCalendarLink || "#"}" class="button">Update Calendar</a>
              </div>

              <p>If this new time doesn't work for you, please reach out immediately to discuss alternatives.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Cancellation Email
 */
export function getCancellationEmailTemplate(data: InterviewEmailData): {
  subject: string;
  html: string;
} {
  return {
    subject: `Interview Cancelled: ${data.position}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .details { background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Cancelled</h1>
            </div>

            <div>
              <h2>Hi ${data.candidateName},</h2>
              
              <div class="details">
                <p>We regret to inform you that your scheduled interview for the <strong>${data.position}</strong> position on <strong>${formatDate(data.date)}</strong> at <strong>${data.time}</strong> has been cancelled.</p>
              </div>

              <p>We apologize for any inconvenience this may cause. If you have questions or would like to reschedule, please contact us.</p>

              <p>We appreciate your understanding and hope to connect with you in the future.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

/**
 * Helper function to format date
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Helper function to get meeting details link
 */
function getMeetingDetails(data: InterviewEmailData): string | null {
  if (data.meetingLink) return data.meetingLink;
  if (data.googleCalendarLink) return data.googleCalendarLink;
  return null;
}
