import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';

const JWT_SECRET = config.auth.jwtSecret || 'fallback-dev-secret';

export async function POST(req: Request) {
  try {
    // Get auth token from headers or cookies
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await req.json();

    // Log the report
    console.log('🚨 CHEAT REPORT FROM CLIENT:', {
      userId,
      ...report,
      receivedAt: new Date().toISOString()
    });

    // TODO: Store in database
    // await db.antiCheatReports.create({
    //   userId,
    //   matchId: report.matchId,
    //   suspiciousProcesses: report.suspiciousProcesses,
    //   systemInfo: report.systemInfo,
    //   playerIP: report.playerIP,
    //   severity: report.severity,
    //   reportType: report.reportType,
    //   timestamp: new Date(report.timestamp),
    //   status: 'pending'
    // });

    // TODO: Notify admins/mods
    // await notifyAdmins({
    //   type: 'cheat_detection',
    //   userId,
    //   matchId: report.matchId,
    //   processes: report.suspiciousProcesses
    // });

    // TODO: Potentially trigger actions
    // if (report.severity === 'high' && report.suspiciousProcesses.length > 3) {
    //   // Auto-kick from match or ban temporarily
    //   await kickFromMatch(userId, report.matchId, 'High suspicious activity detected');
    // }

    return NextResponse.json({
      success: true,
      message: 'Report received and logged',
      reportId: `report_${Date.now()}`
    }, { status: 201 });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json(
      { error: 'Failed to process report' },
      { status: 500 }
    );
  }
}

// Optional: GET reports for admin panel
export async function GET(req: Request) {
  try {
    // Get auth token from headers or cookies
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    // const user = await db.users.findUnique({ where: { id: userId } });
    // if (user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // TODO: Fetch reports from database
    // const reports = await db.antiCheatReports.findMany({
    //   orderBy: { timestamp: 'desc' },
    //   take: 100
    // });

    return NextResponse.json({
      reports: [],
      total: 0
    });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
