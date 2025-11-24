# Eclip.pro Architecture

## Overview
Eclip.pro is built as a modular distributed system:

## Core Services
- **API Gateway / Backend (Cloud Run)**  
- **Matchmaking Engine**  
- **Game Server Provisioner (GCP Compute Engine)**  
- **Stats/Match Processor**  
- **Anticheat Logs Processor**  
- **Neon PostgreSQL Database**  

## Data Flow

User ? Steam Auth ? Database ? Queue  
? Matchmaking ? Create CS2 Server (GCP VM)  
? CS2 Server sends events ? Backend  
? Update DB ? Leaderboards ? Rewards ? Profile

## CS2 Server Workflow
1. Backend starts new VM  
2. VM runs startup script (installs CS2)  
3. Players join via connect IP  
4. Server sends stats back every round  
5. Match ends ? backend shuts down VM  
6. VM deleted ? credits saved  

## Anticheat Workflow
Client ? Secure upload ? AC Logs  
Backend stores ? Flags scored ? Admin review

## Databases
Neon Postgres with tables:
- users
- matches
- match_stats
- leaderboards
- ac_logs
- transactions
- achievements
- clans
- friends
- server_queue
