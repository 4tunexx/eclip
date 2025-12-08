'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  X, 
  Download,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { handleClientLaunch, isWindows, downloadClient } from '@/lib/client-launcher';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';

interface ClientLauncherDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientLauncherDialog: React.FC<ClientLauncherDialogProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<'idle' | 'launching' | 'launched' | 'not-installed' | 'not-windows'>('idle');
  const { toast } = useToast();
  const { user } = useUser();

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchStatus('launching');

    try {
      // Get session token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('session='))
        ?.split('=')[1];

      const result = await handleClientLaunch({
        userId: user?.id,
        token: token,
        // matchId can be added later when launching from a specific match
      });

      switch (result) {
        case 'launched':
          setLaunchStatus('launched');
          toast({
            title: 'Client Launched',
            description: 'EclipAC client is now starting...',
          });
          setTimeout(() => {
            onClose();
            setLaunchStatus('idle');
          }, 2000);
          break;

        case 'download-started':
          setLaunchStatus('not-installed');
          toast({
            title: 'Client Not Found',
            description: 'Download started. Install and try again.',
            variant: 'default',
          });
          break;

        case 'not-windows':
          setLaunchStatus('not-windows');
          toast({
            title: 'Not Supported',
            description: 'Windows client is only available for Windows OS',
            variant: 'destructive',
          });
          break;
      }
    } catch (error) {
      console.error('Launch error:', error);
      toast({
        title: 'Launch Failed',
        description: 'Could not launch client. Try downloading and installing it.',
        variant: 'destructive',
      });
      setLaunchStatus('not-installed');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleDownloadClick = () => {
    downloadClient();
    toast({
      title: 'Download Started',
      description: 'EclipAC-Setup.exe is downloading...',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] animate-in zoom-in-95 duration-200">
        <div className="w-[500px] bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl ring-1 ring-white/10 overflow-hidden">
          
          {/* Header */}
          <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-white">Launch EclipAC Client</span>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Status Display */}
            {launchStatus === 'idle' && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Launch</h3>
                  <p className="text-sm text-zinc-400">
                    The EclipAC anti-cheat client protects your gaming experience
                  </p>
                </div>
              </div>
            )}

            {launchStatus === 'launching' && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Launching...</h3>
                  <p className="text-sm text-zinc-400">
                    Starting EclipAC client application
                  </p>
                </div>
              </div>
            )}

            {launchStatus === 'launched' && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Client Launched!</h3>
                  <p className="text-sm text-zinc-400">
                    Check your taskbar for the EclipAC window
                  </p>
                </div>
              </div>
            )}

            {launchStatus === 'not-installed' && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center border-2 border-yellow-500/30">
                  <Download className="w-10 h-10 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Client Not Installed</h3>
                  <p className="text-sm text-zinc-400">
                    Download and install the EclipAC client to continue
                  </p>
                </div>
              </div>
            )}

            {launchStatus === 'not-windows' && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Windows Only</h3>
                  <p className="text-sm text-zinc-400">
                    The EclipAC client is currently only available for Windows
                  </p>
                </div>
              </div>
            )}

            {/* Features List */}
            {(launchStatus === 'idle' || launchStatus === 'not-installed') && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-white font-medium">Real-time Protection</div>
                    <div className="text-zinc-400 text-xs">Monitors for cheats and exploits</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-white font-medium">Secure Gaming</div>
                    <div className="text-zinc-400 text-xs">Required for competitive play</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-white font-medium">Lightweight</div>
                    <div className="text-zinc-400 text-xs">Minimal performance impact</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {launchStatus === 'idle' && isWindows() && (
                <>
                  <Button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isLaunching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Launch Client
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-zinc-700"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {launchStatus === 'not-installed' && (
                <>
                  <Button
                    onClick={handleDownloadClick}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Client
                  </Button>
                  <Button
                    onClick={() => setLaunchStatus('idle')}
                    variant="outline"
                    className="border-zinc-700"
                  >
                    Try Again
                  </Button>
                </>
              )}

              {launchStatus === 'launched' && (
                <Button
                  onClick={onClose}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Close
                </Button>
              )}

              {launchStatus === 'not-windows' && (
                <Button
                  onClick={onClose}
                  className="w-full"
                  variant="outline"
                >
                  Close
                </Button>
              )}

              {!isWindows() && launchStatus === 'idle' && (
                <Button
                  onClick={onClose}
                  className="w-full"
                  variant="outline"
                >
                  Close
                </Button>
              )}
            </div>

            {/* Info Text */}
            <p className="text-xs text-zinc-500 text-center">
              By using EclipAC, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
