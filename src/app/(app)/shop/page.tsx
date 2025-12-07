'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Gem, Shield, Crown, Star, Trophy, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

const rarityColorMap = {
    Common: "border-gray-500 text-gray-400",
    Rare: "border-blue-500 text-blue-400",
    Epic: "border-purple-500 text-purple-400",
    Legendary: "border-yellow-500 text-yellow-400",
};

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);
  const { user, refetch: refetchUser } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/shop/items');
      const data = await response.json();
      if (response.ok) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching shop items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId);
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosmeticId: itemId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      toast({
        title: 'Success!',
        description: 'Item purchased successfully.',
      });

      await refetchUser();
      await fetchItems();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to purchase item',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (itemId: string, type: string) => {
    setEquipping(itemId);
    try {
      const response = await fetch('/api/shop/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosmeticId: itemId, type }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to equip item');
      }

      toast({
        title: 'Success!',
        description: 'Item equipped successfully.',
      });

      await refetchUser();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to equip item',
        variant: 'destructive',
      });
    } finally {
      setEquipping(null);
    }
  };

  const groupedItems = {
    featured: items.filter(item => item.rarity === 'Legendary' || item.rarity === 'Epic').slice(0, 8),
    frames: items.filter(item => item.type === 'Frame'),
    banners: items.filter(item => item.type === 'Banner'),
    badges: items.filter(item => item.type === 'Badge'),
    titles: items.filter(item => item.type === 'Title'),
  };

  if (isLoading) {
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
                <h1 className="font-headline text-3xl font-bold">Shop</h1>
                <p className="text-muted-foreground">Spend your hard-earned coins on cosmetics to customize your profile.</p>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2">
                <CircleDollarSign className="w-6 h-6 text-yellow-400"/>
                <span className="text-lg font-bold text-foreground">{user?.coins?.toFixed(2) || '0.00'}</span>
                 <span className="text-muted-foreground">Coins</span>
            </div>
        </div>

        <Tabs defaultValue="featured">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                <TabsTrigger value="featured"><Star className="mr-2" />Featured</TabsTrigger>
                <TabsTrigger value="frames"><Gem className="mr-2" />Frames</TabsTrigger>
                <TabsTrigger value="banners"><Shield className="mr-2" />Banners</TabsTrigger>
                <TabsTrigger value="titles"><Crown className="mr-2" />Titles</TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedItems.featured.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onPurchase={handlePurchase}
                            onEquip={handleEquip}
                            purchasing={purchasing === item.id}
                            equipping={equipping === item.id}
                            rarityColorMap={rarityColorMap}
                        />
                    ))}
                    {groupedItems.featured.length === 0 && (
                        <p className="text-muted-foreground col-span-full">No featured items available.</p>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="frames" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedItems.frames.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onPurchase={handlePurchase}
                            onEquip={handleEquip}
                            purchasing={purchasing === item.id}
                            equipping={equipping === item.id}
                            rarityColorMap={rarityColorMap}
                        />
                    ))}
                    {groupedItems.frames.length === 0 && (
                        <p className="text-muted-foreground col-span-full">No frames available.</p>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="banners" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedItems.banners.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onPurchase={handlePurchase}
                            onEquip={handleEquip}
                            purchasing={purchasing === item.id}
                            equipping={equipping === item.id}
                            rarityColorMap={rarityColorMap}
                        />
                    ))}
                    {groupedItems.banners.length === 0 && (
                        <p className="text-muted-foreground col-span-full">No banners available.</p>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="badges" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedItems.badges.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onPurchase={handlePurchase}
                            onEquip={handleEquip}
                            purchasing={purchasing === item.id}
                            equipping={equipping === item.id}
                            rarityColorMap={rarityColorMap}
                        />
                    ))}
                    {groupedItems.badges.length === 0 && (
                        <p className="text-muted-foreground col-span-full">No badges available.</p>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="titles" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedItems.titles.map(item => (
                        <ShopItemCard
                            key={item.id}
                            item={item}
                            onPurchase={handlePurchase}
                            onEquip={handleEquip}
                            purchasing={purchasing === item.id}
                            equipping={equipping === item.id}
                            rarityColorMap={rarityColorMap}
                        />
                    ))}
                    {groupedItems.titles.length === 0 && (
                        <p className="text-muted-foreground col-span-full">No titles available.</p>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}

function ShopItemCard({ item, onPurchase, onEquip, purchasing, equipping, rarityColorMap }: any) {
  const [imageError, setImageError] = useState(false);

  const getRarityGradient = () => {
    const rarity = item.rarity?.toLowerCase() || 'common';
    const gradients: any = {
      legendary: 'from-yellow-600 via-yellow-400 to-amber-600',
      epic: 'from-purple-600 via-purple-400 to-pink-600',
      rare: 'from-blue-600 via-blue-400 to-cyan-600',
      common: 'from-gray-600 via-gray-400 to-gray-500',
    };
    return gradients[rarity] || gradients.common;
  };

  // Use metadata from database (already parsed by API)
  const metadata = item.metadata || {};
  const rarity = item.rarity?.toLowerCase() || 'common';
  const cosmeticImageUrl = (item.type === 'Badge') ? `/api/cosmetics/generate/badge?rarity=${rarity}&label=${item.name}` : null;

  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden glow-card-hover flex flex-col">
      <CardHeader className="p-0 relative h-32 bg-transparent">
        {item.type === 'Frame' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-20 h-20">
              {metadata.border_gradient ? (
                <div
                  className={`absolute inset-0 rounded-full ${
                    metadata.animation_type === 'pulse' ? 'animate-pulse' :
                    metadata.animation_type === 'rotate' ? 'animate-spin-slow' :
                    metadata.animation_type === 'glow' ? `animate-glow-${metadata.animation_speed || 5}` :
                    ''
                  }`}
                  style={{
                    background: metadata.border_gradient,
                    padding: `${metadata.border_width || 3}px`,
                    filter: 'none',
                  }}
                >
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <div className="w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                      <span className="text-xs">Avatar</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`absolute inset-0 rounded-full ${
                    metadata.animation_type === 'pulse' ? 'animate-pulse' :
                    metadata.animation_type === 'rotate' ? 'animate-spin-slow' :
                    metadata.animation_type === 'glow' ? `animate-glow-${metadata.animation_speed || 5}` :
                    ''
                  }`}
                  style={{
                    border: `${metadata.border_width || 3}px ${metadata.border_style || 'solid'} ${metadata.border_color || '#9333ea'}`,
                    filter: 'none',
                  }}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-muted-foreground/40">
                      <span className="text-xs">Avatar</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : item.type === 'Banner' ? (
          <div
            className="absolute inset-0"
            style={{ background: metadata.gradient || item.imageUrl || 'linear-gradient(135deg, rgb(100 100 100 / 0.3) 0%, rgb(150 150 150 / 0.3) 100%)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          </div>
        ) : cosmeticImageUrl && !imageError ? (
          <>
            <Image
              src={cosmeticImageUrl}
              alt={item.name}
              fill
              style={{ objectFit: "contain" }}
              sizes="100vw"
              className="opacity-90 p-2"
              onError={() => setImageError(true)}
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gem className="h-12 w-12 text-white/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          </div>
        )}
      </CardHeader>
      <CardContent className={`p-4 space-y-2 flex-grow ${!cosmeticImageUrl ? 'pt-6' : ''}`}>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{item.name}</h3>
          <Badge variant="outline" className={rarityColorMap[item.rarity as keyof typeof rarityColorMap]}>
            {item.rarity}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter>
        {item.owned ? (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onEquip(item.id, item.type)}
            disabled={equipping}
          >
            {equipping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Equipping...
              </>
            ) : (
              'Equip'
            )}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onPurchase(item.id)}
            disabled={purchasing}
          >
            {purchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Purchasing...
              </>
            ) : (
              <>
                <CircleDollarSign className="mr-2 h-4 w-4"/>
                {item.price} Coins
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
