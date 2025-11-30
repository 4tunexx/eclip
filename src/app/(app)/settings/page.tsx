import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SteamIcon } from "@/components/icons/SteamIcon";
import { User, Bell, Lock, Eye } from "lucide-react";

export default function SettingsPage() {
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
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="n3o" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="n3o@eclip.pro" />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Steam Account</h3>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/60">
                           <div className="flex items-center gap-3">
                                <SteamIcon className="w-8 h-8 text-foreground"/>
                                <div>
                                    <p className="font-bold">n3o_steam</p>
                                    <p className="text-sm text-muted-foreground">Linked</p>
                                </div>
                           </div>
                            <Button variant="destructive">Unlink</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="security" className="mt-6">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
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
                        <Switch id="profile-visibility" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="dm-privacy">Direct Messages</Label>
                            <p className="text-sm text-muted-foreground">Allow direct messages from anyone or only friends.</p>
                        </div>
                         <Switch id="dm-privacy" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="match-history">Match History</Label>
                            <p className="text-sm text-muted-foreground">Show your match history to others.</p>
                        </div>
                         <Switch id="match-history" defaultChecked />
                    </div>
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
                        <Switch id="email-match" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="email-social">Social Activity</Label>
                            <p className="text-sm text-muted-foreground">Friend requests and new messages.</p>
                        </div>
                         <Switch id="email-social" />
                    </div>
                     <h3 className="font-semibold">In-Site Notifications</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="site-match">Match Ready</Label>
                            <p className="text-sm text-muted-foreground">A popup when your match is ready.</p>
                        </div>
                        <Switch id="site-match" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="site-social">Social Activity</Label>
                            <p className="text-sm text-muted-foreground">Friend requests, messages, and mentions.</p>
                        </div>
                         <Switch id="site-social" defaultChecked />
                    </div>
                </CardContent>
            </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
