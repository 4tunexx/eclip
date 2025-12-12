'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Crown, Gift, Zap, Users, Shield, Sparkles, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VIPPopupProps {
  isOpen: boolean;
  onClose: () => void;
  vipStatus: {
    vip_active: boolean;
    expires_at?: Date;
    auto_renew?: boolean;
    days_remaining?: number;
    benefits?: any;
  };
  userCoins: number;
  onPurchaseSuccess: () => void;
}

export function VIPPopup({
  isOpen,
  onClose,
  vipStatus,
  userCoins,
  onPurchaseSuccess,
}: VIPPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const VIP_COST = 100;
  const hasEnoughCoins = userCoins >= VIP_COST;

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to purchase VIP');
        return;
      }

      // Success
      onPurchaseSuccess();
      onClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('VIP purchase error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel VIP? You will lose all benefits immediately.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vip', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'User cancelled' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to cancel VIP');
        return;
      }

      // Success
      onPurchaseSuccess();
      onClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('VIP cancel error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-400" />
            Become VIP
          </DialogTitle>
          <DialogDescription>
            Unlock exclusive benefits and dominate the leaderboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          {vipStatus.vip_active && (
            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950">
              <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                ✅ You are currently VIP!
                {vipStatus.days_remaining && (
                  <span> Expires in {vipStatus.days_remaining} days</span>
                )}
                {vipStatus.auto_renew && (
                  <span> • Auto-renew enabled</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-4">
            <BenefitCard
              icon={<Crown className="h-5 w-5 text-yellow-400" />}
              title="VIP Role"
              description="Golden nickname + VIP badge"
            />
            <BenefitCard
              icon={<Zap className="h-5 w-5 text-blue-400" />}
              title="+10% ESR Gain"
              description="Rank up 10% faster"
            />
            <BenefitCard
              icon={<Gift className="h-5 w-5 text-purple-400" />}
              title="+20% XP Gain"
              description="Level up 20% faster"
            />
            <BenefitCard
              icon={<Users className="h-5 w-5 text-green-400" />}
              title="Queue Priority"
              description="First in matchmaking line"
            />
            <BenefitCard
              icon={<Shield className="h-5 w-5 text-orange-400" />}
              title="Team Leader"
              description="Selected as team captain first"
            />
            <BenefitCard
              icon={<Sparkles className="h-5 w-5 text-pink-400" />}
              title="Premium Profile"
              description="Enhanced hover card & mini profile"
            />
          </div>

          {/* Pricing Section */}
          <div className="rounded-lg border bg-secondary/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Monthly Subscription</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-renews on the same day each month
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400">100</div>
                <div className="text-sm text-muted-foreground">coins/month</div>
              </div>
            </div>

            {/* Coin Balance */}
            <div className="flex items-center justify-between rounded bg-background/50 p-3">
              <span className="text-sm">Your Coins:</span>
              <span className={`font-bold ${hasEnoughCoins ? 'text-green-500' : 'text-red-500'}`}>
                {Math.floor(userCoins)} coins
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-red-500/50 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Insufficient Coins */}
          {!hasEnoughCoins && !vipStatus.vip_active && (
            <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                You need {VIP_COST - Math.floor(userCoins)} more coins to purchase VIP
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {vipStatus.vip_active ? (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Cancel VIP'}
            </Button>
          ) : (
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              onClick={handlePurchase}
              disabled={!hasEnoughCoins || isLoading}
            >
              {isLoading ? 'Processing...' : `Get VIP (${VIP_COST} coins)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="rounded-lg border bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
