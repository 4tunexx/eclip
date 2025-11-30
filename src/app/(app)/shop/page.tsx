import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shopItems } from "@/lib/placeholder-data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Gem, Shield, Crown, Star, Trophy } from "lucide-react";

const rarityColorMap = {
    Common: "border-gray-500 text-gray-400",
    Rare: "border-blue-500 text-blue-400",
    Epic: "border-purple-500 text-purple-400",
    Legendary: "border-yellow-500 text-yellow-400",
};

export default function ShopPage() {
  return (
    <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Shop</h1>
                <p className="text-muted-foreground">Spend your hard-earned coins on cosmetics to customize your profile.</p>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2">
                <CircleDollarSign className="w-6 h-6 text-yellow-400"/>
                <span className="text-lg font-bold text-foreground">1,337.42</span>
                 <span className="text-muted-foreground">Coins</span>
            </div>
        </div>

        <Tabs defaultValue="featured">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
                <TabsTrigger value="featured"><Star className="mr-2" />Featured</TabsTrigger>
                <TabsTrigger value="frames"><Gem className="mr-2" />Frames</TabsTrigger>
                <TabsTrigger value="banners"><Shield className="mr-2" />Banners</TabsTrigger>
                <TabsTrigger value="badges"><Trophy className="mr-2" />Badges</TabsTrigger>
                <TabsTrigger value="titles"><Crown className="mr-2" />Titles</TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {shopItems.map(item => (
                        <Card key={item.id} className="bg-card/60 backdrop-blur-lg border border-white/10 overflow-hidden glow-card-hover flex flex-col">
                           {item.imageUrl && (
                            <CardHeader className="p-0 relative h-32">
                                    <Image src={item.imageUrl} alt={item.name} fill style={{objectFit:"cover"}} sizes="100vw" className="opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                            </CardHeader>
                           )}
                           <CardContent className={`p-4 space-y-2 flex-grow ${!item.imageUrl ? 'pt-6' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                     <Badge variant="outline" className={rarityColorMap[item.rarity]}>{item.rarity}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                           </CardContent>
                           <CardFooter>
                                <Button className="w-full" disabled={item.owned}>
                                    {item.owned ? "Owned" : (
                                        <>
                                            <CircleDollarSign className="mr-2 h-4 w-4"/>
                                            {item.price} Coins
                                        </>
                                    )}
                                </Button>
                           </CardFooter>
                        </Card>
                    ))}
                </div>
            </TabsContent>
             <TabsContent value="frames" className="mt-6">
                <p className="text-muted-foreground">Avatar frames will be available here.</p>
             </TabsContent>
              <TabsContent value="banners" className="mt-6">
                <p className="text-muted-foreground">Profile banners will be available here.</p>
             </TabsContent>
               <TabsContent value="badges" className="mt-6">
                <p className="text-muted-foreground">Profile badges will be available here.</p>
             </TabsContent>
              <TabsContent value="titles" className="mt-6">
                <p className="text-muted-foreground">Profile titles will be available here.</p>
             </TabsContent>
        </Tabs>
    </div>
  );
}
