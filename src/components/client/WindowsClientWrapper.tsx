'use client';

import { WindowsClient } from './WindowsClient';
import { useClient } from './ClientContext';

export function WindowsClientWrapper() {
  const { isClientOpen, setClientOpen, isClientConnected, setClientConnected } = useClient();

  return (
    <WindowsClient
      isOpen={isClientOpen}
      onClose={() => setClientOpen(false)}
      isConnected={isClientConnected}
      setConnected={setClientConnected}
    />
  );
}
