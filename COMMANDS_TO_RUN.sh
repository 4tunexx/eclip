#!/bin/bash
# ECLIP DATABASE POPULATION - COMMANDS TO RUN
# Copy each command below and run it in your terminal
# ============================================================================

# COMMAND 1: Populate database with real match data, forum posts, missions, achievements
cd /workspaces/eclip && node scripts/populate-and-audit.js

# COMMAND 2: Show real user statistics calculated from match data
cd /workspaces/eclip && node scripts/calculate-real-stats.js

# COMMAND 3: Full database audit to verify everything
cd /workspaces/eclip && node scripts/auto-audit.js

# COMMAND 4: Verify all tables exist in schema
cd /workspaces/eclip && node scripts/verify-all-tables.js

# SQL COMMAND (Alternative - run in Neon Console):
# Copy entire contents of: /workspaces/eclip/POPULATE_DATABASE.sql
# Go to: https://console.neon.tech
# Select neondb -> SQL Editor -> Paste -> Execute
