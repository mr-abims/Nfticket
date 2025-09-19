'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import Image from "next/image"
import Link from "next/link"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { ErrorBoundary, LoadingSpinner, ErrorMessage } from "../../components/ErrorBoundary"
import { formatDate, shortenAddress } from "../../lib/utils"
import { useGetEventInfo, useEventManager, useGetUserTickets } from "../../hooks/useContracts"
import { Event } from "../../types/event"

// Fallback data for demo/invalid addresses
const fallbackEvent = {
  id: "demo",
  title: "Demo Event",
  description: "This is a demonstration event. Connect to Somnia Testnet and use a valid event contract address to see real event data.",
  imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
  date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  location: "Demo Location",
  category: "other" as const,
  ticketPrice: 0.01,
  totalTickets: 100,
  availableTickets: 100,
  organizer: "0x0000000000000000000000000000000000000000",
  contractAddress: "0x0000000000000000000000000000000000000000",
  isActive: true,
  createdAt: new Date().toISOString(),
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  
  const ticketQuantity = 1 // Fixed to 1 ticket per user
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [eventData, setEventData] = useState<Event | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseTransactionHash, setPurchaseTransactionHash] = useState<`0x${string}` | undefined>(undefined)
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false)

  // Get event address from URL params
  const eventAddress = params?.id as `0x${string}` | undefined
  const isValidAddress = eventAddress && eventAddress.startsWith('0x') && eventAddress.length === 42

  // Blockchain data hooks
  const { eventInfo, isLoading: isLoadingEvent, error: eventError } = useGetEventInfo(
    isValidAddress ? eventAddress : undefined
  )
  const { registerForEvent, isRegistering, registerError, transactionHash: registerTransactionHash } = useEventManager(
    isValidAddress ? eventAddress : undefined
  )
  const { tickets: userTickets, refetch: refetchTickets } = useGetUserTickets(
    isValidAddress ? eventAddress : undefined,
    address
  )

  // Wait for purchase transaction confirmation
  const { data: purchaseReceipt, isLoading: isWaitingForReceipt, isSuccess: isPurchaseConfirmed } = useWaitForTransactionReceipt({
    hash: purchaseTransactionHash,
  })

  // Transform blockchain data to Event format
  useEffect(() => {
    const fetchEventMetadata = async () => {
      if (eventInfo && eventAddress) {
        const [
          eventName,
          regStartTime,
          regEndTime,
          ticketFee,
          ticketFeeRequired,
          maxTickets,
          ticketsSold,
          ticketURI,
          eventEnded
        ] = eventInfo

        console.log('Fetching event metadata from IPFS:', ticketURI)

        // Create base event object with blockchain data
        let event: Event = {
          id: eventAddress,
          title: eventName,
          description: "Loading event description...",
          imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop", // Fallback
          date: new Date(Number(regEndTime) * 1000).toISOString(),
          location: "Loading location...",
          category: "other" as const,
          ticketPrice: Number(ticketFee) / 1e18, // Convert from wei to STT
          totalTickets: Number(maxTickets),
          availableTickets: Number(maxTickets) - Number(ticketsSold),
          organizer: "Loading organizer...",
          contractAddress: eventAddress,
          isActive: !eventEnded && Date.now() < Number(regEndTime) * 1000,
          createdAt: new Date(Number(regStartTime) * 1000).toISOString(),
        }

        // Try to fetch metadata from IPFS
        if (ticketURI && ticketURI.startsWith('https://')) {
          try {
            console.log('Fetching metadata from:', ticketURI)
            const response = await fetch(ticketURI)
            const metadata = await response.json()
            
            console.log('Retrieved metadata:', metadata)

            // Extract event details from metadata attributes
            const attributes = metadata.attributes || []
            const getAttributeValue = (traitType: string) => {
              const attr = attributes.find((a: any) => a.trait_type === traitType)
              return attr ? attr.value : null
            }

            // Update event with real metadata
            event = {
              ...event,
              title: getAttributeValue('Event') || eventName,
              description: metadata.description || "No description available",
              imageUrl: metadata.image || event.imageUrl,
              location: getAttributeValue('Location') || "Location TBD",
              category: (getAttributeValue('Category') as any) || "other",
              // Date comes from attribute or blockchain data
              date: getAttributeValue('Date') || event.date,
            }

            console.log('Final event data with metadata:', event)
          } catch (error) {
            console.error('Error fetching metadata from IPFS:', error)
            // Keep the base event data if metadata fetch fails
          }
        }

        setEventData(event)
      } else if (!isValidAddress) {
        // Use fallback data for invalid addresses or demo
        setEventData({
          ...fallbackEvent,
          id: params?.id as string || "demo"
        })
      }
    }

    fetchEventMetadata()
  }, [eventInfo, eventAddress, isValidAddress, params?.id])

  // Handle purchase transaction confirmation
  useEffect(() => {
    if (isPurchaseConfirmed && purchaseReceipt) {
      console.log('Purchase transaction confirmed!', purchaseReceipt)
      
      // Refresh user tickets and event info
      refetchTickets()
      
      // Reset states
      setIsWaitingForConfirmation(false)
      setPurchaseTransactionHash(undefined)
      setShowPurchaseModal(false)
      
      // Redirect to dashboard with success message
      router.push('/dashboard?success=Ticket purchased successfully!')
    }
  }, [isPurchaseConfirmed, purchaseReceipt, refetchTickets, router])

  // Watch for transaction hash from the register hook
  useEffect(() => {
    if (registerTransactionHash && !purchaseTransactionHash && isWaitingForConfirmation) {
      console.log('Transaction hash received from wagmi:', registerTransactionHash)
      setPurchaseTransactionHash(registerTransactionHash)
    }
  }, [registerTransactionHash, purchaseTransactionHash, isWaitingForConfirmation])

  const displayEvent = eventData || fallbackEvent
  const availabilityPercentage = (displayEvent.availableTickets / displayEvent.totalTickets) * 100

  const handlePurchase = () => {
    if (!isConnected) {
      setPurchaseError('Please connect your wallet to purchase tickets')
      return
    }
    
    if (!isValidAddress || !eventAddress) {
      setPurchaseError('Invalid event address. Please use a valid event contract address.')
      return
    }

    if (userTickets && userTickets.length > 0) {
      setPurchaseError('You already own a ticket for this event')
      return
    }
    
    setShowPurchaseModal(true)
  }

  const confirmPurchase = async () => {
    console.log('confirmPurchase called with:', {
      isValidAddress,
      isConnected,
      eventAddress,
      ticketPrice: displayEvent.ticketPrice,
      isWaitingForConfirmation,
      isRegistering
    })

    if (!isValidAddress || !isConnected || !eventAddress) {
      setPurchaseError('Invalid event address or wallet not connected')
      return
    }

    // Prevent double-clicking
    if (isWaitingForConfirmation || isRegistering) {
      console.log('Purchase already in progress, ignoring duplicate request')
      return
    }

    try {
      setPurchaseError(null)
      setIsWaitingForConfirmation(true)
      
      console.log('Calling registerForEvent with:', {
        eventAddress,
        ticketPrice: displayEvent.ticketPrice.toString(),
        priceInWei: displayEvent.ticketPrice * 1e18
      })
      
      // Register for the event (purchase ticket)
      await registerForEvent(displayEvent.ticketPrice.toString())
      
      // The transaction hash will be set via the useEffect watching registerTransactionHash
      console.log('Transaction submitted, waiting for hash...')
      
    } catch (error) {
      console.error('Purchase failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed. Please try again.'
      setPurchaseError(errorMessage)
      setIsWaitingForConfirmation(false)
    }
  }

  if (isLoadingEvent) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen" style={{ backgroundColor: '#010612' }}>
          <Header />
          <LoadingSpinner message="Loading event details..." />
          <Footer />
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ backgroundColor: '#010612' }}>
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Display */}
          {(eventError || purchaseError || registerError) && (
            <div className="mb-8">
              <ErrorMessage 
                error={eventError || new Error(purchaseError || (registerError ? registerError.message : '') || 'Unknown error')} 
                onRetry={() => {
                  setPurchaseError(null)
                  window.location.reload()
                }}
              />
            </div>
          )}

          {/* Data Source Indicator */}
          {!isValidAddress && (
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Showing demo event. Use a valid contract address to see blockchain events.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Tickets Display */}
          {userTickets && userTickets.length > 0 && (
            <div className="mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You own {userTickets.length} ticket{userTickets.length > 1 ? 's' : ''} for this event!
                  </p>
                </div>
              </div>
            </div>
          )}
        {/* Back button */}
        <Link
          href="/events"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={displayEvent.imageUrl}
                alt={displayEvent.title}
                width={800}
                height={500}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                onError={(e) => {
                  console.log('Image failed to load, using fallback:', displayEvent.imageUrl)
                  e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop"
                }}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-black/10 text-black dark:bg-black/30 dark:text-white rounded-full text-sm font-medium">
                  {displayEvent.category.charAt(0).toUpperCase() + displayEvent.category.slice(1)}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-0">
                  {displayEvent.title}
                </h1>
                {(() => {
                  const now = new Date()
                  const eventDate = new Date(displayEvent.date)
                  const isUpcoming = eventDate > now
                  const isLive = displayEvent.isActive && !isUpcoming
                  const isPast = !displayEvent.isActive || eventDate < now

                  let statusInfo
                  if (isLive) {
                    statusInfo = {
                      status: "Live Now",
                      color: "bg-green-500 text-white",
                      icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )
                    }
                  } else if (isPast) {
                    statusInfo = {
                      status: "Event Ended",
                      color: "bg-slate-500 text-white",
                      icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )
                    }
                  } else {
                    statusInfo = {
                      status: "Upcoming",
                      color: "bg-blue-500 text-white",
                      icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )
                    }
                  }

                  return (
                    <div className={`${statusInfo.color} px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2`}>
                      {statusInfo.icon}
                      <span>{statusInfo.status}</span>
                    </div>
                  )
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Event: {formatDate(displayEvent.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{displayEvent.location}</span>
                </div>

                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="font-medium">Event Organizer</p>
                    <p className="text-sm">{shortenAddress(displayEvent.organizer)}</p>
                  </div>
                </div>

                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <div>
                    <p className="font-medium">{displayEvent.availableTickets} / {displayEvent.totalTickets} available</p>
                    <p className="text-sm">{displayEvent.ticketPrice} STT per ticket</p>
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">About This Event</h3>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {displayEvent.description}
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {displayEvent.ticketPrice} STT
                </div>
                <p className="text-slate-600 dark:text-slate-300">per ticket</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Availability</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {displayEvent.availableTickets} / {displayEvent.totalTickets}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      availabilityPercentage > 50
                        ? "bg-green-500"
                        : availabilityPercentage > 20
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${availabilityPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* User already owns ticket check */}
              {userTickets && userTickets.length > 0 ? (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">You already own a ticket!</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Only one ticket per person is allowed.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Ticket Limit:</span>
                    <span className="font-medium text-slate-900 dark:text-white">1 per person</span>
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Price (1 ticket)</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {displayEvent.ticketPrice} STT
                  </span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={displayEvent.availableTickets === 0 || isRegistering || isWaitingForConfirmation || (userTickets && userTickets.length > 0)}
                className="w-full bg-primary-gradient text-white py-4 rounded-xl bg-primary-gradient-hover transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              >
                {(isRegistering || isWaitingForConfirmation) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isWaitingForConfirmation ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (userTickets && userTickets.length > 0) ? "Already Purchased" 
                  : displayEvent.availableTickets === 0 ? "Sold Out" 
                  : "Purchase Ticket"}
              </button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                Secure payment via smart contract
              </p>
            </div>

            {/* Contract Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Contract Information</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Contract Address:</span>
                  <p className="font-mono text-slate-900 dark:text-white break-all">
                    {shortenAddress(displayEvent.contractAddress)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Network:</span>
                  <p className="text-slate-900 dark:text-white">Somnia Network</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Token Standard:</span>
                  <p className="text-slate-900 dark:text-white">ERC-721</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Confirm Purchase
            </h3>
            
            {/* Error Display in Modal */}
            {purchaseError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{purchaseError}</p>
              </div>
            )}

            {/* Transaction Status Display */}
            {purchaseTransactionHash && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center">
                  {isWaitingForReceipt ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {isWaitingForReceipt ? 'Waiting for blockchain confirmation...' : 'Transaction confirmed!'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                      {purchaseTransactionHash.slice(0, 10)}...{purchaseTransactionHash.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Event:</span>
                <span className="font-medium text-slate-900 dark:text-white">{displayEvent.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Ticket Price:</span>
                <span className="font-medium text-slate-900 dark:text-white">{displayEvent.ticketPrice} STT</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Total (1 ticket):</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{displayEvent.ticketPrice} STT</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                disabled={isRegistering || isWaitingForConfirmation}
                className="flex-1 px-4 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {(isRegistering || isWaitingForConfirmation) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isWaitingForConfirmation ? 'Confirming...' : 'Processing...'}
                  </>
                ) : (
                  'Confirm Purchase'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

        <Footer />
      </div>
    </ErrorBoundary>
  )
}
