"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Plus, Edit, Trash2, Palette, Frame, Sparkles, ArrowLeft, Eye, Award } from 'lucide-react';
import { PROFILE_BANNERS, getBannerGradient } from '@/lib/profile-banners';
import { AVATAR_FRAMES, getFrameStyle, getFrameAnimationClass } from '@/lib/avatar-frames';
import { useUser } from '@/hooks/use-user';
import { BADGE_REQUIREMENT_TYPE_OPTIONS } from '@/lib/constants/requirement-types';

export default function AdminCosmeticsPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [banners, setBanners] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [avatarFrames, setAvatarFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBanner, setShowCreateBanner] = useState(false);
  const [showEditBanner, setShowEditBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [showCreateFrame, setShowCreateFrame] = useState(false);
  const [showEditFrame, setShowEditFrame] = useState(false);
  const [editingFrame, setEditingFrame] = useState<any>(null);
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [showEditBadge, setShowEditBadge] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);
  
  const [newBanner, setNewBanner] = useState({
    id: '',
    name: '',
    description: '',
    gradient: 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, rgb(139 92 246 / 0.2) 50%, rgb(59 130 246 / 0.2) 100%)',
    price: 0,
    rarity: 'common',
    is_vip: false,
    vip_tier_required: 'none',
    is_active: true
  });

  const defaultFrameValues = {
    id: '',
    name: '',
    description: '',
    border_color: '#9333ea',
    border_gradient: '',
    border_width: 3,
    border_style: 'solid',
    shadow_color: 'rgba(147, 51, 234, 0.3)',
    animation_type: 'none',
    animation_speed: 5,
    price: 0,
    rarity: 'common',
    is_vip: false,
    vip_tier_required: 'none',
    is_active: true
  } as const;

  const withFrameDefaults = (frame: any) => ({
    ...defaultFrameValues,
    ...frame,
  });

  const [newFrame, setNewFrame] = useState(withFrameDefaults({}));

  const defaultBadgeValues = {
    title: '',
    description: '',
    rarity: 'COMMON',
    requirementType: 'ACHIEVEMENT_UNLOCK',
    requirementValue: '',
    imageUrl: '',
  } as const;

  const withBadgeDefaults = (badge: any) => ({
    ...defaultBadgeValues,
    ...badge,
  });

  const [newBadge, setNewBadge] = useState(withBadgeDefaults({}));

  useEffect(() => {
    if (authLoading) return;
    
    fetchCosmetics();
  }, [authLoading]);

  const fetchCosmetics = async () => {
    try {
      setLoading(true);
      
      // Fetch banners from database
      const bannersResponse = await fetch('/api/admin/cosmetics/banners');
      if (bannersResponse.ok) {
        const bannersData = await bannersResponse.json();
        let fetchedBanners = bannersData.banners || [];
        
        // Parse metadata for each banner
        fetchedBanners = fetchedBanners.map((banner: any) => {
          if (banner.metadata && typeof banner.metadata === 'object') {
            return {
              ...banner,
              gradient: banner.metadata.gradient || banner.gradient
            };
          }
          return banner;
        });
        
        // If banners exist but need unique gradients, update them
        if (fetchedBanners.length > 0) {
          await updateBannersWithUniqueGradients(fetchedBanners);
          // Refetch to get updated banners
          const retryRes = await fetch('/api/admin/cosmetics/banners');
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            fetchedBanners = retryData.banners || [];
            // Parse metadata again
            fetchedBanners = fetchedBanners.map((banner: any) => {
              if (banner.metadata && typeof banner.metadata === 'object') {
                return {
                  ...banner,
                  gradient: banner.metadata.gradient || banner.gradient
                };
              }
              return banner;
            });
          }
        }
        
        // If no banners in DB, create the default ones
        if (fetchedBanners.length === 0) {
          console.log('[Admin] No banners found, creating defaults...');
          for (const banner of PROFILE_BANNERS) {
            try {
              const createRes = await fetch('/api/admin/cosmetics/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: banner.id,
                  name: banner.name,
                  description: banner.description,
                  gradient: banner.gradient,
                  price: banner.price,
                  rarity: banner.rarity,
                  is_vip: banner.is_vip || false,
                  vip_tier_required: banner.vip_tier_required || 'none',
                  is_active: true
                })
              });
              if (!createRes.ok) {
                console.log(`[Admin] Failed to create banner ${banner.id}`);
              }
            } catch (err) {
              console.log(`[Admin] Error creating banner ${banner.id}:`, err);
            }
          }
          // Fetch again to get the created banners
          const retryRes = await fetch('/api/admin/cosmetics/banners');
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            fetchedBanners = retryData.banners || [];
            // Parse metadata
            fetchedBanners = fetchedBanners.map((banner: any) => {
              if (banner.metadata && typeof banner.metadata === 'object') {
                return {
                  ...banner,
                  gradient: banner.metadata.gradient || banner.gradient
                };
              }
              return banner;
            });
          }
        }
        
        setBanners(fetchedBanners);
      } else {
        // Fallback to hardcoded banners
        setBanners(PROFILE_BANNERS.map(b => ({ ...b, from_database: false })));
      }

      // Fetch avatar frames from database
      const framesResponse = await fetch('/api/admin/cosmetics/frames');
      if (framesResponse.ok) {
        const framesData = await framesResponse.json();
        let fetchedFrames = framesData.frames || [];
        
        // Parse metadata for each frame
        fetchedFrames = fetchedFrames.map((frame: any) => {
          if (frame.metadata && typeof frame.metadata === 'object') {
            return {
              ...frame,
              border_color: frame.metadata.border_color || frame.border_color,
              border_gradient: frame.metadata.border_gradient || frame.border_gradient,
              border_width: frame.metadata.border_width || frame.border_width,
              border_style: frame.metadata.border_style || frame.border_style,
              shadow_color: frame.metadata.shadow_color || frame.shadow_color,
              animation_type: frame.metadata.animation_type || frame.animation_type,
              animation_speed: frame.metadata.animation_speed || frame.animation_speed
            };
          }
          return frame;
        });
        
        // If frames exist but need unique styles, update them
        if (fetchedFrames.length > 0) {
          await updateFramesWithUniqueStyles(fetchedFrames);
          // Refetch to get updated frames
          const retryRes = await fetch('/api/admin/cosmetics/frames');
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            fetchedFrames = retryData.frames || [];
            // Parse metadata again
            fetchedFrames = fetchedFrames.map((frame: any) => {
              if (frame.metadata && typeof frame.metadata === 'object') {
                return {
                  ...frame,
                  border_color: frame.metadata.border_color || frame.border_color,
                  border_gradient: frame.metadata.border_gradient || frame.border_gradient,
                  border_width: frame.metadata.border_width || frame.border_width,
                  border_style: frame.metadata.border_style || frame.border_style,
                  shadow_color: frame.metadata.shadow_color || frame.shadow_color,
                  animation_type: frame.metadata.animation_type || frame.animation_type,
                  animation_speed: frame.metadata.animation_speed || frame.animation_speed
                };
              }
              return frame;
            });
          }
        }
        
        setAvatarFrames(fetchedFrames);
      } else {
        // Fallback to hardcoded frames
        setAvatarFrames(AVATAR_FRAMES.map(f => ({ ...f, from_database: false })));
      }

      // Fetch badges from database
      const badgesResponse = await fetch('/api/admin/badges');
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(Array.isArray(badgesData) ? badgesData : badgesData.badges || []);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error('Error fetching cosmetics:', error);
      setBanners(PROFILE_BANNERS.map(b => ({ ...b, from_database: false })));
      setAvatarFrames(AVATAR_FRAMES.map(f => ({ ...f, from_database: false })));
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  // Unique gradient for each banner
  const bannerGradients: Record<string, string> = {
    'Mountains Banner': 'linear-gradient(135deg, rgb(120 53 15 / 0.4) 0%, rgb(161 98 7 / 0.4) 25%, rgb(217 119 6 / 0.4) 50%, rgb(120 53 15 / 0.4) 75%, rgb(87 41 8 / 0.4) 100%)',
    'Ocean Banner': 'linear-gradient(135deg, rgb(6 182 212 / 0.3) 0%, rgb(14 165 233 / 0.3) 33%, rgb(30 144 255 / 0.3) 66%, rgb(25 118 210 / 0.3) 100%)',
    'Forest Banner': 'linear-gradient(135deg, rgb(34 197 94 / 0.3) 0%, rgb(16 185 129 / 0.3) 33%, rgb(5 150 105 / 0.3) 66%, rgb(20 83 56 / 0.3) 100%)',
    'City Banner': 'linear-gradient(135deg, rgb(100 116 139 / 0.4) 0%, rgb(71 85 105 / 0.4) 33%, rgb(51 65 85 / 0.4) 66%, rgb(30 41 59 / 0.4) 100%)',
    'Desert Banner': 'linear-gradient(135deg, rgb(217 119 6 / 0.4) 0%, rgb(251 191 36 / 0.4) 33%, rgb(251 146 60 / 0.4) 66%, rgb(234 88 12 / 0.4) 100%)',
    'Galaxy Banner': 'linear-gradient(135deg, rgb(30 27 75 / 0.5) 0%, rgb(88 28 135 / 0.5) 25%, rgb(109 40 217 / 0.5) 50%, rgb(59 130 246 / 0.5) 75%, rgb(147 51 234 / 0.5) 100%)',
    'Aurora Banner': 'linear-gradient(135deg, rgb(16 185 129 / 0.4) 0%, rgb(34 197 94 / 0.4) 25%, rgb(59 130 246 / 0.4) 50%, rgb(139 92 246 / 0.4) 75%, rgb(236 72 153 / 0.4) 100%)',
    'Fire Banner': 'linear-gradient(135deg, rgb(239 68 68 / 0.4) 0%, rgb(251 91 36 / 0.4) 33%, rgb(251 146 60 / 0.4) 66%, rgb(249 115 22 / 0.4) 100%)',
    'Ice Banner': 'linear-gradient(135deg, rgb(191 219 254 / 0.4) 0%, rgb(147 197 253 / 0.4) 33%, rgb(96 165 250 / 0.4) 66%, rgb(59 130 246 / 0.4) 100%)',
    'Thunder Banner': 'linear-gradient(135deg, rgb(191 144 0 / 0.4) 0%, rgb(253 224 71 / 0.4) 33%, rgb(245 158 11 / 0.4) 66%, rgb(217 119 6 / 0.4) 100%)',
    'Sakura Banner': 'linear-gradient(135deg, rgb(236 72 153 / 0.4) 0%, rgb(244 63 94 / 0.4) 33%, rgb(251 113 133 / 0.4) 66%, rgb(251 146 60 / 0.4) 100%)',
    'Cyberpunk Banner': 'linear-gradient(135deg, rgb(139 92 246 / 0.4) 0%, rgb(168 85 247 / 0.4) 25%, rgb(124 58 255 / 0.4) 50%, rgb(99 102 241 / 0.4) 75%, rgb(59 130 246 / 0.4) 100%)',
    'Retro Banner': 'linear-gradient(135deg, rgb(239 68 68 / 0.4) 0%, rgb(251 146 60 / 0.4) 25%, rgb(253 224 71 / 0.4) 50%, rgb(34 197 94 / 0.4) 75%, rgb(59 130 246 / 0.4) 100%)',
    'Neon Banner': 'linear-gradient(135deg, rgb(236 72 153 / 0.5) 0%, rgb(168 85 247 / 0.5) 25%, rgb(59 130 246 / 0.5) 50%, rgb(34 197 94 / 0.5) 75%, rgb(251 146 60 / 0.5) 100%)',
    'Gradient Banner': 'linear-gradient(135deg, rgb(239 68 68 / 0.3) 0%, rgb(249 115 22 / 0.3) 20%, rgb(251 146 60 / 0.3) 40%, rgb(253 224 71 / 0.3) 60%, rgb(34 197 94 / 0.3) 80%, rgb(59 130 246 / 0.3) 100%)',
    'Abstract Banner': 'linear-gradient(135deg, rgb(168 85 247 / 0.4) 0%, rgb(147 51 234 / 0.4) 20%, rgb(108 92 231 / 0.4) 40%, rgb(79 70 229 / 0.4) 60%, rgb(66 133 244 / 0.4) 100%)',
    'Geometric Banner': 'linear-gradient(90deg, rgb(59 130 246 / 0.4) 0%, rgb(139 92 246 / 0.4) 50%, rgb(236 72 153 / 0.4) 100%)',
    'Marble Banner': 'linear-gradient(135deg, rgb(209 213 219 / 0.4) 0%, rgb(189 195 202 / 0.4) 33%, rgb(156 163 175 / 0.4) 66%, rgb(107 114 128 / 0.4) 100%)',
    'Wood Banner': 'linear-gradient(135deg, rgb(124 45 18 / 0.4) 0%, rgb(146 64 14 / 0.4) 33%, rgb(172 78 10 / 0.4) 66%, rgb(120 53 15 / 0.4) 100%)',
    'Metal Banner': 'linear-gradient(135deg, rgb(71 85 105 / 0.5) 0%, rgb(100 116 139 / 0.5) 33%, rgb(148 163 184 / 0.5) 66%, rgb(100 116 139 / 0.5) 100%)',
  };

  const updateBannersWithUniqueGradients = async (banners: any[]) => {
    for (const banner of banners) {
      const uniqueGradient = bannerGradients[banner.name];
      if (uniqueGradient && banner.gradient !== uniqueGradient) {
        try {
          const updateRes = await fetch(`/api/admin/cosmetics/banners/${banner.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...banner,
              gradient: uniqueGradient
            })
          });
          if (!updateRes.ok) {
            console.log(`[Admin] Failed to update banner ${banner.name}`);
          }
        } catch (err) {
          console.log(`[Admin] Error updating banner ${banner.name}:`, err);
        }
      }
    }
  };

  // Unique frame styles for each avatar frame
  const frameStyles: Record<string, string> = {
    'Classic Frame': 'linear-gradient(135deg, rgb(148 163 184 / 0.6) 0%, rgb(203 213 225 / 0.6) 50%, rgb(148 163 184 / 0.6) 100%)',
    'Golden Frame': 'linear-gradient(135deg, rgb(251 191 36 / 0.8) 0%, rgb(253 224 71 / 0.8) 33%, rgb(234 179 8 / 0.8) 66%, rgb(161 98 7 / 0.8) 100%)',
    'Diamond Frame': 'linear-gradient(135deg, rgb(191 219 254 / 0.9) 0%, rgb(147 197 253 / 0.9) 25%, rgb(224 242 254 / 0.9) 50%, rgb(96 165 250 / 0.9) 75%, rgb(147 197 253 / 0.9) 100%)',
    'Ruby Frame': 'linear-gradient(135deg, rgb(225 29 72 / 0.8) 0%, rgb(244 63 94 / 0.8) 33%, rgb(239 68 68 / 0.8) 66%, rgb(220 38 38 / 0.8) 100%)',
    'Emerald Frame': 'linear-gradient(135deg, rgb(5 150 105 / 0.8) 0%, rgb(16 185 129 / 0.8) 33%, rgb(34 197 94 / 0.8) 66%, rgb(16 185 129 / 0.8) 100%)',
    'Sapphire Frame': 'linear-gradient(135deg, rgb(30 58 138 / 0.8) 0%, rgb(37 99 235 / 0.8) 33%, rgb(59 130 246 / 0.8) 66%, rgb(37 99 235 / 0.8) 100%)',
    'Amethyst Frame': 'linear-gradient(135deg, rgb(88 28 135 / 0.8) 0%, rgb(126 34 206 / 0.8) 33%, rgb(168 85 247 / 0.8) 66%, rgb(147 51 234 / 0.8) 100%)',
    'Platinum Frame': 'linear-gradient(135deg, rgb(226 232 240 / 0.9) 0%, rgb(241 245 249 / 0.9) 25%, rgb(203 213 225 / 0.9) 50%, rgb(226 232 240 / 0.9) 75%, rgb(248 250 252 / 0.9) 100%)',
    'Bronze Frame': 'linear-gradient(135deg, rgb(120 53 15 / 0.7) 0%, rgb(180 83 9 / 0.7) 33%, rgb(217 119 6 / 0.7) 66%, rgb(146 64 14 / 0.7) 100%)',
    'Obsidian Frame': 'linear-gradient(135deg, rgb(15 23 42 / 0.9) 0%, rgb(30 41 59 / 0.9) 33%, rgb(51 65 85 / 0.9) 66%, rgb(30 41 59 / 0.9) 100%)',
    'Crystal Frame': 'linear-gradient(135deg, rgb(165 180 252 / 0.7) 0%, rgb(199 210 254 / 0.7) 25%, rgb(224 231 255 / 0.7) 50%, rgb(199 210 254 / 0.7) 75%, rgb(165 180 252 / 0.7) 100%)',
    'Rainbow Frame': 'linear-gradient(135deg, rgb(239 68 68 / 0.7) 0%, rgb(251 146 60 / 0.7) 16%, rgb(253 224 71 / 0.7) 33%, rgb(34 197 94 / 0.7) 50%, rgb(59 130 246 / 0.7) 66%, rgb(168 85 247 / 0.7) 83%, rgb(236 72 153 / 0.7) 100%)',
    'Neon Frame': 'linear-gradient(135deg, rgb(236 72 153 / 0.9) 0%, rgb(168 85 247 / 0.9) 25%, rgb(59 130 246 / 0.9) 50%, rgb(34 197 94 / 0.9) 75%, rgb(251 146 60 / 0.9) 100%)',
    'Cosmic Frame': 'linear-gradient(135deg, rgb(30 27 75 / 0.8) 0%, rgb(88 28 135 / 0.8) 25%, rgb(109 40 217 / 0.8) 50%, rgb(59 130 246 / 0.8) 75%, rgb(147 51 234 / 0.8) 100%)',
    'Fire Frame': 'linear-gradient(135deg, rgb(153 27 27 / 0.8) 0%, rgb(220 38 38 / 0.8) 25%, rgb(239 68 68 / 0.8) 50%, rgb(251 146 60 / 0.8) 75%, rgb(253 224 71 / 0.8) 100%)',
    'Ice Frame': 'linear-gradient(135deg, rgb(186 230 253 / 0.8) 0%, rgb(147 197 253 / 0.8) 25%, rgb(125 211 252 / 0.8) 50%, rgb(165 243 252 / 0.8) 75%, rgb(207 250 254 / 0.8) 100%)',
    'Nature Frame': 'linear-gradient(135deg, rgb(20 83 45 / 0.7) 0%, rgb(21 128 61 / 0.7) 25%, rgb(22 163 74 / 0.7) 50%, rgb(34 197 94 / 0.7) 75%, rgb(74 222 128 / 0.7) 100%)',
    'Shadow Frame': 'linear-gradient(135deg, rgb(0 0 0 / 0.9) 0%, rgb(23 23 23 / 0.9) 25%, rgb(38 38 38 / 0.9) 50%, rgb(64 64 64 / 0.9) 75%, rgb(82 82 82 / 0.9) 100%)',
    'Aurora Frame': 'linear-gradient(135deg, rgb(16 185 129 / 0.7) 0%, rgb(34 197 94 / 0.7) 20%, rgb(59 130 246 / 0.7) 40%, rgb(139 92 246 / 0.7) 60%, rgb(236 72 153 / 0.7) 80%, rgb(251 146 60 / 0.7) 100%)',
    'Legendary Frame': 'linear-gradient(135deg, rgb(251 191 36 / 0.9) 0%, rgb(234 179 8 / 0.9) 14%, rgb(249 115 22 / 0.9) 28%, rgb(239 68 68 / 0.9) 42%, rgb(168 85 247 / 0.9) 57%, rgb(59 130 246 / 0.9) 71%, rgb(34 197 94 / 0.9) 85%, rgb(251 191 36 / 0.9) 100%)',
  };

  const updateFramesWithUniqueStyles = async (frames: any[]) => {
    for (const frame of frames) {
      const uniqueStyle = frameStyles[frame.name];
      if (uniqueStyle && frame.border_gradient !== uniqueStyle) {
        try {
          const updateRes = await fetch(`/api/admin/cosmetics/frames/${frame.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...frame,
              border_gradient: uniqueStyle
            })
          });
          if (!updateRes.ok) {
            console.log(`[Admin] Failed to update frame ${frame.name}`);
          }
        } catch (err) {
          console.log(`[Admin] Error updating frame ${frame.name}:`, err);
        }
      }
    }
  };

  const handleCreateBanner = async () => {
    if (!newBanner.id || !newBanner.name || !newBanner.gradient) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (ID, Name, Gradient).",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/cosmetics/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create banner');
      }

      toast({
        title: "Success",
        description: "Banner created successfully!"
      });

      setShowCreateBanner(false);
      setNewBanner({
        id: '',
        name: '',
        description: '',
        gradient: 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, rgb(139 92 246 / 0.2) 50%, rgb(59 130 246 / 0.2) 100%)',
        price: 0,
        rarity: 'common',
        is_vip: false,
        vip_tier_required: 'none',
        is_active: true
      });
      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create banner",
        variant: "destructive"
      });
    }
  };

  const handleEditBanner = async () => {
    if (!editingBanner) return;

    try {
      const response = await fetch(`/api/admin/cosmetics/banners/${editingBanner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update banner');
      }

      toast({
        title: "Success",
        description: "Banner updated successfully!"
      });

      setShowEditBanner(false);
      setEditingBanner(null);
      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update banner",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cosmetics/banners/${bannerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete banner');
      }

      toast({
        title: "Success",
        description: "Banner deleted successfully!"
      });

      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete banner",
        variant: "destructive"
      });
    }
  };

  const handleCreateFrame = async () => {
    if (!newFrame.id || !newFrame.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (ID, Name).",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/cosmetics/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFrame)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create frame');
      }

      toast({
        title: "Success",
        description: "Avatar frame created successfully!"
      });

      setShowCreateFrame(false);
      setNewFrame(withFrameDefaults({}));
      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create frame",
        variant: "destructive"
      });
    }
  };

  const handleEditFrame = async () => {
    if (!editingFrame) return;

    try {
      const response = await fetch(`/api/admin/cosmetics/frames/${editingFrame.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFrame)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update frame');
      }

      toast({
        title: "Success",
        description: "Avatar frame updated successfully!"
      });

      setShowEditFrame(false);
      setEditingFrame(null);
      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update frame",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFrame = async (frameId: string) => {
    if (!confirm('Are you sure you want to delete this avatar frame? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cosmetics/frames/${frameId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete frame');
      }

      toast({
        title: "Success",
        description: "Avatar frame deleted successfully!"
      });

      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete frame",
        variant: "destructive"
      });
    }
  };

  const handleCreateBadge = async () => {
    if (!newBadge.title || !newBadge.rarity) {
      toast({
        title: "Validation Error",
        description: "Please add a title and rarity.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBadge)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create badge');
      }

      toast({
        title: "Success",
        description: "Badge created successfully!"
      });

      setShowCreateBadge(false);
      setNewBadge(withBadgeDefaults({}));
      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create badge",
        variant: "destructive"
      });
    }
  };

  const handleEditBadge = async () => {
    if (!editingBadge) return;

    try {
      const response = await fetch(`/api/admin/badges/${editingBadge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBadge)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update badge');
      }

      toast({
        title: "Success",
        description: "Badge updated successfully!"
      });

      setShowEditBadge(false);
      setEditingBadge(null);
      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update badge",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/badges/${badgeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete badge');
      }

      toast({
        title: "Success",
        description: "Badge deleted successfully!"
      });

      fetchCosmetics();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete badge",
        variant: "destructive"
      });
    }
  };

  // Parse metadata from imageUrl JSON
  const parseFrameMetadata = (frame: any) => {
    try {
      if (typeof frame.imageUrl === 'string') {
        return JSON.parse(frame.imageUrl);
      }
      return frame;
    } catch {
      return frame;
    }
  };

  const parseBannerMetadata = (banner: any) => {
    try {
      if (typeof banner.imageUrl === 'string') {
        return JSON.parse(banner.imageUrl);
      }
      return banner;
    } catch {
      return banner;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cosmetics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="w-8 h-8" />
            Cosmetics Management
          </h1>
          <p className="text-muted-foreground mt-1">Create, edit, and delete banners and avatar frames with custom styles</p>
        </div>
        <Button onClick={fetchCosmetics} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="banners" className="space-y-6">
        <TabsList>
          <TabsTrigger value="banners">
            <Sparkles className="w-4 h-4 mr-2" />
            Banners ({banners.length})
          </TabsTrigger>
          <TabsTrigger value="frames">
            <Frame className="w-4 h-4 mr-2" />
            Avatar Frames ({avatarFrames.length})
          </TabsTrigger>
        </TabsList>

        {/* BANNERS TAB */}
        <TabsContent value="banners" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Banners</CardTitle>
                  <CardDescription>Manage profile banner cosmetics with custom gradients</CardDescription>
                </div>
                <Button onClick={() => setShowCreateBanner(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {banners.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No banners found. Create your first banner!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {banners.map((banner) => {
                    // Use metadata field only - same as shop
                    const metadata = banner.metadata || {};
                    const gradient = metadata.gradient || 'linear-gradient(135deg, rgb(100 100 100 / 0.3) 0%, rgb(150 150 150 / 0.3) 100%)';
                    
                    return (
                      <Card key={banner.id} className="overflow-hidden">
                        <div
                          className="h-32 relative"
                          style={{ background: gradient }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold drop-shadow-lg text-lg">
                              {banner.name}
                            </span>
                          </div>
                          {(metadata.is_vip || banner.is_vip) && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                                VIP
                              </span>
                            </div>
                          )}
                          {!banner.from_database && banner.from_database !== undefined && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                Default
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{banner.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded capitalize ${
                                banner.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-500' :
                                banner.rarity === 'epic' ? 'bg-purple-500/20 text-purple-500' :
                                banner.rarity === 'rare' ? 'bg-blue-500/20 text-blue-500' :
                                banner.rarity === 'uncommon' ? 'bg-green-500/20 text-green-500' :
                                'bg-gray-500/20 text-gray-500'
                              }`}>
                                {banner.rarity}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {banner.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-yellow-500 font-semibold">
                                {banner.price === 0 || banner.price === '0' ? 'Free' : `${banner.price} coins`}
                              </span>
                              {(metadata.is_vip || banner.is_vip) && (
                                <span className="text-purple-500 text-xs">
                                  VIP: {metadata.vip_tier_required || banner.vip_tier_required || 'Any'}
                                </span>
                              )}
                            </div>
                            {(banner.from_database === undefined || banner.from_database !== false) && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    const metadata = banner.metadata || {};
                                    setEditingBanner({ 
                                      ...banner, 
                                      gradient: metadata.gradient,
                                      is_vip: metadata.is_vip || false,
                                      vip_tier_required: metadata.vip_tier_required || 'none'
                                    });
                                    setShowEditBanner(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteBanner(banner.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AVATAR FRAMES TAB */}
        <TabsContent value="frames" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Avatar Frames</CardTitle>
                  <CardDescription>Manage avatar frame cosmetics with animations and border styles</CardDescription>
                </div>
                <Button onClick={() => setShowCreateFrame(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Frame
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {avatarFrames.length === 0 ? (
                <div className="text-center py-12">
                  <Frame className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No avatar frames found. Create your first frame!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {avatarFrames.map((frame) => {
                    // Use metadata field only - same as shop
                    const metadata = frame.metadata || {};
                    const borderGradient = metadata.border_gradient;
                    const borderWidth = metadata.border_width || 3;
                    const borderColor = metadata.border_color || '#9333ea';
                    const borderStyle = metadata.border_style || 'solid';
                    const shadowColor = metadata.shadow_color || 'rgba(147, 51, 234, 0.5)';

                    const animationType = metadata.animation_type || 'none';
                    const animationSpeed = metadata.animation_speed || 5;
                    const animationClass = animationType === 'pulse' ? 'animate-pulse' :
                                         animationType === 'rotate' ? 'animate-spin-slow' :
                                         animationType === 'glow' ? `animate-glow-${animationSpeed}` :
                                         '';
                    
                    return (
                      <Card key={frame.id} className="overflow-hidden border-0">
                        <div className="h-32 relative flex items-center justify-center bg-transparent">
                          <div className="relative w-24 h-24">
                            {borderGradient ? (
                              <div
                                className={`absolute inset-0 rounded-full ${animationClass}`}
                                style={{
                                  background: borderGradient,
                                  padding: `${borderWidth}px`,
                                  filter: 'none',
                                }}
                              >
                                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                                  <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                                    <span className="text-xs">Avatar</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`absolute inset-0 rounded-full ${animationClass}`}
                                style={{
                                  border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                                  filter: 'none',
                                }}
                              >
                                <div className="w-full h-full rounded-full flex items-center justify-center">
                                  <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                                    <span className="text-xs">Avatar</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {(metadata.is_vip || frame.is_vip) && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                                VIP
                              </span>
                            </div>
                          )}
                          {!frame.from_database && frame.from_database !== undefined && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                Default
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{frame.name}</h3>
                              <span className={`text-xs px-2 py-1 rounded capitalize ${
                                frame.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-500' :
                                frame.rarity === 'epic' ? 'bg-purple-500/20 text-purple-500' :
                                frame.rarity === 'rare' ? 'bg-blue-500/20 text-blue-500' :
                                frame.rarity === 'uncommon' ? 'bg-green-500/20 text-green-500' :
                                'bg-gray-500/20 text-gray-500'
                              }`}>
                                {frame.rarity}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {frame.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-yellow-500 font-semibold">
                                {frame.price === 0 || frame.price === '0' ? 'Free' : `${frame.price} coins`}
                              </span>
                              {(metadata.is_vip || frame.is_vip) && (
                                <span className="text-purple-500 text-xs">
                                  VIP: {metadata.vip_tier_required || frame.vip_tier_required || 'Any'}
                                </span>
                              )}
                            </div>
                            {animationType && animationType !== 'none' && (
                              <div className="flex items-center gap-2 text-xs text-purple-400">
                                <Sparkles className="w-3 h-3" />
                                <span className="capitalize">{animationType} • {(metadata.border_style || frame.border_style || 'solid').toUpperCase()}</span>
                              </div>
                            )}
                            {(frame.from_database === undefined || frame.from_database !== false) && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    const metadata = frame.metadata || {};
                                    setEditingFrame(withFrameDefaults({ 
                                      ...frame,
                                      border_color: metadata.border_color,
                                      border_gradient: metadata.border_gradient,
                                      border_width: metadata.border_width,
                                      border_style: metadata.border_style,
                                      shadow_color: metadata.shadow_color,
                                      animation_type: metadata.animation_type,
                                      animation_speed: metadata.animation_speed,
                                      is_vip: metadata.is_vip,
                                      vip_tier_required: metadata.vip_tier_required
                                    }));
                                    setShowEditFrame(true);
                                  }}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteFrame(frame.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE BANNER DIALOG */}
      <Dialog open={showCreateBanner} onOpenChange={setShowCreateBanner}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Banner</DialogTitle>
            <DialogDescription>Add a new profile banner cosmetic with custom gradient</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-id">Banner ID *</Label>
                <Input
                  id="banner-id"
                  value={newBanner.id}
                  onChange={(e) => setNewBanner({ ...newBanner, id: e.target.value })}
                  placeholder="banner_unique_id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-name">Name *</Label>
                <Input
                  id="banner-name"
                  value={newBanner.name}
                  onChange={(e) => setNewBanner({ ...newBanner, name: e.target.value })}
                  placeholder="Banner Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-description">Description</Label>
              <Textarea
                id="banner-description"
                value={newBanner.description}
                onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                placeholder="Banner description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-gradient">CSS Gradient *</Label>
              <Textarea
                id="banner-gradient"
                value={newBanner.gradient}
                onChange={(e) => setNewBanner({ ...newBanner, gradient: e.target.value })}
                placeholder="linear-gradient(135deg, ...)"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Preview - Same as Shop/Admin:</span>
              </div>
              <div
                className="h-32 rounded border flex items-center justify-center text-white font-bold drop-shadow-lg text-lg"
                style={{ background: newBanner.gradient }}
              >
                {newBanner.name || 'Banner Preview'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-price">Price (coins)</Label>
                <Input
                  id="banner-price"
                  type="number"
                  value={newBanner.price}
                  onChange={(e) => setNewBanner({ ...newBanner, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-rarity">Rarity</Label>
                <Select
                  value={newBanner.rarity}
                  onValueChange={(value) => setNewBanner({ ...newBanner, rarity: value })}
                >
                  <SelectTrigger id="banner-rarity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="banner-vip"
                  checked={newBanner.is_vip}
                  onCheckedChange={(checked) => setNewBanner({ ...newBanner, is_vip: checked })}
                />
                <Label htmlFor="banner-vip">VIP Only</Label>
              </div>
              {newBanner.is_vip && (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="banner-vip-tier">VIP Tier Required</Label>
                  <Select
                    value={newBanner.vip_tier_required}
                    onValueChange={(value) => setNewBanner({ ...newBanner, vip_tier_required: value })}
                  >
                    <SelectTrigger id="banner-vip-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any VIP</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="banner-active"
                  checked={newBanner.is_active}
                  onCheckedChange={(checked) => setNewBanner({ ...newBanner, is_active: checked })}
                />
                <Label htmlFor="banner-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBanner(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBanner}>
              Create Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT BANNER DIALOG */}
      <Dialog open={showEditBanner} onOpenChange={setShowEditBanner}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>Update banner details</DialogDescription>
          </DialogHeader>
          {editingBanner && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Banner ID</Label>
                    <Input value={editingBanner.id} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-banner-name">Name</Label>
                    <Input
                      id="edit-banner-name"
                      value={editingBanner.name}
                      onChange={(e) => setEditingBanner({ ...editingBanner, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-banner-description">Description</Label>
                  <Textarea
                    id="edit-banner-description"
                    value={editingBanner.description}
                    onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-banner-gradient">CSS Gradient</Label>
                  <Textarea
                    id="edit-banner-gradient"
                    value={editingBanner.gradient}
                    onChange={(e) => setEditingBanner({ ...editingBanner, gradient: e.target.value })}
                    rows={2}
                  />
                  <div
                    className="h-32 rounded border flex items-center justify-center text-white font-bold drop-shadow-lg text-lg"
                    style={{ background: editingBanner.gradient }}
                  >
                    {editingBanner.name || 'Banner Preview'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-banner-price">Price (coins)</Label>
                    <Input
                      id="edit-banner-price"
                      type="number"
                      value={editingBanner.price}
                      onChange={(e) => setEditingBanner({ ...editingBanner, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-banner-rarity">Rarity</Label>
                    <Select
                      value={editingBanner.rarity}
                      onValueChange={(value) => setEditingBanner({ ...editingBanner, rarity: value })}
                    >
                      <SelectTrigger id="edit-banner-rarity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-banner-vip"
                      checked={editingBanner.is_vip || false}
                      onCheckedChange={(checked) => setEditingBanner({ ...editingBanner, is_vip: checked })}
                    />
                    <Label htmlFor="edit-banner-vip">VIP Only</Label>
                  </div>
                  {editingBanner.is_vip && (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="edit-banner-vip-tier">VIP Tier</Label>
                      <Select
                        value={editingBanner.vip_tier_required || 'none'}
                        onValueChange={(value) => setEditingBanner({ ...editingBanner, vip_tier_required: value })}
                      >
                        <SelectTrigger id="edit-banner-vip-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Any VIP</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-banner-active"
                      checked={editingBanner.is_active !== false}
                      onCheckedChange={(checked) => setEditingBanner({ ...editingBanner, is_active: checked })}
                    />
                    <Label htmlFor="edit-banner-active">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditBanner(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditBanner}>
                  Update Banner
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

          {/* CREATE BADGE DIALOG */}
          <Dialog open={showCreateBadge} onOpenChange={(open) => {
            setShowCreateBadge(open);
            if (!open) setNewBadge(withBadgeDefaults({}));
          }}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Badge</DialogTitle>
                <DialogDescription>Add a new badge with rarity and unlock requirement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="badge-title">Title *</Label>
                  <Input
                    id="badge-title"
                    value={newBadge.title}
                    onChange={(e) => setNewBadge({ ...newBadge, title: e.target.value })}
                    placeholder="Badge Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge-description">Description</Label>
                  <Textarea
                    id="badge-description"
                    value={newBadge.description}
                    onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                    placeholder="What does this badge represent?"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge-rarity">Rarity</Label>
                    <Select
                      value={newBadge.rarity}
                      onValueChange={(value) => setNewBadge({ ...newBadge, rarity: value })}
                    >
                      <SelectTrigger id="badge-rarity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMMON">Common</SelectItem>
                        <SelectItem value="RARE">Rare</SelectItem>
                        <SelectItem value="EPIC">Epic</SelectItem>
                        <SelectItem value="LEGENDARY">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge-image">Image URL</Label>
                    <Input
                      id="badge-image"
                      value={newBadge.imageUrl}
                      onChange={(e) => setNewBadge({ ...newBadge, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge-requirement">Requirement Type</Label>
                  <Select
                    value={newBadge.requirementType}
                    onValueChange={(value) => setNewBadge({ ...newBadge, requirementType: value })}
                  >
                    <SelectTrigger id="badge-requirement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BADGE_REQUIREMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newBadge.requirementValue}
                    onChange={(e) => setNewBadge({ ...newBadge, requirementValue: e.target.value })}
                    placeholder="Requirement value (e.g., achievement ID)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateBadge(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBadge}>Create Badge</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* EDIT BADGE DIALOG */}
          <Dialog open={showEditBadge} onOpenChange={(open) => {
            setShowEditBadge(open);
            if (!open) setEditingBadge(null);
          }}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Badge</DialogTitle>
                <DialogDescription>Update badge details</DialogDescription>
              </DialogHeader>
              {editingBadge && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-badge-title">Title *</Label>
                      <Input
                        id="edit-badge-title"
                        value={editingBadge.title}
                        onChange={(e) => setEditingBadge({ ...editingBadge, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-badge-description">Description</Label>
                      <Textarea
                        id="edit-badge-description"
                        value={editingBadge.description}
                        onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-badge-rarity">Rarity</Label>
                        <Select
                          value={editingBadge.rarity}
                          onValueChange={(value) => setEditingBadge({ ...editingBadge, rarity: value })}
                        >
                          <SelectTrigger id="edit-badge-rarity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COMMON">Common</SelectItem>
                            <SelectItem value="RARE">Rare</SelectItem>
                            <SelectItem value="EPIC">Epic</SelectItem>
                            <SelectItem value="LEGENDARY">Legendary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-badge-image">Image URL</Label>
                        <Input
                          id="edit-badge-image"
                          value={editingBadge.imageUrl || ''}
                          onChange={(e) => setEditingBadge({ ...editingBadge, imageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-badge-requirement">Requirement Type</Label>
                      <Select
                        value={editingBadge.requirementType || 'ACHIEVEMENT_UNLOCK'}
                        onValueChange={(value) => setEditingBadge({ ...editingBadge, requirementType: value })}
                      >
                        <SelectTrigger id="edit-badge-requirement">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BADGE_REQUIREMENT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={editingBadge.requirementValue || ''}
                        onChange={(e) => setEditingBadge({ ...editingBadge, requirementValue: e.target.value })}
                        placeholder="Requirement value"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditBadge(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditBadge}>Update Badge</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

      {/* CREATE FRAME DIALOG */}
      <Dialog open={showCreateFrame} onOpenChange={setShowCreateFrame}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Avatar Frame</DialogTitle>
            <DialogDescription>Add a new avatar frame cosmetic with custom styles and animations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frame-id">Frame ID *</Label>
                <Input
                  id="frame-id"
                  value={newFrame.id}
                  onChange={(e) => setNewFrame({ ...newFrame, id: e.target.value })}
                  placeholder="frame_unique_id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frame-name">Name *</Label>
                <Input
                  id="frame-name"
                  value={newFrame.name}
                  onChange={(e) => setNewFrame({ ...newFrame, name: e.target.value })}
                  placeholder="Frame Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frame-description">Description</Label>
              <Textarea
                id="frame-description"
                value={newFrame.description}
                onChange={(e) => setNewFrame({ ...newFrame, description: e.target.value })}
                placeholder="Frame description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frame-border-gradient">Border Gradient (CSS)</Label>
              <Input
                id="frame-border-gradient"
                value={newFrame.border_gradient || ''}
                onChange={(e) => setNewFrame({ ...newFrame, border_gradient: e.target.value })}
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use solid color</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frame-border-color">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="frame-border-color"
                    type="color"
                    value={newFrame.border_color}
                    onChange={(e) => setNewFrame({ ...newFrame, border_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={newFrame.border_color}
                    onChange={(e) => setNewFrame({ ...newFrame, border_color: e.target.value })}
                    placeholder="#9333ea"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Used if no gradient set</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frame-border-width">Border Width (px)</Label>
                <Input
                  id="frame-border-width"
                  type="number"
                  min="1"
                  max="20"
                  value={newFrame.border_width}
                  onChange={(e) => setNewFrame({ ...newFrame, border_width: parseInt(e.target.value) || 4 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frame-border-style">Border Style</Label>
                <Select
                  value={newFrame.border_style}
                  onValueChange={(value) => setNewFrame({ ...newFrame, border_style: value })}
                >
                  <SelectTrigger id="frame-border-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frame-animation-type">Animation Type</Label>
                <Select
                  value={newFrame.animation_type}
                  onValueChange={(value) => setNewFrame({ ...newFrame, animation_type: value })}
                >
                  <SelectTrigger id="frame-animation-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="glow">Glow</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="rotate">Rotate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newFrame.animation_type !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="frame-animation-speed">Animation Speed (1-10)</Label>
                <Input
                  id="frame-animation-speed"
                  type="number"
                  min="1"
                  max="10"
                  value={newFrame.animation_speed}
                  onChange={(e) => setNewFrame({ ...newFrame, animation_speed: parseInt(e.target.value) || 5 })}
                />
                <p className="text-xs text-muted-foreground">Higher = faster animation</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="frame-shadow-color">Shadow Color (RGBA)</Label>
              <Input
                id="frame-shadow-color"
                value={newFrame.shadow_color}
                onChange={(e) => setNewFrame({ ...newFrame, shadow_color: e.target.value })}
                placeholder="rgba(147, 51, 234, 0.5)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frame-price">Price (coins)</Label>
                <Input
                  id="frame-price"
                  type="number"
                  value={newFrame.price}
                  onChange={(e) => setNewFrame({ ...newFrame, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frame-rarity">Rarity</Label>
                <Select
                  value={newFrame.rarity}
                  onValueChange={(value) => setNewFrame({ ...newFrame, rarity: value })}
                >
                  <SelectTrigger id="frame-rarity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="frame-vip"
                  checked={newFrame.is_vip}
                  onCheckedChange={(checked) => setNewFrame({ ...newFrame, is_vip: checked })}
                />
                <Label htmlFor="frame-vip">VIP Only</Label>
              </div>
              {newFrame.is_vip && (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="frame-vip-tier">VIP Tier Required</Label>
                  <Select
                    value={newFrame.vip_tier_required}
                    onValueChange={(value) => setNewFrame({ ...newFrame, vip_tier_required: value })}
                  >
                    <SelectTrigger id="frame-vip-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any VIP</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="frame-active"
                  checked={newFrame.is_active}
                  onCheckedChange={(checked) => setNewFrame({ ...newFrame, is_active: checked })}
                />
                <Label htmlFor="frame-active">Active</Label>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview - Same as Shop</Label>
              <div className="h-40 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded flex items-center justify-center">
                <div className="relative w-24 h-24">
                  {newFrame.border_gradient ? (
                    <div
                      className={`absolute inset-0 rounded-full ${
                        newFrame.animation_type === 'pulse' ? 'animate-pulse' :
                        newFrame.animation_type === 'rotate' ? 'animate-spin-slow' :
                        newFrame.animation_type === 'glow' ? `animate-glow-${newFrame.animation_speed}` :
                        ''
                      }`}
                      style={{
                        background: newFrame.border_gradient,
                        padding: `${newFrame.border_width}px`,
                        filter: 'none',
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                          <span className="text-xs">Avatar</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`absolute inset-0 rounded-full ${
                        newFrame.animation_type === 'pulse' ? 'animate-pulse' :
                        newFrame.animation_type === 'rotate' ? 'animate-spin-slow' :
                        newFrame.animation_type === 'glow' ? `animate-glow-${newFrame.animation_speed}` :
                        ''
                      }`}
                      style={{
                        border: `${newFrame.border_width}px ${newFrame.border_style} ${newFrame.border_color}`,
                        filter: 'none',
                      }}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                          <span className="text-xs">Avatar</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFrame(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFrame}>
              Create Frame
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT FRAME DIALOG */}
      <Dialog open={showEditFrame} onOpenChange={setShowEditFrame}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Avatar Frame</DialogTitle>
            <DialogDescription>Update frame details and styles</DialogDescription>
          </DialogHeader>
          {editingFrame && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frame ID</Label>
                    <Input value={editingFrame.id} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-name">Name</Label>
                    <Input
                      id="edit-frame-name"
                      value={editingFrame.name}
                      onChange={(e) => setEditingFrame({ ...editingFrame, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-frame-description">Description</Label>
                  <Textarea
                    id="edit-frame-description"
                    value={editingFrame.description}
                    onChange={(e) => setEditingFrame({ ...editingFrame, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-frame-border-gradient">Border Gradient (CSS)</Label>
                  <Input
                    id="edit-frame-border-gradient"
                    value={editingFrame.border_gradient || ''}
                    onChange={(e) => setEditingFrame({ ...editingFrame, border_gradient: e.target.value })}
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to use solid color</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-border-color">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-frame-border-color"
                        type="color"
                        value={editingFrame.border_color}
                        onChange={(e) => setEditingFrame({ ...editingFrame, border_color: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={editingFrame.border_color}
                        onChange={(e) => setEditingFrame({ ...editingFrame, border_color: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Used if no gradient set</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-border-width">Border Width (px)</Label>
                    <Input
                      id="edit-frame-border-width"
                      type="number"
                      min="1"
                      max="20"
                      value={editingFrame.border_width}
                      onChange={(e) => setEditingFrame({ ...editingFrame, border_width: parseInt(e.target.value) || 4 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-border-style">Border Style</Label>
                    <Select
                      value={editingFrame.border_style}
                      onValueChange={(value) => setEditingFrame({ ...editingFrame, border_style: value })}
                    >
                      <SelectTrigger id="edit-frame-border-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-animation-type">Animation Type</Label>
                    <Select
                      value={editingFrame.animation_type}
                      onValueChange={(value) => setEditingFrame({ ...editingFrame, animation_type: value })}
                    >
                      <SelectTrigger id="edit-frame-animation-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="glow">Glow</SelectItem>
                        <SelectItem value="pulse">Pulse</SelectItem>
                        <SelectItem value="rotate">Rotate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editingFrame.animation_type !== 'none' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-animation-speed">Animation Speed (1-10)</Label>
                    <Input
                      id="edit-frame-animation-speed"
                      type="number"
                      min="1"
                      max="10"
                      value={editingFrame.animation_speed}
                      onChange={(e) => setEditingFrame({ ...editingFrame, animation_speed: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-frame-shadow-color">Shadow Color (RGBA)</Label>
                  <Input
                    id="edit-frame-shadow-color"
                    value={editingFrame.shadow_color}
                    onChange={(e) => setEditingFrame({ ...editingFrame, shadow_color: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-price">Price (coins)</Label>
                    <Input
                      id="edit-frame-price"
                      type="number"
                      value={editingFrame.price}
                      onChange={(e) => setEditingFrame({ ...editingFrame, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-frame-rarity">Rarity</Label>
                    <Select
                      value={editingFrame.rarity}
                      onValueChange={(value) => setEditingFrame({ ...editingFrame, rarity: value })}
                    >
                      <SelectTrigger id="edit-frame-rarity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-frame-vip"
                      checked={editingFrame.is_vip || false}
                      onCheckedChange={(checked) => setEditingFrame({ ...editingFrame, is_vip: checked })}
                    />
                    <Label htmlFor="edit-frame-vip">VIP Only</Label>
                  </div>
                  {editingFrame.is_vip && (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="edit-frame-vip-tier">VIP Tier</Label>
                      <Select
                        value={editingFrame.vip_tier_required || 'none'}
                        onValueChange={(value) => setEditingFrame({ ...editingFrame, vip_tier_required: value })}
                      >
                        <SelectTrigger id="edit-frame-vip-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Any VIP</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-frame-active"
                      checked={editingFrame.is_active !== false}
                      onCheckedChange={(checked) => setEditingFrame({ ...editingFrame, is_active: checked })}
                    />
                    <Label htmlFor="edit-frame-active">Active</Label>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview - Same as Shop</Label>
                  <div className="h-40 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      {editingFrame.border_gradient ? (
                        <div
                          className={`absolute inset-0 rounded-full ${
                            editingFrame.animation_type === 'pulse' ? 'animate-pulse' :
                            editingFrame.animation_type === 'rotate' ? 'animate-spin-slow' :
                            editingFrame.animation_type === 'glow' ? `animate-glow-${editingFrame.animation_speed}` :
                            ''
                          }`}
                          style={{
                            background: editingFrame.border_gradient,
                            padding: `${editingFrame.border_width}px`,
                            filter: 'none',
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                            <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                              <span className="text-xs">Avatar</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`absolute inset-0 rounded-full ${
                            editingFrame.animation_type === 'pulse' ? 'animate-pulse' :
                            editingFrame.animation_type === 'rotate' ? 'animate-spin-slow' :
                            editingFrame.animation_type === 'glow' ? `animate-glow-${editingFrame.animation_speed}` :
                            ''
                          }`}
                          style={{
                            border: `${editingFrame.border_width}px ${editingFrame.border_style} ${editingFrame.border_color}`,
                            filter: 'none',
                          }}
                        >
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                              <span className="text-xs">Avatar</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditFrame(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditFrame}>
                  Update Frame
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
