/**
 * Send Confirmation Email API
 * POST /api/emails/send-confirmation
 * 
 * Sends interview confirmation emails to candidates when interview is scheduled
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendEmail } from '@/lib/email-service';
import { getConfirmationEmailTemplate } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interviewId } = await req.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Missing interviewId' },
        { status: 400 }
      );
    }

    // Fetch interview
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        candidate: true,
        interviewer: true,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.interviewerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!interview.candidate?.email) {
      return NextResponse.json(
        { error: 'No candidate email found' },
        { status: 400 }
      );
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
    const { subject, html } = getConfirmationEmailTemplate({
      candidateName: interview.candidate.name || 'Candidate',
      candidateEmail: interview.candidate.email,
      position: 'Software Engineer',
      date: formattedDate,
      time: formattedTime,
      duration: interview.duration || 60,
      interviewType: 'video',
      interviewerName: interview.interviewer?.name,
      meetingLink: undefined,
      location: undefined,
    });

    // Send email
    const result = await sendEmail({
      to: interview.candidate.email,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    // Update interview to mark confirmation as sent
    const currentSettings = interview.settings ? JSON.parse(interview.settings) : {};
    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        settings: JSON.stringify({
          ...currentSettings,
          confirmationEmailSent: true,
          confirmationEmailSentAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      message: 'Confirmation email sent successfully',
    });
  } catch (error: any) {
    console.error('Send confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email', details: error.message },
      { status: 500 }
    );
  }
}
