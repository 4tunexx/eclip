'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ClientContextType {
  isClientConnected: boolean;
  setClientConnected: (status: boolean) => void;
  isClientOpen: boolean;
  setClientOpen: (status: boolean) => void;
  clientVersion: string;
}

const ClientContext = createContext<ClientContextType>({
  isClientConnected: false,
  setClientConnected: () => {},
  isClientOpen: false,
  setClientOpen: () => {},
  clientVersion: 'v2.4.1'
});

export const useClient = () => useContext(ClientContext);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClientConnected, setClientConnected] = useState(false);
  const [isClientOpen, setClientOpen] = useState(false);

  // Persist client connection state
  useEffect(() => {
    const saved = localStorage.getItem('eclip-ac-connected');
    if (saved === 'true') {
      setClientConnected(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eclip-ac-connected', isClientConnected.toString());
  }, [isClientConnected]);

  return (
    <ClientContext.Provider value={{
      isClientConnected,
      setClientConnected,
      isClientOpen,
      setClientOpen,
      clientVersion: 'v2.4.1'
    }}>
      {children}
    </ClientContext.Provider>
  );
};
