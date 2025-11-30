import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { topPlayers } from "@/lib/placeholder-data";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  return (
    <TabsContent value="/admin/users" className="space-y-4">
        <div className="space-y-8 mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-headline text-2xl font-semibold">User Management</h2>
                    <p className="text-muted-foreground">Search, view, and manage platform users.</p>
                </div>
                <div className="w-full max-w-sm">
                    <Input placeholder="Search by username, email, or SteamID..." />
                </div>
            </div>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Platform Users</CardTitle>
                    <CardDescription>
                        A list of all registered users on Eclip.pro.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>MMR</TableHead>
                                <TableHead>Rank</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {topPlayers.map((player) => (
                            <TableRow key={player.id}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                    <UserAvatar
                                        avatarUrl={player.avatarUrl}
                                        username={player.username}
                                        className="h-10 w-10"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{player.username}</span>
                                        <span className="text-xs text-muted-foreground">SteamID: {player.steamId}</span>
                                    </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-primary">{player.mmr}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-primary text-primary">{player.rank}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Active</Badge>
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
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                                            <DropdownMenuItem>View Match History</DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                View Anti-Cheat Logs
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Ban User</DropdownMenuItem>
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
