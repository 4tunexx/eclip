'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { handleReview, FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Lightbulb, FileText, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState: FormState = {
  status: 'idle',
  message: '',
  result: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Bot className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Review Logs'
      )}
    </Button>
  );
}

export function ReviewForm() {
  const [state, formAction] = useActionState(handleReview, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'error' && state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    } else if (state.status === 'success') {
      toast({
        title: 'Analysis Complete',
        description: 'AI review of the logs is complete.',
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <div className="space-y-8 mt-6">
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10">
        <CardHeader>
          <CardTitle>Anti-Cheat Log Review</CardTitle>
          <CardDescription>
            Paste the raw anti-cheat logs into the text area below. The AI will analyze them for suspicious patterns and provide recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <Textarea
              name="logs"
              placeholder="[AC-LOG] Player 'xX_Sniper_Xx' triggered event AIM_SNAP_ASSIST..."
              className="min-h-[200px] font-mono text-xs"
              required
            />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {state.status === 'loading' && (
         <div className="space-y-4">
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Bot className="mr-2 h-5 w-5 animate-spin" />
                AI is analyzing the logs...
            </div>
        </div>
      )}

      {state.status === 'success' && state.result && (
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
                <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Log Summary</AlertTitle>
                    <AlertDescription>
                        {state.result.summary}
                    </AlertDescription>
                </Alert>
            </div>
            <div className="lg:col-span-2">
                 <Card className="h-full bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                             <Terminal className="h-5 w-5 text-primary" />
                             <CardTitle>Suspicious Patterns</CardTitle>
                        </div>
                        <CardDescription>Patterns detected that may indicate cheating.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{state.result.suspiciousPatterns}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card className="h-full bg-card/60 backdrop-blur-lg border border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            <CardTitle>Recommendations</CardTitle>
                        </div>
                        <CardDescription>Suggested actions for moderators.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{state.result.recommendations}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
