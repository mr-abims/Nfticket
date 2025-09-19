'use client'

import { useState, useEffect, Suspense } from "react"
import { useAccount, useChainId } from "wagmi"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { ErrorBoundary, LoadingSpinner, ErrorMessage } from "../components/ErrorBoundary"
import { TicketTransferModal } from "../components/TicketTransferModal"
import { formatDate, shortenAddress } from "../lib/utils"
import { useGetUserCreatedEvents, useGetAllEvents, useGetUserAllTickets, useGetUserTicketCount, useGetTotalTicketsSold, useWatchEventCreated, useWatchTicketPurchased, useWatchUserTicketPurchases, useGetEventRevenue, useGetUserBalance } from "../hooks/useContracts"
import { readContract } from 'viem/actions'
import { createPublicClient, http } from 'viem'
import { defineChain } from 'viem'

// Define Somnia Testnet chain
const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Test Token',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Somnia Testnet Explorer', url: 'https://shannon-explorer.somnia.network/' },
  },
})
import { areContractsConfigured, isOnCorrectNetwork, CONTRACT_NETWORK, CONTRACT_ABIS } from "../contracts/config"


// Activity feed types
interface Activity {
  id: string
  type: 'event_created' | 'ticket_purchased' | 'ticket_transferred'
  user: string
  eventName: string
  eventAddress?: string
  tokenId?: string
  timestamp: number
}

// Simplified component using factory data only
function EventStatusDisplay({ eventAddress, userAllTickets }: { eventAddress: string, userAllTickets?: Array<{eventContract: `0x${string}`; tokenId: bigint; purchaseTime: bigint; eventName: string;}> }) {
  // Get tickets for this specific event from factory data
  const eventTickets = userAllTickets?.filter(ticket => 
    ticket.eventContract.toLowerCase() === eventAddress.toLowerCase()
  ) || []
  
  // Since we don't have individual contract data, show simplified status
  const getEventStatus = () => {
    // We can't determine exact status without individual contract calls
    // But we can show if the user has tickets for this event
    if (eventTickets.length > 0) {
      return { status: 'Owned', color: 'text-green-600 dark:text-green-400' }
    }
    return { status: 'Available', color: 'text-blue-600 dark:text-blue-400' }
  }
  
  const { status, color } = getEventStatus()
  
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
      <p className={`font-semibold ${color}`}>
        {status}
      </p>
      {eventTickets.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {eventTickets.length} ticket{eventTickets.length > 1 ? 's' : ''} owned
        </p>
      )}
    </div>
  )
}

// Enhanced revenue display using individual event contract data
function EventRevenueDisplay({ eventAddress, userAllTickets }: { eventAddress: string, userAllTickets?: Array<{eventContract: `0x${string}`; tokenId: bigint; purchaseTime: bigint; eventName: string;}> }) {
  // Get revenue data from individual event contract
  const { revenue, ticketsSold, isLoading } = useGetEventRevenue(eventAddress as `0x${string}`)
  
  // Get user's tickets for this event from factory data
  const eventTickets = userAllTickets?.filter(ticket => 
    ticket.eventContract.toLowerCase() === eventAddress.toLowerCase()
  ) || []
  
  if (isLoading) {
    return (
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
        <div className="flex items-center">
          <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-xs">Loading...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
      <p className="font-semibold text-slate-900 dark:text-white">
        {revenue.toFixed(3)} STT
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {ticketsSold} tickets sold
      </p>
      {eventTickets.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          You own {eventTickets.length}
        </p>
      )}
    </div>
  )
}

// Component to display total tickets sold across all user events
function UserEventTicketsSold({ userEvents }: { userEvents?: `0x${string}`[] }) {
  const [totalTicketsSold, setTotalTicketsSold] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const chainId = useChainId()

  useEffect(() => {
    if (!userEvents || userEvents.length === 0 || !areContractsConfigured() || !isOnCorrectNetwork(chainId)) {
      setTotalTicketsSold(0)
      return
    }

    setIsLoading(true)

    const calculateTotalSold = async () => {
      try {
        // Create a public client for reading contract data
        const publicClient = createPublicClient({
          chain: somniaTestnet,
          transport: http()
        })

        // Fetch tickets sold for each user event
        const promises = userEvents.map(async (eventAddress) => {
          try {
            const eventInfo = await readContract(publicClient, {
              address: eventAddress,
              abi: CONTRACT_ABIS.EVENT_MANAGER,
              functionName: 'getEventInfo',
            }) as [string, bigint, bigint, bigint, boolean, bigint, bigint, string, boolean]
            
            // ticketsSold is at index 6 in the returned tuple
            return eventInfo ? Number(eventInfo[6]) : 0
          } catch (error) {
            console.error(`Error fetching tickets sold for event ${eventAddress}:`, error)
            return 0
          }
        })

        const results = await Promise.all(promises)
        const total = results.reduce((sum, count) => sum + count, 0)
        
        setTotalTicketsSold(total)
      } catch (error) {
        console.error('Error calculating total tickets sold:', error)
        setTotalTicketsSold(0)
      } finally {
        setIsLoading(false)
      }
    }

    calculateTotalSold()
  }, [userEvents, chainId])

  if (isLoading) {
    return (
      <span className="flex items-center">
        <svg className="animate-spin h-5 w-5 mr-1" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        ...
      </span>
    )
  }

  return <span>{totalTicketsSold}</span>
}

