'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SteamIcon } from "@/components/icons/SteamIcon";
import { User, Bell, Lock, Eye, Loader2 } from "lucide-react";
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, isLoading, refetch } = useUser();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setTitle(user.title || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast({
        title: 'Success!',
        description: 'Profile updated successfully.',
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast({
        title: 'Success!',
        description: 'Password changed successfully.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
       <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account, privacy, and notification settings.</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="account"><User className="mr-2"/>Account</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2"/>Security</TabsTrigger>
          <TabsTrigger value="privacy"><Eye className="mr-2"/>Privacy</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2"/>Notifications</TabsTrigger>
        </TabsList>
        <div className="max-w-2xl mx-auto">
            <TabsContent value="account" className="mt-6">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your public profile and account details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input 
                              id="username" 
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isSaving}
                            />
                            {!user.emailVerified && (
                              <p className="text-sm text-yellow-400">⚠️ Email not verified. Update will require re-verification.</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Profile Title</Label>
                            <Input 
                              id="title" 
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="e.g., Headshot Machine"
                              disabled={isSaving}
                            />
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Steam Account</h3>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/60">
                               <div className="flex items-center gap-3">
                                    <SteamIcon className="w-8 h-8 text-foreground"/>
                                    <div>
                                        <p className="font-bold">{user.steamId ? 'Linked' : 'Not Linked'}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {user.steamId || 'Link your Steam account to play matches'}
                                        </p>
                                    </div>
                               </div>
                                <Button variant={user.steamId ? "destructive" : "default"} disabled>
                                  {user.steamId ? 'Unlink' : 'Link Steam'}
                                </Button>
                            </div>
                        </div>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="security" className="mt-6">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input 
                              id="current-password" 
                              type="password" 
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              disabled={isChangingPassword}
                              required
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input 
                              id="new-password" 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={isChangingPassword}
                              required
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input 
                              id="confirm-password" 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isChangingPassword}
                              required
                            />
                        </div>
                        <Button type="submit" disabled={isChangingPassword}>
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            'Update Password'
                          )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="privacy" className="mt-6">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control who can see your profile and interact with you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="profile-visibility">Profile Visibility</Label>
                            <p className="text-sm text-muted-foreground">Make your profile public or private.</p>
                        </div>
                        <Switch id="profile-visibility" defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="dm-privacy">Direct Messages</Label>
                            <p className="text-sm text-muted-foreground">Allow direct messages from anyone or only friends.</p>
                        </div>
                         <Switch id="dm-privacy" defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="match-history">Match History</Label>
                            <p className="text-sm text-muted-foreground">Show your match history to others.</p>
                        </div>
                         <Switch id="match-history" defaultChecked disabled />
                    </div>
                    <p className="text-sm text-muted-foreground">Privacy settings coming soon!</p>
                </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="notifications" className="mt-6">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Choose how you receive notifications from Eclip.pro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <h3 className="font-semibold">Email Notifications</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="email-match">Match Updates</Label>
                            <p className="text-sm text-muted-foreground">Get notified about match results and events.</p>
                        </div>
                        <Switch id="email-match" defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="email-social">Social Activity</Label>
                            <p className="text-sm text-muted-foreground">Friend requests and new messages.</p>
                        </div>
                         <Switch id="email-social" disabled />
                    </div>
                     <h3 className="font-semibold">In-Site Notifications</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="site-match">Match Ready</Label>
                            <p className="text-sm text-muted-foreground">A popup when your match is ready.</p>
                        </div>
                        <Switch id="site-match" defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="site-social">Social Activity</Label>
                            <p className="text-sm text-muted-foreground">Friend requests, messages, and mentions.</p>
                        </div>
                         <Switch id="site-social" defaultChecked disabled />
                    </div>
                    <p className="text-sm text-muted-foreground">Notification settings coming soon!</p>
                </CardContent>
            </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
