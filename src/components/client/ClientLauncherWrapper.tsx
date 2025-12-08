'use client';

import { ClientLauncherDialog } from './ClientLauncherDialog';
import { useClient } from './ClientContext';

export function ClientLauncherWrapper() {
  const { isLauncherOpen, setLauncherOpen } = useClient();

  return (
    <ClientLauncherDialog
      isOpen={isLauncherOpen}
      onClose={() => setLauncherOpen(false)}
    />
  );
}
