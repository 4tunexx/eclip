export default function FAQPage() {
  const faqs = [
    {
      q: 'What is ESR (Eclip Skill Rating)?',
      a: 'ESR is your skill rating for ranked play. Winning raises ESR, losing lowers it. It drives your tier and division placement.'
    },
    {
      q: 'How do divisions and tiers work?',
      a: 'Tiers progress from Beginner → Rookie → Pro → Ace → Legend. Each tier has 3 divisions (I, II, III). Climb by gaining ESR; divisions update based on your rating thresholds.'
    },
    {
      q: 'How do I earn coins?',
      a: 'Win matches, complete daily/weekly missions, clear achievements, and participate in events. Admins may grant bonus coins during tests.'
    },
    {
      q: 'What can I buy with coins?',
      a: 'Coins purchase cosmetics (banners, avatar frames, titles) in the Shop. Badges are earned via achievements or events, not purchased.'
    },
    {
      q: 'How do cosmetics work?',
      a: 'Buy cosmetics in the Shop, then equip them from your Profile → Customize tab. Equips update your profile banner, avatar frame, and title. Badges show in highlights when equipped (coming soon).'
    },
    {
      q: 'How do I play a match?',
      a: 'Go to Play, select a queue, ready up, and join the assigned server. Keep your client open; abandoning can affect ESR and penalties.'
    },
    {
      q: 'What about anti-cheat?',
      a: 'Anti-cheat monitors matches and server telemetry. Suspicious events are reviewed; confirmed violations lead to bans. Keep your game and client clean.'
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">FAQ</h1>
        <p className="text-muted-foreground">Quick answers about ESR, divisions, coins, cosmetics, play, and anti-cheat.</p>
      </div>
      <div className="grid gap-4">
        {faqs.map((item) => (
          <div key={item.q} className="rounded-xl border border-border bg-card/60 p-4">
            <h2 className="text-lg font-semibold">{item.q}</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
