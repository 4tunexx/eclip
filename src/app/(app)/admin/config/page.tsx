import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SiteConfigPage() {
  return (
    <TabsContent value="/admin/config" className="space-y-4">
        <div className="space-y-8 mt-6 max-w-4xl mx-auto">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Site Configuration</CardTitle>
                    <CardDescription>
                        Manage global platform settings, appearance, and maintenance mode.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Appearance</h3>
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">Logo URL</Label>
                            <Input id="logoUrl" defaultValue="https://i.postimg.cc/0QvQ30bW/full-logo.png" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bannerUrl">Landing Page Banner URL</Label>
                            <Input id="bannerUrl" defaultValue="https://i.postimg.cc/52X97NSP/de_ancient_night_02.png" />
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Maintenance Mode</h3>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/60">
                           <div>
                                <Label htmlFor="maintenance-mode" className="text-base">Enable Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">When enabled, only admins can access the site.</p>
                           </div>
                           <Switch id="maintenance-mode" />
                        </div>
                    </div>

                     <Separator />

                     <div className="space-y-4">
                        <h3 className="text-lg font-medium">Economy</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="coin-win">Coins per Win</Label>
                                <Input id="coin-win" type="number" defaultValue="0.10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="coin-loss">Coins per Loss</Label>
                                <Input id="coin-loss" type="number" defaultValue="0.02" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <Button>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </TabsContent>
  );
}
