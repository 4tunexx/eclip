'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function LeaderboardsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const response = await fetch('/api/leaderboards');
      const data = await response.json();
      if (response.ok) {
        setPlayers(data.players || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
        <CardHeader>
          <CardTitle>Leaderboards</CardTitle>
          <CardDescription>
            See who is at the top of the competitive ladder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>MMR</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No players found
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          avatarUrl={player.avatarUrl}
                          username={player.username}
                          className="h-10 w-10"
                        />
                        <span className="font-medium">{player.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">{player.mmr}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary text-primary">
                        {player.rank}
                      </Badge>
                    </TableCell>
                    <TableCell>Level {player.level}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
