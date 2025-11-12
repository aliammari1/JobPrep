/**
 * Send Reminder Email API
 * POST /api/emails/send-reminder
 * 
 * Sends interview reminder emails to candidates 24 hours before scheduled time
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendEmail } from '@/lib/email-service';
import { getReminderEmailTemplate } from '@/lib/email-templates';

/**
 * Send interview reminder emails for the authenticated interviewer.
 *
 * Validates input, fetches interviews belonging to the authenticated user, sends reminder emails to each candidate, updates interview records when reminders are sent, and returns a summary of per-interview results.
 *
 * @param req - The incoming NextRequest containing a JSON body with `interviewIds: string[]`.
 * @returns A JSON object on success: `{ success: true, sent: number, failed: number, details: Array<{ interviewId: string, success: boolean, error?: string }>, message: string }`. Returns error JSON with appropriate HTTP status for unauthorized (401), bad request (400), not found (404), or server error (500).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interviewIds } = await req.json();

    if (!Array.isArray(interviewIds) || interviewIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid interviewIds array' },
        { status: 400 }
      );
    }

    // Fetch interviews with candidate info
    const interviews = await prisma.interview.findMany({
      where: {
        id: { in: interviewIds },
        interviewerId: session.user.id,
      },
      include: {
        candidate: true,
      },
    });

    if (interviews.length === 0) {
      return NextResponse.json(
        { error: 'No interviews found' },
        { status: 404 }
      );
    }

    const emailResults: Array<{
      interviewId: string;
      success: boolean;
      error?: string;
    }> = [];

    // Send reminder emails
    for (const interview of interviews) {
      try {
        if (!interview.candidate?.email) {
          emailResults.push({
            interviewId: interview.id,
            success: false,
            error: 'No candidate email found',
          });
          continue;
        }

        // Parse scheduled date
        const scheduledDate = interview.scheduledAt || new Date();
        const formattedDate = scheduledDate.toISOString().split('T')[0];
        const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        // Get email template
        const { subject, html } = getReminderEmailTemplate({
          candidateName: interview.candidate.name || 'Candidate',
          candidateEmail: interview.candidate.email,
          position: 'Software Engineer',
          date: formattedDate,
          time: formattedTime,
          duration: interview.duration || 60,
          interviewType: 'video',
          interviewerName: undefined,
          meetingLink: undefined,
          location: undefined,
          notes: undefined,
        });

        // Send email
        const result = await sendEmail({
          to: interview.candidate.email,
          subject,
          html,
        });

        if (result.success) {
          // Update interview to mark reminder as sent
          await prisma.interview.update({
            where: { id: interview.id },
            data: {
              settings: JSON.stringify({
                reminderSent: true,
                reminderSentAt: new Date().toISOString(),
              }),
            },
          });

          emailResults.push({
            interviewId: interview.id,
            success: true,
          });
        } else {
          emailResults.push({
            interviewId: interview.id,
            success: false,
            error: result.error,
          });
        }
      } catch (error: any) {
        emailResults.push({
          interviewId: interview.id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = emailResults.filter((r) => r.success).length;
    const failureCount = emailResults.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      details: emailResults,
      message: `Sent ${successCount} reminder${successCount !== 1 ? 's' : ''}${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
    });
  } catch (error: any) {
    console.error('Send reminder email error:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder emails', details: error.message },
      { status: 500 }
    );
  }
}