// Component to display total revenue across all user events using individual event data
function TotalRevenueDisplay({ userEvents }: { userEvents?: `0x${string}`[] }) {
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (!userEvents || userEvents.length === 0) {
      setTotalRevenue(0)
      return
    }

    setIsCalculating(true)

    // For now, we'll show 0 since we can't easily calculate revenue without individual contract calls
    // In a production app, you might want to add a factory function that returns total revenue per user
    // or cache this data off-chain
    setTotalRevenue(0)
    setIsCalculating(false)
  }, [userEvents])

  if (isCalculating) {
    return (
      <span className="flex items-center">
        <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        ...
      </span>
    )
  }

  return <span>{totalRevenue.toFixed(2)} STT</span>
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function DashboardContent() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'tickets'>('overview')
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  // Get user's created events from blockchain
  const { events: userCreatedEvents, isLoading: isLoadingEvents, error: eventsError, refetch: refetchUserEvents } = useGetUserCreatedEvents(
    address
  )

  // Get user's tickets using new global tracking
  const { tickets: userAllTickets, isLoading: isLoadingTickets, refetch: refetchTickets } = useGetUserAllTickets(address)
  const { count: userTicketCount, refetch: refetchTicketCount } = useGetUserTicketCount(address)
  const { totalSold: globalTicketsSold, refetch: refetchGlobalTickets } = useGetTotalTicketsSold()
  
  // Get user's STT balance
  const { balance: userBalance, formatted: balanceFormatted, isLoading: isLoadingBalance, refetch: refetchBalance } = useGetUserBalance(address)
  
  // Track loading states for better UX
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Determine if we should use blockchain data
  const useBlockchainData = areContractsConfigured() && isConnected && isOnCorrectNetwork(chainId)

  // Check for success message from URL params
  useEffect(() => {
    const success = searchParams?.get('success')
    if (success) {
      setSuccessMessage(success)
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])



  // Refresh tickets when user returns from successful purchase
  useEffect(() => {
    if (successMessage && successMessage.includes('purchased')) {
      setIsRefreshing(true)
      Promise.all([
        refetchTickets(),
        refetchTicketCount()
      ]).finally(() => setIsRefreshing(false))
    }
  }, [successMessage, refetchTickets, refetchTicketCount])


  // Real-time event listeners for dashboard updates
  useWatchEventCreated((log) => {
    console.log('Event created detected:', log)
    const activity: Activity = {
      id: `event-${log.transactionHash}-${log.logIndex}`,
      type: 'event_created',
      user: log.args.eventOwner,
      eventName: log.args.eventName,
      eventAddress: log.args.eventContract,
      timestamp: Date.now()
    }
    setRecentActivity(prev => [activity, ...prev.slice(0, 9)]) // Keep last 10 activities
    setLastUpdateTime(new Date())
    
    // Refresh global data
    refetchGlobalTickets()
  })

  // Listen for global ticket purchases
  useWatchTicketPurchased((log) => {
    console.log('Ticket purchased detected:', log)
    const activity: Activity = {
      id: `ticket-${log.transactionHash}-${log.logIndex}`,
      type: 'ticket_purchased',
      user: log.args.user,
      eventName: log.args.eventName,
      eventAddress: log.args.eventContract,
      tokenId: log.args.tokenId?.toString(),
      timestamp: Date.now()
    }
    setRecentActivity(prev => [activity, ...prev.slice(0, 9)])
    setLastUpdateTime(new Date())
    
    // Refresh global ticket count
    refetchGlobalTickets()
  })

  // Listen for user-specific ticket purchases
  useWatchUserTicketPurchases(address, async (log) => {
    setIsRefreshing(true)
    
    try {
      // Refresh user-specific data
      await Promise.all([
        refetchTickets(),
        refetchTicketCount()
      ])
      setLastUpdateTime(new Date())
      
      // Show notification for user's own ticket purchases
      if (log.args.user?.toLowerCase() === address?.toLowerCase()) {
        setSuccessMessage('New ticket purchased successfully!')
      }
    } catch (error) {
      console.error('Error refreshing ticket data:', error)
    } finally {
      setIsRefreshing(false)
    }
  })

  const handleTransferTicket = (ticket: any) => {
    setSelectedTicket(ticket)
    setTransferModalOpen(true)
  }

  const handleTransferComplete = () => {
    setSuccessMessage('Ticket transferred successfully!')
    // Refresh data after transfer
    setIsRefreshing(true)
    Promise.all([
      refetchTickets(),
      refetchTicketCount()
    ]).finally(() => setIsRefreshing(false))
  }

  const handleManualRefresh = async () => {
    if (!useBlockchainData) return
    
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchUserEvents(),
        refetchTickets(),
        refetchTicketCount(),
        refetchGlobalTickets(),
        refetchBalance()
      ])
      setLastUpdateTime(new Date())
      setSuccessMessage('Data refreshed successfully!')
    } catch (error) {
      console.error('Error during manual refresh:', error)
      setSuccessMessage('Error refreshing data. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Periodic refresh for time-sensitive data (every 30 seconds)
  useEffect(() => {
    if (!useBlockchainData) return
    
    const interval = setInterval(async () => {
      setIsRefreshing(true)
      
      try {
        await Promise.all([
          refetchUserEvents(),
          refetchTickets(),
          refetchTicketCount(),
          refetchGlobalTickets(),
          refetchBalance()
        ])
        setLastUpdateTime(new Date())
      } catch (error) {
        console.error('Error during periodic refresh:', error)
      } finally {
        setIsRefreshing(false)
      }
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [useBlockchainData, refetchUserEvents, refetchTickets, refetchTicketCount, refetchGlobalTickets, refetchBalance])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'events', label: 'My Events', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'tickets', label: 'My Tickets', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    )}
  ]

  if (!isConnected) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#010612' }}>
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-purple-600/10 dark:from-black/20 dark:to-purple-400/10"></div>
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-r from-black/30 to-purple-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative">
            <Header />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8">
                <svg className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
                  Wallet Connection Required
                </h2>
                <p className="text-yellow-700 dark:text-yellow-300 mb-6">
                  Please connect your wallet to access your dashboard and manage your events and tickets.
                </p>
              </div>
            </div>
          </main>
          <Footer />
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#010612' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-purple-600/10 dark:from-black/20 dark:to-purple-400/10"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-r from-black/30 to-purple-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative">
          <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Success Message */}
          {successMessage && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Network Check */}
          {isConnected && !isOnCorrectNetwork(chainId) && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Wrong Network</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Please switch to {CONTRACT_NETWORK.name} (Chain ID: {CONTRACT_NETWORK.chainId}) to see live data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Source Indicator */}
          {!useBlockchainData ? (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {!isConnected ? 'Connect your wallet to see live data.' : 
                     !areContractsConfigured() ? 'Smart contracts not configured.' :
                     !isOnCorrectNetwork(chainId) ? 'Switch to the correct network to see live data.' :
                     'Showing demo data.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Live blockchain data - Real-time updates active
                    </p>
                    {isRefreshing && (
                      <div className="ml-2 flex items-center">
                        <svg className="animate-spin h-4 w-4 text-green-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span className="text-xs text-green-600 dark:text-green-400 ml-1">Updating...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Last updated: {lastUpdateTime.toLocaleTimeString()}
                    </p>
                    <button
                      onClick={handleManualRefresh}
                      disabled={isRefreshing}
                      className="flex items-center px-3 py-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {eventsError && (
            <div className="max-w-6xl mx-auto mb-6">
              <ErrorMessage error={eventsError} />
            </div>
          )}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your events and tickets
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                {/* Welcome Back Title */}
                <h2 className="text-4xl font-bold text-purple-200 mb-4">Welcome Back !</h2>
                
                {/* Wallet Address */}
                <p className="text-gray-300 text-sm mb-6">
                  Wallet Address: {shortenAddress(address || '0x...')}
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <p className="text-gray-300 text-sm">Balance</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-200">
                      {useBlockchainData ? (
                        isLoadingBalance ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Loading...
                          </span>
                        ) : (
                          `${Number(userBalance).toFixed(1)} STT`
                        )
                      ) : (
                        '-- STT'
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-300 text-sm">Event Created</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-200">
                      {useBlockchainData ? (userCreatedEvents?.length || 0) : '--'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <p className="text-gray-300 text-sm">Ticket Owned</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-200">
                      {useBlockchainData ? 
                        (isLoadingTickets ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Loading...
                          </span>
                        ) : (userTicketCount || 0)) : '--'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Create Event Button */}
              <div className="mt-6 md:mt-0 md:ml-8 flex justify-center md:justify-end">
                <Link
                  href="/create-event"
                  className="inline-flex items-center px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Create Event
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex space-x-8 px-8 py-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-black/10 dark:bg-black/30 text-black dark:text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {useBlockchainData ? <TotalRevenueDisplay userEvents={userCreatedEvents} /> : "--"}
                          </p>
                        </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Tickets Sold</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {useBlockchainData ? <UserEventTicketsSold userEvents={userCreatedEvents} /> : "--"}
                          </p>
                        </div>
                      <div className="w-12 h-12 bg-black/10 dark:bg-black/30 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Active Events</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {useBlockchainData ? (userCreatedEvents?.length || 0) : "--"}
                          </p>
                        </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Owned Tickets</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {useBlockchainData ? (
                              isLoadingTickets ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                  </svg>
                                  ...
                                </span>
                              ) : (userTicketCount || 0)
                            ) : "--"}
                          </p>
                        </div>
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    {useBlockchainData && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${recentActivity.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {recentActivity.length > 0 ? 'Live updates active' : 'Waiting for activity'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {useBlockchainData && recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {activity.type === 'event_created' ? (
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : activity.type === 'ticket_purchased' ? (
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {activity.type === 'event_created' && 'New event created'}
                              {activity.type === 'ticket_purchased' && 'Ticket purchased'}
                              {activity.type === 'ticket_transferred' && 'Ticket transferred'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {activity.eventName} • {shortenAddress(activity.user)}
                              {activity.tokenId && ` • Token #${activity.tokenId}`}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-slate-600 dark:text-slate-300 mb-2">
                        {useBlockchainData ? "No recent activity yet" : "Connect your wallet to see live activity"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {useBlockchainData 
                          ? "Activity will appear here as events are created and tickets are purchased on the blockchain" 
                          : "Recent blockchain activity will be displayed here once you connect your wallet"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Events</h3>
                  <Link
                    href="/create-event"
                    className="px-4 py-2 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium"
                  >
                    Create New Event
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {useBlockchainData && userCreatedEvents && userCreatedEvents.length > 0 ? (
                    // Real blockchain events
                    userCreatedEvents.map((eventAddress) => (
                      <div key={eventAddress} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                              Event Contract {eventAddress.slice(0, 8)}...
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                              Click to view full details and manage this event.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <EventStatusDisplay eventAddress={eventAddress} userAllTickets={userAllTickets} />
                              <EventRevenueDisplay eventAddress={eventAddress} userAllTickets={userAllTickets} />
                            </div>
                            <div className="mt-4 flex space-x-3">
                              <a
                                href={`/events/${eventAddress}`}
                                className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                View Details
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : useBlockchainData ? (
                    // Empty state for blockchain mode
                    <div className="col-span-full text-center py-12">
                      <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No events created yet</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Create your first event to get started with blockchain ticketing.
                      </p>
                      <Link
                        href="/create-event"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create First Event
                      </Link>
                    </div>
                  ) : (
                    // Empty state for non-blockchain mode
                    <div className="col-span-full text-center py-12">
                      <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Connect your wallet</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Connect your wallet and switch to the correct network to see your events.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Tickets</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {useBlockchainData ? (
                    isLoadingTickets ? (
                      // Loading state
                      <div className="col-span-full text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-300">Loading your tickets...</p>
                      </div>
                    ) : userAllTickets && userAllTickets.length > 0 ? (
                      // Show actual tickets from blockchain
                      userAllTickets.map((ticket, index) => (
                        <div key={`${ticket.eventContract}-${ticket.tokenId}`} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                          <div className="flex space-x-4">
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{ticket.eventName}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Token #{ticket.tokenId.toString()} • {ticket.eventContract.slice(0, 8)}...
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  Valid
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  Purchased {new Date(Number(ticket.purchaseTime) * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            <Link
                              href={`/events/${ticket.eventContract}`}
                              className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              View Event
                            </Link>
                            <button
                              onClick={() => handleTransferTicket({
                                id: `${ticket.eventContract}-${ticket.tokenId}`,
                                eventAddress: ticket.eventContract,
                                tokenId: Number(ticket.tokenId),
                                eventTitle: ticket.eventName
                              })}
                              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                              Transfer
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Empty state for blockchain mode
                      <div className="col-span-full text-center py-12">
                        <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tickets owned yet</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                          Purchase tickets to events to see them here.
                        </p>
                        <Link
                          href="/events"
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Browse Events
                        </Link>
                      </div>
                    )
                  ) : (
                    // Empty state for non-blockchain mode
                    <div className="col-span-full text-center py-12">
                      <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Connect your wallet</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Connect your wallet and switch to the correct network to see your tickets.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </main>

        {/* Transfer Modal */}
        <TicketTransferModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          ticket={selectedTicket}
          onTransferComplete={handleTransferComplete}
        />

        <Footer />
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Main component with Suspense wrapper
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300">Loading dashboard...</p>
      </div>
    </div>}>
      <DashboardContent />
    </Suspense>
  )
}
