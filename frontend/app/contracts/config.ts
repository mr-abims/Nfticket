import EventFactoryABI from './abis/EventFactory.json'
import EventManagerABI from './abis/EventManager.json'

// Contract addresses and their networks
export const CONTRACT_ADDRESSES = {
  EVENT_FACTORY: '0xaCe0A97228BBCD36945b8A29196eca4AFe31e9A0', // Deployed on Somnia Testnet
} as const

export const CONTRACT_NETWORK = {
  chainId: 50312, 
  name: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
    public: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Testnet Explorer', url: 'https://somnia-testnet.socialscan.io' },
  },
} as const

// Contract ABIs
export const CONTRACT_ABIS = {
  EVENT_FACTORY: EventFactoryABI,
  EVENT_MANAGER: EventManagerABI,
} as const

// Type definitions for better TypeScript support
export type ContractAddresses = typeof CONTRACT_ADDRESSES
export type ContractABIs = typeof CONTRACT_ABIS

// Helper function to validate contract addresses
export const isValidContractAddress = (address: string): boolean => {
  return address !== '0x0000000000000000000000000000000000000000' && 
         address.startsWith('0x') && 
         address.length === 42
}

// Check if contracts are properly configured
export const areContractsConfigured = (): boolean => {
  return isValidContractAddress(CONTRACT_ADDRESSES.EVENT_FACTORY)
}

// Get the current network configuration
export const getCurrentNetwork = () => CONTRACT_NETWORK

// Check if user is on the correct network
export const isOnCorrectNetwork = (userChainId: number | undefined): boolean => {
  return userChainId === CONTRACT_NETWORK.chainId
}
