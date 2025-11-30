'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { UserName } from "@/components/user-name";
import { MessageSquarePlus, Loader2 } from "lucide-react";

export default function ForumPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [threadsByCategory, setThreadsByCategory] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      const [categoriesRes, threadsRes] = await Promise.all([
        fetch('/api/forum/categories'),
        fetch('/api/forum/threads'),
      ]);

      const categoriesData = await categoriesRes.json();
      const threadsData = await threadsRes.json();

      if (categoriesRes.ok) {
        setCategories(categoriesData.categories || []);
      }

      if (threadsRes.ok && categoriesRes.ok) {
        const threads = threadsData.threads || [];
        const cats = categoriesData.categories || [];
        const grouped: Record<string, any[]> = {};
        
        cats.forEach((cat: any) => {
          grouped[cat.id] = [];
        });

        threads.forEach((thread: any) => {
          if (!grouped[thread.categoryId]) {
            grouped[thread.categoryId] = [];
          }
          grouped[thread.categoryId].push(thread);
        });

        setThreadsByCategory(grouped);
      }
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold">Forum</h1>
                <p className="text-muted-foreground">Discuss strategies, find teammates, and engage with the community.</p>
            </div>
            <Button disabled>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                New Thread
            </Button>
        </div>

        {categories.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">No forum categories available yet.</p>
            </CardContent>
          </Card>
        ) : (
          categories.map(category => (
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
                    {!threadsByCategory[category.id] || threadsByCategory[category.id].length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No threads in this category yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      threadsByCategory[category.id].map(thread => (
                        <TableRow key={thread.id}>
                          <TableCell>
                            <div className="font-medium hover:text-primary transition-colors">
                              <Link href="#">{thread.title}</Link>
                            </div>
                            <div className="text-sm">
                              by <Link href="#"><UserName username={thread.author?.username || 'Unknown'} role={thread.author?.role} /></Link>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{thread.replies}</TableCell>
                          <TableCell className="text-center">{thread.views}</TableCell>
                          <TableCell className="text-right">
                            {thread.lastPost ? (
                              <div className="flex flex-col items-end">
                                <span>
                                  by <Link href="#"><UserName username={thread.lastPost.author?.username || 'Unknown'} role={thread.lastPost.author?.role} /></Link>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(thread.lastPost.date).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No posts yet</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
    </div>
  );
}
