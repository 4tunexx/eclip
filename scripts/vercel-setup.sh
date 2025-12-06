#!/bin/bash

# Vercel Environment Setup Script
# This script shows how to set DATABASE_URL in Vercel

echo "🚀 ECLIP Vercel Setup"
echo "==================="
echo ""
echo "Your DATABASE_URL:"
echo "postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo ""
echo "Add this to Vercel via:"
echo ""
echo "Option 1: Vercel CLI"
echo "  vercel env add DATABASE_URL"
echo "  (paste the connection string above)"
echo ""
echo "Option 2: Vercel Dashboard"
echo "  1. Go to https://vercel.com/4tunexx/eclip/settings/environment-variables"
echo "  2. Click 'Add Environment Variable'"
echo "  3. Name: DATABASE_URL"
echo "  4. Value: postgresql://neondb_owner:npg_JwbY17enhtTU@ep-square-tree-addwk4t7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo "  5. Select: Production, Preview, Development"
echo "  6. Click 'Save'"
echo ""
echo "Then redeploy:"
echo "  git push origin master"
echo ""
