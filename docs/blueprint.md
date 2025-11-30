# **App Name**: Eclip.pro

## Core Features:

- User Authentication: Securely authenticate users with email/password or Steam login. Implement email verification and password reset functionality.
- Profile & Progression: Enable users to create profiles, earn XP, level up, and track their ranks. Display progress visually on their profiles.
- Matchmaking Queue: Implement a queue system where players can queue solo or in parties for 5v5 matches. The matchmaker will form teams based on MMR and region.
- Match Lifecycle: Manage the complete match lifecycle from creation to result recording, including server orchestration (using GCP to spin up/shut down CS2 servers) and notification of players.
- Cosmetics and Shop: Allow users to earn coins and spend them on cosmetic items like avatar frames, profile banners, badges, and titles. Manage a shop to display available cosmetics.
- Anti-Cheat Integration: Integrate with the anti-cheat client and backend to detect cheating. Ingest AC events and maintain a suspicion score for each player to automatically restrict or ban cheaters. Use an LLM to review anti-cheat logs as a tool to assist the moderators.
- Admin Panel: Provide an admin panel to manage users, matches, economy, cosmetics, AC, bans, and site config.

## Style Guidelines:

- Primary color: Vibrant neon green (#39FF14) to reflect the modern and edgy style.
- Background color: Dark charcoal gray (#222222) to provide a dark theme base that contrasts well with neon accents.
- Accent color: Electric purple (#BF00FF) as a secondary highlight to complement the neon green, and to create depth.
- Body and headline font: 'Space Grotesk', a sans-serif with a techy feel suitable for both headers and body text.
- Use clean, modern icons with a neon green fill or outline to maintain the visual theme. Consider using icons with a slightly futuristic or digital look.
- Employ a modular card-based layout with rounded corners and subtle glassmorphism/blur effects in certain areas. Ensure a responsive design for mobile-friendliness.
- Use smooth, subtle animations with Framer Motion for transitions and interactions, providing a modern user experience. For instance, use fade-in effects and smooth transitions when loading content.