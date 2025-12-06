'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye } from 'lucide-react';

export default function SiteConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');

  const [config, setConfig] = useState({
    // Site Appearance
    siteName: 'Eclip.pro',
    tagline: 'Competitive Gaming Platform',
    logoUrl: 'https://i.postimg.cc/0QvQ30bW/full-logo.png',
    logoHeight: 40,
    faviconUrl: 'https://i.postimg.cc/kXjC3x0s/favicon.png',
    
    // Landing Page Hero
    heroTitle: 'The Ultimate Competitive Experience',
    heroSubtitle: 'Join thousands of players competing at the highest level',
    heroBannerUrl: 'https://i.postimg.cc/52X97NSP/de_ancient_night_02.png',
    heroButtonText: 'Play Now',
    heroButtonLink: '/play',
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back shortly.',
    
    // Economy
    coinsPerWin: 10,
    coinsPerLoss: 2,
    xpPerWin: 50,
    xpPerLoss: 10,
    
    // Feature Flags
    enableSocialFeatures: true,
    enableForumFeatures: true,
    enableVIPFeatures: true,
    enableCosmeticShop: true,
    enableMissions: true,
    enableAchievements: true,
    
    // Support
    supportEmail: 'support@eclip.pro',
    discordServerUrl: 'https://discord.gg/eclip',
    twitterUrl: 'https://twitter.com/eclipofficial',
  });

  useEffect(() => {
    setLogoPreview(config.logoUrl);
    setBannerPreview(config.heroBannerUrl);
    setFaviconPreview(config.faviconUrl);
  }, [config.logoUrl, config.heroBannerUrl, config.faviconUrl]);

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, config }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${section} settings saved successfully`,
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <TabsContent value="/admin/config" className="space-y-4">
      <div className="space-y-8 mt-6 max-w-6xl mx-auto">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="landing">Landing Page</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="economy">Economy</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle>Site Appearance</CardTitle>
                <CardDescription>Configure logo, favicon, and site branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Logo</h3>
                  {logoPreview && (
                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                      <img src={logoPreview} alt="Logo Preview" style={{ height: `${config.logoHeight}px` }} />
                      <span className="text-sm text-muted-foreground">Current Logo Preview</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={config.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoHeight">Logo Height (px)</Label>
                    <Input
                      id="logoHeight"
                      type="number"
                      min="20"
                      max="100"
                      value={config.logoHeight}
                      onChange={(e) => handleChange('logoHeight', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <Separator />

                {/* Favicon Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Favicon</h3>
                  {faviconPreview && (
                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                      <img src={faviconPreview} alt="Favicon Preview" style={{ width: '32px', height: '32px' }} />
                      <span className="text-sm text-muted-foreground">Current Favicon Preview</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <Input
                      id="faviconUrl"
                      value={config.faviconUrl}
                      onChange={(e) => handleChange('faviconUrl', e.target.value)}
                      placeholder="https://example.com/favicon.png"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <Separator />

                {/* Site Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Site Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={config.siteName}
                      onChange={(e) => handleChange('siteName', e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={config.tagline}
                      onChange={(e) => handleChange('tagline', e.target.value)}
                      placeholder="Short description of your site"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleSave('appearance')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Appearance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Landing Page Tab */}
          <TabsContent value="landing" className="space-y-4">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle>Landing Page Configuration</CardTitle>
                <CardDescription>Manage hero section, CTA buttons, and landing page content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hero Banner */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Hero Banner</h3>
                  {bannerPreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-700">
                      <img src={bannerPreview} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white/50" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="heroBannerUrl">Hero Banner URL</Label>
                    <Input
                      id="heroBannerUrl"
                      value={config.heroBannerUrl}
                      onChange={(e) => handleChange('heroBannerUrl', e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 1920x600px or wider</p>
                  </div>
                </div>

                <Separator />

                {/* Hero Text */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Hero Section Text</h3>
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={config.heroTitle}
                      onChange={(e) => handleChange('heroTitle', e.target.value)}
                      placeholder="Main headline"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Textarea
                      id="heroSubtitle"
                      value={config.heroSubtitle}
                      onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                      placeholder="Subheading/description"
                      className="bg-gray-800 border-gray-700 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* CTA Button */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Call-to-Action Button</h3>
                  <div className="space-y-2">
                    <Label htmlFor="heroButtonText">Button Text</Label>
                    <Input
                      id="heroButtonText"
                      value={config.heroButtonText}
                      onChange={(e) => handleChange('heroButtonText', e.target.value)}
                      placeholder="e.g., Play Now"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroButtonLink">Button Link</Label>
                    <Input
                      id="heroButtonLink"
                      value={config.heroButtonLink}
                      onChange={(e) => handleChange('heroButtonLink', e.target.value)}
                      placeholder="e.g., /play or https://..."
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleSave('landing')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Landing Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Platform Features</h3>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-base">Enable Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Only admins can access when enabled</p>
                    </div>
                    <Switch
                      checked={config.maintenanceMode}
                      onCheckedChange={(value) => handleChange('maintenanceMode', value)}
                    />
                  </div>

                  {config.maintenanceMode && (
                    <div className="space-y-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <Label htmlFor="maintenanceMsg">Maintenance Message</Label>
                      <Textarea
                        id="maintenanceMsg"
                        value={config.maintenanceMessage}
                        onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                        className="bg-gray-800 border-gray-700 resize-none"
                        rows={3}
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-base">Social Features</Label>
                      <p className="text-sm text-muted-foreground">Forum, chat, friend system</p>
                    </div>
                    <Switch
                      checked={config.enableSocialFeatures}
                      onCheckedChange={(value) => handleChange('enableSocialFeatures', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-base">Forum Features</Label>
                      <p className="text-sm text-muted-foreground">Discussion boards and threads</p>
                    </div>
                    <Switch
                      checked={config.enableForumFeatures}
                      onCheckedChange={(value) => handleChange('enableForumFeatures', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-base">VIP Features</Label>
                      <p className="text-sm text-muted-foreground">Exclusive VIP cosmetics and perks</p>
                    </div>
                    <Switch
                      checked={config.enableVIPFeatures}
                      onCheckedChange={(value) => handleChange('enableVIPFeatures', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-base">Cosmetic Shop</Label>
                      <p className="text-sm text-muted-foreground">Frames, banners, badges, titles</p>
                    </div>
                    <Switch
                      checked={config.enableCosmeticShop}
                      onCheckedChange={(value) => handleChange('enableCosmeticShop', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-base">Missions</Label>
                      <p className="text-sm text-muted-foreground">Daily and weekly missions</p>
                    </div>
                    <Switch
                      checked={config.enableMissions}
                      onCheckedChange={(value) => handleChange('enableMissions', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <Label className="text-base">Achievements</Label>
                      <p className="text-sm text-muted-foreground">Achievement system and tracking</p>
                    </div>
                    <Switch
                      checked={config.enableAchievements}
                      onCheckedChange={(value) => handleChange('enableAchievements', value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleSave('features')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Features
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy" className="space-y-4">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle>Economy Settings</CardTitle>
                <CardDescription>Configure rewards, currencies, and economic parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Match Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coinsPerWin">Coins per Win</Label>
                      <Input
                        id="coinsPerWin"
                        type="number"
                        value={config.coinsPerWin}
                        onChange={(e) => handleChange('coinsPerWin', parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coinsPerLoss">Coins per Loss</Label>
                      <Input
                        id="coinsPerLoss"
                        type="number"
                        value={config.coinsPerLoss}
                        onChange={(e) => handleChange('coinsPerLoss', parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xpPerWin">XP per Win</Label>
                      <Input
                        id="xpPerWin"
                        type="number"
                        value={config.xpPerWin}
                        onChange={(e) => handleChange('xpPerWin', parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xpPerLoss">XP per Loss</Label>
                      <Input
                        id="xpPerLoss"
                        type="number"
                        value={config.xpPerLoss}
                        onChange={(e) => handleChange('xpPerLoss', parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleSave('economy')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Economy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
          <CardHeader>
            <CardTitle>Contact & Social</CardTitle>
            <CardDescription>Support and social media links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discordUrl">Discord Server URL</Label>
                <Input
                  id="discordUrl"
                  value={config.discordServerUrl}
                  onChange={(e) => handleChange('discordServerUrl', e.target.value)}
                  placeholder="https://discord.gg/..."
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                <Input
                  id="twitterUrl"
                  value={config.twitterUrl}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => handleSave('social')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Contact Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
