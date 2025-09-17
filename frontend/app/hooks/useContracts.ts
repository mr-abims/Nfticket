'use client'

import { useWriteContract, useReadContract, useWatchContractEvent, useChainId, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { parseEther } from 'viem'
import { useEffect, useState } from 'react'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, areContractsConfigured, isOnCorrectNetwork } from '../contracts/config'
import { formatEther } from 'viem'

// Balance Hook
export const useGetUserBalance = (userAddress?: `0x${string}`) => {
  const chainId = useChainId()
  const { data: balance, isLoading, error, refetch } = useBalance({
    address: userAddress,
    query: {
      enabled: !!userAddress && isOnCorrectNetwork(chainId),
    },
  })

  return {
    balance: balance ? formatEther(balance.value) : '0',
    formatted: balance ? `${Number(formatEther(balance.value)).toFixed(4)} STT` : '0 STT',
    isLoading,
    error,
    refetch,
  }
}

// Event Factory Hooks
export const useEventFactory = () => {
  const { writeContract, isPending: isCreating, error: createError, data: transactionHash } = useWriteContract()
  const chainId = useChainId()

  const createEvent = async (eventData: {
    eventName: string
    eventAcronym: string
    regStartTime: bigint
    regEndTime: bigint
    ticketFee: bigint
    maxTickets: bigint
    ticketURI: string
  }) => {
    if (!areContractsConfigured()) {
      throw new Error('Contracts not configured. Please set the contract address.')
    }

    if (!isOnCorrectNetwork(chainId)) {
      throw new Error('Please switch to Somnia Testnet to interact with contracts.')
    }

    return writeContract({
      address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
      abi: CONTRACT_ABIS.EVENT_FACTORY,
      functionName: 'createEvent',
      args: [
        eventData.eventName,
        eventData.eventAcronym,
        eventData.regStartTime,
        eventData.regEndTime,
        eventData.ticketFee,
        eventData.maxTickets,
        eventData.ticketURI,
      ],
    })
  }

  return {
    createEvent,
    isCreating,
    createError,
    transactionHash,
  }
}

export const useGetAllEvents = () => {
  const chainId = useChainId()
  const { data: events, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getAllEvents',
    query: {
      enabled: areContractsConfigured() && isOnCorrectNetwork(chainId),
    },
  })

  return {
    events: events as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  }
}

export const useGetLiveEvents = () => {
  const chainId = useChainId()
  const { data: events, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getLiveEvents',
    query: {
      enabled: areContractsConfigured() && isOnCorrectNetwork(chainId),
    },
  })

  return {
    events: events as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  }
}

export const useGetPastEvents = () => {
  const chainId = useChainId()
  const { data: events, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getPastEvents',
    query: {
      enabled: areContractsConfigured() && isOnCorrectNetwork(chainId),
    },
  })

  return {
    events: events as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  }
}

export const useGetUserCreatedEvents = (userAddress?: `0x${string}`) => {
  const chainId = useChainId()
  const { data: events, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getUserCreatedEvents',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: areContractsConfigured() && !!userAddress && isOnCorrectNetwork(chainId),
    },
  })

  return {
    events: events as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  }
}

// Hook to get event details from factory's EventCreated events
export const useGetEventCreatedLogs = (userAddress?: `0x${string}`) => {
  const chainId = useChainId()
  const [eventDetails, setEventDetails] = useState<Array<{
    eventContract: string;
    eventOwner: string;
    eventName: string;
    eventAcronym: string;
    regStartTime: number;
    regEndTime: number;
    ticketFee: number;
    maxTickets: number;
    blockNumber?: number;
  }>>([])
  
  // This would need to be implemented with event logs fetching
  // For now, return empty array but with proper structure
  useEffect(() => {
    if (userAddress && areContractsConfigured() && isOnCorrectNetwork(chainId)) {
      // TODO: Implement event log fetching
    }
  }, [userAddress, chainId])

  return {
    eventDetails,
    isLoading: false,
    error: null,
  }
}

// Global ticket tracking hooks
export const useGetUserAllTickets = (userAddress?: `0x${string}`) => {
  const chainId = useChainId()
  const { data: tickets, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getUserAllTickets',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: areContractsConfigured() && !!userAddress && isOnCorrectNetwork(chainId),
    },
  })

  return {
    tickets: tickets as Array<{
      eventContract: `0x${string}`;
      tokenId: bigint;
      purchaseTime: bigint;
      eventName: string;
    }> | undefined,
    isLoading,
    error,
    refetch,
  }
}

export const useGetUserTicketCount = (userAddress?: `0x${string}`) => {
  const chainId = useChainId()
  const { data: count, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getUserTicketCount',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: areContractsConfigured() && !!userAddress && isOnCorrectNetwork(chainId),
    },
  })

  return {
    count: count ? Number(count) : 0,
    isLoading,
    error,
    refetch,
  }
}

export const useGetTotalTicketsSold = () => {
  const chainId = useChainId()
  const { data: totalSold, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getTotalTicketsSold',
    query: {
      enabled: areContractsConfigured() && isOnCorrectNetwork(chainId),
    },
  })

  return {
    totalSold: totalSold ? Number(totalSold) : 0,
    isLoading,
    error,
    refetch,
  }
}

