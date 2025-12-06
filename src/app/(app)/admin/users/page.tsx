'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ShieldCheck, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const url = search 
        ? `/api/admin/users?search=${encodeURIComponent(search)}`
        : '/api/admin/users';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchUsers();
  };

  return (
    <TabsContent value="/admin/users" className="space-y-4">
        <div className="space-y-8 mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-headline text-2xl font-semibold">User Management</h2>
                    <p className="text-muted-foreground">Search, view, and manage platform users.</p>
                </div>
                <form onSubmit={handleSearch} className="w-full max-w-sm flex gap-2">
                    <Input 
                      placeholder="Search by username, email..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" size="sm">Search</Button>
                </form>
            </div>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Platform Users</CardTitle>
                    <CardDescription>
                        A list of all registered users on Eclip.pro.
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
                                  <TableHead>Player</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>ESR</TableHead>
                                  <TableHead>Rank</TableHead>
                                  <TableHead>Role</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                  No users found
                                </TableCell>
                              </TableRow>
                            ) : (
                              users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                          <UserAvatar
                                            avatarUrl={user.avatarUrl}
                                            username={user.username}
                                            className="h-10 w-10"
                                          />
                                          <span className="font-medium">{user.username}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                    <TableCell className="font-semibold text-primary">{(user as any).esr}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-primary text-primary">{user.rank}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.emailVerified ? "default" : "secondary"}>
                                          {user.emailVerified ? 'Verified' : 'Unverified'}
                                        </Badge>
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
                                                <DropdownMenuItem onClick={() => window.open(`/profile?user=${user.id}`, '_blank')}>
                                                  View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.id}`}>
                                                  Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
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
