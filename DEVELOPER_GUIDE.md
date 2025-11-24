# Developer Guide

## Local Development
Start frontend:
`npm run dev`

Start backend:
`npm run server`

Format:
`npm run lint:fix`

## File Structure

src/
 +- api/        
 +- db/          
 +- modules/
 ¦   +- auth/
 ¦   +- matchmaking/
 ¦   +- servers/
 ¦   +- anticheat/
 ¦   +- profiles/
 ¦   +- rewards/
 +- utils/
 +- config/
 +- types/

## Code Style
- TypeScript for everything
- Services use dependency injection
- Controller ? Service ? DB pattern

## Deployment
Use Cloud Run for all backend logic.
Use Neon for database (automatic).  
Use one.com for DNS.
