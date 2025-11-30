import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";

export default function PlayPage() {
  return (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10 text-center w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Find a Match</CardTitle>
          <CardDescription>
            Select your game mode and start competing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Game Mode</h3>
                <p className="text-muted-foreground">Competitive 5v5</p>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold">Region</h3>
                <p className="text-muted-foreground">Automatic (EU West - 25ms)</p>
            </div>
            <Button size="lg" className="w-full font-bold text-lg">
                <Swords className="mr-2 h-6 w-6"/>
                Start Search
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
