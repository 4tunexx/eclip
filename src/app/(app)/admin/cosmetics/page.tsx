'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const rarityColorMap = {
    Common: "border-gray-500 text-gray-400",
    Rare: "border-blue-500 text-blue-400",
    Epic: "border-purple-500 text-purple-400",
    Legendary: "border-yellow-500 text-yellow-400",
};

export default function CosmeticsPage() {
  const [cosmetics, setCosmetics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCosmetics();
  }, []);

  const fetchCosmetics = async () => {
    try {
      const response = await fetch('/api/admin/cosmetics');
      const data = await response.json();
      
      if (response.ok) {
        setCosmetics(data.items || []);
      } else {
        throw new Error(data.error || 'Failed to fetch cosmetics');
      }
    } catch (error: any) {
      console.error('Error fetching cosmetics:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load cosmetics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value="/admin/cosmetics" className="space-y-4">
        <div className="space-y-8 mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-headline text-2xl font-semibold">Cosmetics Management</h2>
                    <p className="text-muted-foreground">Add, edit, or remove cosmetic items from the shop.</p>
                </div>
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Item
                </Button>
            </div>
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Shop Items</CardTitle>
                    <CardDescription>
                       A list of all cosmetic items currently available in the system.
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
                                  <TableHead className="w-[100px]">Image</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Rarity</TableHead>
                                  <TableHead>Price (Coins)</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cosmetics.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                  No cosmetics found. Add your first item!
                                </TableCell>
                              </TableRow>
                            ) : (
                              cosmetics.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.imageUrl ? (
                                          <Image 
                                            src={item.imageUrl} 
                                            alt={item.name} 
                                            width={40} 
                                            height={40} 
                                            className="rounded-md object-cover"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-md bg-secondary" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={rarityColorMap[item.rarity as keyof typeof rarityColorMap]}>
                                          {item.rarity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.price}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.isActive ? "default" : "secondary"}>
                                          {item.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="icon" disabled>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
