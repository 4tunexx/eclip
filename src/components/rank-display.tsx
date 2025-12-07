'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankDisplayProps {
  rank: string;
  division: number;
  esr: number;
}

// Map rank names to background image filenames
const RANK_IMAGES: Record<string, string> = {
  'Ace': 'ace-b.png',
  'Legend': 'legend-b.png',
  'Pro': 'pro-b.png',
  'Rookie': 'rookie-b.png',
  'Beginner': 'beginner-b.png',
};

// Map division number to division image
const DIVISION_IMAGES: Record<number, string> = {
  1: 'd1.png',
  2: 'd2.png',
  3: 'd3.png',
};

export function RankDisplay({ rank, division, esr }: RankDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  const divisionImage = DIVISION_IMAGES[division] || DIVISION_IMAGES[1];
  const rankImage = RANK_IMAGES[rank] || RANK_IMAGES['Rookie'];
  const divisionNumber = division || 1;

  return (
    <div className="w-full space-y-4">
      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Rank & Division
      </div>
      
      {/* Rank Slider Container */}
      <div 
        className="relative w-full max-w-xs mx-auto h-80 rounded-lg overflow-visible cursor-pointer group bg-gradient-to-b from-black/40 to-black/60"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Rank Image (PLACED directly behind division, hidden by default) */}
        <div
          className={cn(
            'absolute top-8 left-1/2 -translate-x-1/2 flex items-center justify-center transition-transform duration-500 ease-out z-10',
            // when closed the rank sits exactly behind the division (hidden)
            // when open it translates down so the lower part shows below the division
            // make the rank drop further down when open so more of it is visible
            // closed: sit exactly under the division so it is fully hidden (same level)
            // open: drop down so the badge lower half becomes visible under the division
            // move open-state down a bit more so more of the rookie badge shows
            // closed: shift the rookie far up so it's fully hidden behind the division frame
            // open: translate down so the lower portion of the rookie badge becomes visible
            isOpen ? 'translate-y-40' : '-translate-y-48'
          )}
        >
          <img
            src={`/images/ranks/${rankImage}`}
            alt={rank}
            className="h-56 w-56 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Division Image (ON TOP, covering rookie - shows d1/d2/d3) */}
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <img
            src={`/images/ranks/${divisionImage}`}
            alt={`Division ${divisionNumber}`}
            className="h-56 w-56 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Hover Indicator */}
        <div className="absolute right-4 top-20 pointer-events-auto z-30">
          <ChevronDown
            className={cn(
              'h-6 w-6 text-white/60 transition-transform duration-500',
              isOpen ? 'rotate-180' : 'rotate-0'
            )}
          />
        </div>

        {/* Hover Hint */}
        <div className="absolute bottom-3 left-3 text-xs text-white/70 font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-30">
          {isOpen ? 'Click to hide' : 'Hover or click'}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-secondary/40 rounded-lg p-3 backdrop-blur-sm border border-white/5">
          <div className="text-xs text-muted-foreground font-semibold">ESR Rating</div>
          <div className="text-lg font-bold text-white mt-1">{esr || 1000}</div>
        </div>
        <div className="bg-secondary/40 rounded-lg p-3 backdrop-blur-sm border border-white/5">
          <div className="text-xs text-muted-foreground font-semibold">Rank</div>
          <div className="text-lg font-bold text-white mt-1">{rank}</div>
        </div>
        <div className="bg-secondary/40 rounded-lg p-3 backdrop-blur-sm border border-white/5">
          <div className="text-xs text-muted-foreground font-semibold">Division</div>
          <div className="text-lg font-bold text-white mt-1">D{divisionNumber}</div>
        </div>
      </div>

      {/* Rank Tiers Reference */}
      <div className="bg-secondary/20 rounded-lg p-4 border border-white/5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Rank Tiers (Highest to Lowest)
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['Ace', 'Legend', 'Pro', 'Rookie', 'Beginner'].map((tierRank) => (
            <div
              key={tierRank}
              className={cn(
                'px-3 py-2 rounded-md text-xs font-semibold text-center transition-colors',
                rank === tierRank
                  ? 'bg-primary/80 text-white'
                  : 'bg-secondary/40 text-muted-foreground'
              )}
            >
              {tierRank}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
