import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { topPlayers } from "@/lib/placeholder-data";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardsPage() {
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPlayers.map((player, index) => (
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
                    <Badge variant="outline" className="border-primary text-primary">{player.rank}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
