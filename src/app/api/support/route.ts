import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendSupportEmail, sendSupportConfirmationEmail } from '@/lib/email';
import { z } from 'zod';

const supportSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { subject, message, email, name } = supportSchema.parse(body);

    // Use logged-in user info or provided info
    const fromEmail = user?.email || email || 'unknown@example.com';
    const fromName = user?.username || name || 'Anonymous User';

    if (!fromEmail || fromEmail === 'unknown@example.com') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate ticket ID
    const ticketId = `T${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Send to support
    try {
      await sendSupportEmail(fromEmail, fromName, subject, message);
    } catch (error) {
      console.error('Failed to send support email:', error);
      return NextResponse.json(
        { error: 'Failed to send support request. Please try again later.' },
        { status: 500 }
      );
    }

    // Send confirmation to user
    try {
      await sendSupportConfirmationEmail(fromEmail, ticketId);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Continue even if confirmation fails
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Support request submitted successfully. You will receive a confirmation email shortly.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Support request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