// New hook for calculating event revenue
export const useGetEventRevenue = (eventAddress?: `0x${string}`) => {
  const { eventInfo, isLoading, error, refetch: refetchEventInfo } = useGetEventInfo(eventAddress)
  
  const revenue = eventInfo ? 
    Number(eventInfo[6] * eventInfo[3]) / (10**18) : 0 // ticketsSold * ticketFee converted from wei
    
  return { 
    revenue,
    ticketsSold: eventInfo ? Number(eventInfo[6]) : 0,
    ticketFee: eventInfo ? Number(eventInfo[3]) / (10**18) : 0,
    isLoading,
    error,
    refetchEventInfo
  }
}

// Hook to get all events as contracts (for compatibility with existing code)
export const useGetAllEventsContracts = () => {
  const chainId = useChainId()
  const { data: events, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    functionName: 'getAllEventsContracts',
    query: {
      enabled: areContractsConfigured() && isOnCorrectNetwork(chainId),
    },
  })

  return {
    events: events as `0x${string}`[] | undefined,
    isLoading,
    error,
    refetch,
  }
}


// Enhanced event listeners with callbacks for dashboard updates
export const useWatchTicketPurchased = (onTicketPurchased?: (log: any) => void) => {
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    eventName: 'TicketPurchased',
    onLogs: (logs) => {
      if (onTicketPurchased) {
        logs.forEach(onTicketPurchased)
      }
    },
    enabled: areContractsConfigured(),
  })
}

// Watch for user-specific ticket purchases
export const useWatchUserTicketPurchases = (userAddress?: `0x${string}`, onUserTicketPurchased?: (log: any) => void) => {
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    eventName: 'TicketPurchased',
    args: userAddress ? { user: userAddress } : undefined,
    onLogs: (logs) => {
      if (onUserTicketPurchased) {
        logs.forEach(onUserTicketPurchased)
      }
    },
    enabled: areContractsConfigured() && !!userAddress,
  })
}

// Event Manager Hooks
export const useEventManager = (eventAddress?: `0x${string}`) => {
  const { writeContract, isPending: isRegistering, error: registerError, data: transactionHash } = useWriteContract()
  const chainId = useChainId()

  const registerForEvent = async (ticketFee: string) => {
    if (!eventAddress) {
      throw new Error('Event address not provided')
    }

    if (!isOnCorrectNetwork(chainId)) {
      throw new Error('Please switch to Somnia Testnet to interact with contracts.')
    }

    return writeContract({
      address: eventAddress,
      abi: CONTRACT_ABIS.EVENT_MANAGER,
      functionName: 'registerForEvent',
      value: parseEther(ticketFee),
    })
  }

  const transferTicket = async (to: `0x${string}`, tokenId: bigint) => {
    if (!eventAddress) {
      throw new Error('Event address not provided')
    }

    if (!isOnCorrectNetwork(chainId)) {
      throw new Error('Please switch to Somnia Testnet to interact with contracts.')
    }

    return writeContract({
      address: eventAddress,
      abi: CONTRACT_ABIS.EVENT_MANAGER,
      functionName: 'transferTicket',
      args: [to, tokenId],
    })
  }

  return {
    registerForEvent,
    transferTicket,
    isRegistering,
    registerError,
    transactionHash,
  }
}

export const useGetEventInfo = (eventAddress?: `0x${string}`) => {
  const chainId = useChainId()
  const { data: eventInfo, isLoading, error, refetch } = useReadContract({
    address: eventAddress,
    abi: CONTRACT_ABIS.EVENT_MANAGER,
    functionName: 'getEventInfo',
    query: {
      enabled: !!eventAddress && areContractsConfigured() && isOnCorrectNetwork(chainId),
    },
  })


  return {
    eventInfo: eventInfo as [string, bigint, bigint, bigint, boolean, bigint, bigint, string, boolean] | undefined,
    isLoading,
    error,
    refetch,
  }
}

export const useGetUserTickets = (eventAddress?: `0x${string}`, userAddress?: `0x${string}`) => {
  const { data: tickets, isLoading, error, refetch } = useReadContract({
    address: eventAddress,
    abi: CONTRACT_ABIS.EVENT_MANAGER,
    functionName: 'getUserTickets',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!eventAddress && !!userAddress,
    },
  })

  return {
    tickets: tickets as bigint[] | undefined,
    isLoading,
    error,
    refetch,
  }
}

// Event listeners
export const useWatchEventCreated = (onEventCreated?: (log: any) => void) => {
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.EVENT_FACTORY as `0x${string}`,
    abi: CONTRACT_ABIS.EVENT_FACTORY,
    eventName: 'EventCreated',
    onLogs: (logs) => {
      if (onEventCreated) {
        logs.forEach(onEventCreated)
      }
    },
    enabled: areContractsConfigured(),
  })
}

export const useWatchUserRegistered = (eventAddress?: `0x${string}`, onUserRegistered?: (log: any) => void) => {
  useWatchContractEvent({
    address: eventAddress,
    abi: CONTRACT_ABIS.EVENT_MANAGER,
    eventName: 'UserRegistered',
    onLogs: (logs) => {
      if (onUserRegistered) {
        logs.forEach(onUserRegistered)
      }
    },
    enabled: !!eventAddress,
  })
}
