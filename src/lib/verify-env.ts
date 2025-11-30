// Environment variable verification utility
// Run this to check if all required env vars are set

export function verifyEnvironmentVariables() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
  ];

  const optional = [
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'REDIS_URL',
    'STEAM_API_KEY',
    'GCP_PROJECT_ID',
    'AC_INGEST_SECRET',
  ];

  const missing: string[] = [];
  const present: string[] = [];
  const warnings: string[] = [];

  // Check required
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  // Check optional
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(`Optional: ${key} not set`);
    } else {
      present.push(key);
    }
  }

  // Email specific check
  if (process.env.EMAIL_USER && !process.env.EMAIL_PASSWORD) {
    warnings.push('EMAIL_USER is set but EMAIL_PASSWORD is missing - emails will not send');
  }

  return {
    missing,
    present,
    warnings,
    isValid: missing.length === 0,
  };
}

// Log verification on import (only in development)
if (process.env.NODE_ENV === 'development') {
  const verification = verifyEnvironmentVariables();
  
  if (!verification.isValid) {
    console.error('❌ Missing required environment variables:');
    verification.missing.forEach(key => console.error(`   - ${key}`));
  } else {
    console.log('✅ All required environment variables are set');
  }

  if (verification.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    verification.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
}

