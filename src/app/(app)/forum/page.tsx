import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { forumCategories, recentForumActivity } from "@/lib/placeholder-data";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";

export default function ForumPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold">Forum</h1>
                <p className="text-muted-foreground">Discuss strategies, find teammates, and engage with the community.</p>
            </div>
            <Button>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                New Thread
            </Button>
        </div>

        {forumCategories.map(category => (
            <Card key={category.id} className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60%]">Thread</TableHead>
                                <TableHead className="text-center">Replies</TableHead>
                                <TableHead className="text-center">Views</TableHead>
                                <TableHead className="text-right">Last Post</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentForumActivity.filter(activity => activity.categoryId === category.id).map(thread => (
                                <TableRow key={thread.id}>
                                    <TableCell>
                                        <div className="font-medium hover:text-primary transition-colors">
                                            <Link href="#">{thread.title}</Link>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            by <Link href="#" className="hover:text-primary">{thread.author.username}</Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{thread.replies}</TableCell>
                                    <TableCell className="text-center">{thread.views}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span>by <Link href="#" className="hover:text-primary">{thread.lastPost.author.username}</Link></span>
                                            <span className="text-xs text-muted-foreground">{thread.lastPost.date}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        ))}
    </div>
  );
}
