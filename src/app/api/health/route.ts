import { NextResponse } from 'next/server';
import { verifyEnvironmentVariables } from '@/lib/verify-env';
import { db } from '@/lib/db';
import postgres from 'postgres';

export async function GET() {
  try {
    const envCheck = verifyEnvironmentVariables();
    
    // Test database connection (raw ping to avoid schema mismatches)
    let dbConnected = false;
    try {
      const url = process.env.DATABASE_URL!;
      const sql = postgres(url, { max: 1 });
      await sql`select 1`;
      dbConnected = true;
      await sql.end({ timeout: 5 });
    } catch (error) {
      console.error('Database connection error:', error);
    }

    // Test email config
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

    const health = {
      status: envCheck.isValid && dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        apiBaseUrl: process.env.API_BASE_URL || 'not set',
      },
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        email: emailConfigured ? 'configured' : 'not configured',
        redis: process.env.REDIS_URL ? 'configured' : 'not configured',
        steam: process.env.STEAM_API_KEY ? 'configured' : 'not configured',
        gcp: process.env.GCP_PROJECT_ID ? 'configured' : 'not configured',
      },
      issues: {
        missingEnvVars: envCheck.missing,
        warnings: envCheck.warnings,
      },
    };

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}

