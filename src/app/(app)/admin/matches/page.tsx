'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/admin/matches?limit=50');
      const data = await response.json();
      
      if (response.ok) {
        setMatches(data.matches || []);
      } else {
        throw new Error(data.error || 'Failed to fetch matches');
      }
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load matches',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      READY: { variant: 'default' as const, label: 'Ready' },
      LIVE: { variant: 'default' as const, label: 'Live' },
      FINISHED: { variant: 'default' as const, label: 'Finished' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    };
    
    const config = variants[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <TabsContent value="/admin/matches" className="space-y-4">
        <div className="space-y-8 mt-6">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-headline text-2xl font-semibold">Matches Management</h2>
                    <p className="text-muted-foreground">View details and manage platform matches.</p>
                </div>
                 <div className="w-full max-w-sm">
                    <Input 
                      placeholder="Search by match ID or player name..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
            </div>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Recent Matches</CardTitle>
                    <CardDescription>
                        A list of matches on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                      <div className="p-8 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Match ID</TableHead>
                                  <TableHead>Map</TableHead>
                                  <TableHead>Score</TableHead>
                                  <TableHead>Players</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                            {matches.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                  No matches found
                                </TableCell>
                              </TableRow>
                            ) : (
                              matches.map((match) => (
                                <TableRow key={match.id}>
                                    <TableCell className="font-mono text-xs">{match.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{match.map || 'N/A'}</TableCell>
                                    <TableCell>
                                      {match.scoreTeam1 !== null && match.scoreTeam2 !== null
                                        ? `${match.scoreTeam1}-${match.scoreTeam2}`
                                        : 'N/A'}
                                    </TableCell>
                                    <TableCell>{match.playerCount || 0} players</TableCell>
                                    <TableCell>
                                      {getStatusBadge(match.status)}
                                    </TableCell>
                                    <TableCell>
                                      {match.createdAt 
                                        ? new Date(match.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                    </TableCell>
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
                              ))
                            )}
                          </TableBody>
                      </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    </TabsContent>
  );
}
