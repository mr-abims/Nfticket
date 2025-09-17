import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import { http } from 'viem';

// Define Somnia Testnet chain configuration
const somniaTestnet = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Test Token',
    symbol: 'STT',
  },
  rpcUrls: {
    public: { http: ['https://dream-rpc.somnia.network'] },
    default: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Testnet Explorer', url: 'https://somnia-testnet.socialscan.io' },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Ticketify',
  projectId: process.env.PROJECT_ID || 'default-project-id',
  chains: [mainnet, somniaTestnet],
  ssr: true,
});