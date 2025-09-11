import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import { http } from 'viem';

// Define Somnia chain configuration
const somnia = {
  id: 50312,
  name: 'Somnia',
  network: 'somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia',
    symbol: 'STT',
  },
  rpcUrls: {
    public: { http: ['https://dream-rpc.somnia.network/'] },
    default: { http: ['https://dream-rpc.somnia.network/'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network/' },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Ticketify',
  projectId: process.env.PROJECT_ID || 'default-project-id',
  chains: [mainnet, sepolia, somnia],
  ssr: true,
});