import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      question: "How does the ranking system work?",
      answer: "Our ranking system is based on an MMR (Matchmaking Rating) score. You gain or lose MMR based on match outcomes and your performance. Your rank is determined by your current MMR range.",
    },
    {
      question: "How do I earn coins?",
      answer: "You can earn coins by winning matches, completing daily/weekly missions, and unlocking achievements. Coins can be used to purchase cosmetics from the shop.",
    },
    {
      question: "What is the anti-cheat policy?",
      answer: "We have a zero-tolerance policy for cheating. Our anti-cheat system combines a client-side agent with server-side analysis. Confirmed cheaters will be permanently banned.",
    },
    {
        question: "How do I link my Steam account?",
        answer: "You can link your Steam account in the Settings > Account page. A linked Steam account is required to play matches.",
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">Get help with your account, report a bug, or contact us.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>If you can't find an answer in the FAQ, please submit a ticket.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="account">Account Issue</SelectItem>
                                    <SelectItem value="billing">Billing/Coins</SelectItem>
                                    <SelectItem value="bug">Bug Report</SelectItem>
                                    <SelectItem value="player">Player Report</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Unable to login" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Please describe your issue in detail..." className="min-h-32" />
                    </div>
                    <Button>Submit Ticket</Button>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                            {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
