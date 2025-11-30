import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { recentMatches } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function MatchesPage() {
  return (
    <TabsContent value="/admin/matches" className="space-y-4">
        <div className="space-y-8 mt-6">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-headline text-2xl font-semibold">Matches Management</h2>
                    <p className="text-muted-foreground">View details and manage platform matches.</p>
                </div>
                 <div className="w-full max-w-sm">
                    <Input placeholder="Search by match ID or player name..." />
                 </div>
            </div>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Recent Matches</CardTitle>
                    <CardDescription>
                        A list of the most recently completed matches on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Match ID</TableHead>
                                <TableHead>Map</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentMatches.map((match) => (
                                <TableRow key={match.id}>
                                    <TableCell className="font-mono text-xs">{match.id}</TableCell>
                                    <TableCell>{match.map}</TableCell>
                                    <TableCell>{match.score}</TableCell>
                                    <TableCell>
                                        <Badge variant={match.result === 'Win' ? 'default' : 'destructive'} className={match.result === 'Win' ? `bg-primary/80 text-primary-foreground` : `bg-red-500/80`}>
                                            Finished
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{match.date}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Recalculate Stats</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Cancel Match</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </TabsContent>
  );
}
