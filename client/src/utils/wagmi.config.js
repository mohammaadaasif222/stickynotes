import { QueryClient } from '@tanstack/react-query';
import { createConfig, http } from '@wagmi/core';
import { walletConnect } from '@wagmi/connectors';
import { mainnet, polygon, bsc, arbitrum } from 'wagmi/chains';

export const queryClient = new QueryClient();

export const config = createConfig({
  appName: 'Crypto Transaction App',
  connectors: [
    walletConnect({
      projectId: 'b00311bb20f1d71b977b474eac2b7dcd',
    }),
  ],
  chains: [mainnet, polygon, bsc, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
  },
});
