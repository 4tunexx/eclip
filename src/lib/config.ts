// Centralized configuration from environment variables

export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    sessionSecret: process.env.SESSION_SECRET!,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  steam: {
    apiKey: process.env.STEAM_API_KEY,
    // Derive realm from return URL if not explicitly set
    realm: (() => {
      const explicit = process.env.STEAM_REALM;
      if (explicit) return explicit;
      const ret = process.env.STEAM_RETURN_URL;
      try {
        if (ret) return new URL(ret).origin;
      } catch {}
      return 'http://localhost:3000';
    })(),
    returnUrl: process.env.STEAM_RETURN_URL || 'http://localhost:3000/api/auth/steam/return',
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID!,
    region: process.env.GCP_REGION || 'us-east1',
    zone: process.env.GCP_COMPUTE_ZONE || 'us-east1-b',
    computeInstanceTemplate: process.env.GCP_COMPUTE_INSTANCE_TEMPLATE!,
    computeMachine: process.env.GCP_COMPUTE_MACHINE || 'e2-medium',
    firewallRule: process.env.GCP_FIREWALL_RULE!,
    computeNetwork: process.env.GCP_COMPUTE_NETWORK!,
    serviceAccountEmail: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    orchestratorServiceAccountEmail: process.env.GCP_ORCHESTRATOR_SA_EMAIL,
  },
  match: {
    serverPort: parseInt(process.env.MATCH_SERVER_PORT || '27015'),
    startupTimeout: parseInt(process.env.MATCH_SERVER_STARTUP_TIMEOUT || '120000'),
    shutdownTimeout: parseInt(process.env.MATCH_SERVER_SHUTDOWN_TIMEOUT || '15000'),
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    wsUrl: process.env.WS_URL || 'ws://localhost:3001',
  },
  ac: {
    ingestSecret: process.env.AC_INGEST_SECRET,
  },
  email: {
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM || 'noreply@eclip.pro',
    user: process.env.EMAIL_USER || 'noreply@eclip.pro',
    password: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@eclip.pro',
    verifyUrl: process.env.EMAIL_VERIFY_URL, // Full verify endpoint base
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
};

// Validate required config
if (!config.database.url) {
  throw new Error('DATABASE_URL is required');
}

if (!config.auth.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

