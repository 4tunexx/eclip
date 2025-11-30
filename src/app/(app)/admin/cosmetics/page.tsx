import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { shopItems } from "@/lib/placeholder-data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const rarityColorMap = {
    Common: "border-gray-500 text-gray-400",
    Rare: "border-blue-500 text-blue-400",
    Epic: "border-purple-500 text-purple-400",
    Legendary: "border-yellow-500 text-yellow-400",
};


export default function CosmeticsPage() {
  return (
    <TabsContent value="/admin/cosmetics" className="space-y-4">
        <div className="space-y-8 mt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-headline text-2xl font-semibold">Cosmetics Management</h2>
                    <p className="text-muted-foreground">Add, edit, or remove cosmetic items from the shop.</p>
                </div>
                <Button>
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
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Rarity</TableHead>
                                <TableHead>Price (Coins)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shopItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover"/>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={rarityColorMap[item.rarity]}>{item.rarity}</Badge>
                                    </TableCell>
                                    <TableCell>{item.price}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
