import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SteamIcon } from '@/components/icons/SteamIcon';

export function RegisterForm() {
  return (
    <div className="pt-4">
        <CardContent className="grid gap-4">
            <Button variant="outline" className="w-full">
                <SteamIcon className="mr-2 h-5 w-5"/>
                Sign up with Steam
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or create an account
                    </span>
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="your_handle" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email-reg">Email</Label>
                <Input id="email-reg" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-reg">Password</Label>
                <Input id="password-reg" type="password" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required />
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/dashboard">Create Account</Link>
          </Button>
        </CardFooter>
    </div>
  );
}
