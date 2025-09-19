'use client'

import { useState, useEffect } from "react"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { EventCard } from "../components/EventCard"
import { ErrorBoundary, LoadingSpinner, ErrorMessage } from "../components/ErrorBoundary"
import { NetworkCheck } from "../components/NetworkCheck"
import { EventFilters, Event } from "../types/event"
import { useGetAllEvents, useGetEventInfo, useGetLiveEvents, useGetPastEvents } from "../hooks/useContracts"
import { areContractsConfigured } from "../contracts/config"

const mockEvents = [
  {
    id: "1",
    title: "Web3 Developer Conference 2024",
    description: "Join the biggest Web3 development conference of the year featuring industry leaders and cutting-edge technology.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    date: "2024-03-15T10:00:00Z",
    location: "San Francisco, CA",
    category: "conference" as const,
    ticketPrice: 0.1,
    totalTickets: 500,
    availableTickets: 342,
    organizer: "0x1234...5678",
    contractAddress: "0xabcd...ef12",
    isActive: true,
    createdAt: "2024-01-15T08:00:00Z"
  },
  {
    id: "2",
    title: "Blockchain Music Festival",
    description: "Experience the future of music with NFT artists and blockchain-powered performances.",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    date: "2024-04-20T18:00:00Z",
    location: "Austin, TX",
    category: "concert" as const,
    ticketPrice: 0.25,
    totalTickets: 1000,
    availableTickets: 823,
    organizer: "0x2345...6789",
    contractAddress: "0xbcde...f123",
    isActive: true,
    createdAt: "2024-01-20T10:00:00Z"
  },
  {
    id: "3",
    title: "DeFi Workshop Series",
    description: "Learn about decentralized finance protocols and yield farming strategies from experts.",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
    date: "2024-03-25T14:00:00Z",
    location: "New York, NY",
    category: "workshop" as const,
    ticketPrice: 0.05,
    totalTickets: 100,
    availableTickets: 67,
    organizer: "0x3456...789a",
    contractAddress: "0xcdef...1234",
    isActive: true,
    createdAt: "2024-01-25T12:00:00Z"
  },
  {
    id: "4",
    title: "NFT Art Exhibition",
    description: "Discover the latest in digital art and NFT collections from emerging and established artists.",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    date: "2024-05-10T12:00:00Z",
    location: "Los Angeles, CA",
    category: "exhibition" as const,
    ticketPrice: 0.08,
    totalTickets: 200,
    availableTickets: 156,
    organizer: "0x4567...89ab",
    contractAddress: "0xdef1...2345",
    isActive: true,
    createdAt: "2024-02-01T09:00:00Z"
  },
  {
    id: "5",
    title: "Crypto Sports Tournament",
    description: "Watch professional esports teams compete for cryptocurrency prizes in this groundbreaking tournament.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    date: "2024-06-05T16:00:00Z",
    location: "Las Vegas, NV",
    category: "sports" as const,
    ticketPrice: 0.15,
    totalTickets: 800,
    availableTickets: 623,
    organizer: "0x5678...9abc",
    contractAddress: "0xef12...3456",
    isActive: true,
    createdAt: "2024-02-10T11:00:00Z"
  },
  {
    id: "6",
    title: "Blockchain Meetup NYC",
    description: "Monthly meetup for blockchain enthusiasts, developers, and investors in New York City.",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
    date: "2024-03-30T19:00:00Z",
    location: "New York, NY",
    category: "meetup" as const,
    ticketPrice: 0.02,
    totalTickets: 50,
    availableTickets: 23,
    organizer: "0x6789...abcd",
    contractAddress: "0xf123...4567",
    isActive: true,
    createdAt: "2024-02-15T13:00:00Z"
  },
  {
    id: "7",
    title: "Crypto Trading Workshop",
    description: "Learn advanced trading strategies and risk management in cryptocurrency markets.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
    date: "2024-01-15T14:00:00Z",
    location: "London, UK",
    category: "workshop" as const,
    ticketPrice: 0.12,
    totalTickets: 80,
    availableTickets: 0,
    organizer: "0x789a...bcde",
    contractAddress: "0x1234...5678",
    isActive: false,
    createdAt: "2023-12-01T10:00:00Z"
  },
  {
    id: "8",
    title: "NFT Art Gallery Opening",
    description: "Exclusive opening of the world's first fully digital NFT art gallery.",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    date: "2024-02-20T18:00:00Z",
    location: "Paris, France",
    category: "exhibition" as const,
    ticketPrice: 0.08,
    totalTickets: 150,
    availableTickets: 0,
    organizer: "0x89ab...cdef",
    contractAddress: "0x2345...6789",
    isActive: false,
    createdAt: "2024-01-01T12:00:00Z"
  }
]

// Hook to fetch event data from a single event contract
const useEventData = (eventAddress: `0x${string}`) => {
  const { eventInfo, isLoading, error } = useGetEventInfo(eventAddress)

  const [eventData, setEventData] = useState<Event | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  useEffect(() => {
    const fetchEventMetadata = async () => {
      if (eventInfo && eventAddress) {
        setIsLoadingMetadata(true)
        
        try {
          // Transform blockchain data to Event format
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

          let metadata = null
          let imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
          let description = "Blockchain event - Click to view full details and purchase tickets."
          let location = "View Details"
          let category = "other" as const

          // Fetch metadata from IPFS if ticketURI exists
          if (ticketURI && ticketURI.startsWith('https://')) {
            try {
              console.log('Fetching metadata from:', ticketURI)
              const response = await fetch(ticketURI)
              if (response.ok) {
                metadata = await response.json()
                console.log('Fetched metadata:', metadata)
                
                // Extract data from metadata
                if (metadata.image) {
                  imageUrl = metadata.image
                }
                if (metadata.description) {
                  description = metadata.description
                }
                
                // Try to extract location and category from attributes
                if (metadata.attributes) {
                  const locationAttr = metadata.attributes.find((attr: any) => attr.trait_type === "Location")
                  const categoryAttr = metadata.attributes.find((attr: any) => attr.trait_type === "Category")
                  
                  if (locationAttr?.value) {
                    location = locationAttr.value
                  }
                  if (categoryAttr?.value) {
                    category = categoryAttr.value.toLowerCase()
                  }
                }
              }
            } catch (metadataError) {
              console.error('Error fetching metadata:', metadataError)
              // Continue with default values
            }
          }

          const event: Event = {
            id: eventAddress,
            title: eventName,
            description,
            imageUrl,
            date: new Date(Number(regEndTime) * 1000).toISOString(),
            location,
            category,
            ticketPrice: Number(ticketFee) / 1e18, // Convert from wei to STT
            totalTickets: Number(maxTickets),
            availableTickets: Number(maxTickets) - Number(ticketsSold),
            organizer: "0x...",
            contractAddress: eventAddress,
            isActive: !eventEnded && Date.now() < Number(regEndTime) * 1000,
            createdAt: new Date(Number(regStartTime) * 1000).toISOString(),
          }

          setEventData(event)
        } catch (error) {
          console.error('Error processing event data:', error)
        } finally {
          setIsLoadingMetadata(false)
        }
      }
    }

    fetchEventMetadata()
  }, [eventInfo, eventAddress])

  return { eventData, isLoading: isLoading || isLoadingMetadata, error }
}

// Component to render a single blockchain event with real data
const BlockchainEventCard = ({ eventAddress }: { eventAddress: `0x${string}` }) => {
  const { eventData, isLoading, error } = useEventData(eventAddress)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    )
  }

  if (error || !eventData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Error loading event
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {eventAddress.slice(0, 10)}...
          </p>
        </div>
      </div>
    )
  }

  return <EventCard event={eventData} />
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"all" | "live" | "past">("all")

  // Get events from the factory based on selected tab
  const { events: allEventAddresses, isLoading: isLoadingAll, error: allError, refetch: refetchAll } = useGetAllEvents()
  const { events: liveEventAddresses, isLoading: isLoadingLive, error: liveError, refetch: refetchLive } = useGetLiveEvents()
  const { events: pastEventAddresses, isLoading: isLoadingPast, error: pastError, refetch: refetchPast } = useGetPastEvents()

  // Determine which events to use based on active tab
  const getCurrentEvents = () => {
    switch (activeTab) {
      case "live":
        return { events: liveEventAddresses, isLoading: isLoadingLive, error: liveError, refetch: refetchLive }
      case "past":
        return { events: pastEventAddresses, isLoading: isLoadingPast, error: pastError, refetch: refetchPast }
      default:
        return { events: allEventAddresses, isLoading: isLoadingAll, error: allError, refetch: refetchAll }
    }
  }

  const { events: eventAddresses, isLoading: isLoadingAddresses, error: addressError, refetch } = getCurrentEvents()

  // Determine if we should use blockchain data or mock data
  const useBlockchainData = areContractsConfigured() && !addressError

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "conference", label: "Conferences" },
    { value: "concert", label: "Concerts" },
    { value: "workshop", label: "Workshops" },
    { value: "meetup", label: "Meetups" },
    { value: "sports", label: "Sports" },
    { value: "exhibition", label: "Exhibitions" },
    { value: "other", label: "Other" }
  ]

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "price", label: "Price" },
    { value: "popularity", label: "Popularity" },
    { value: "availability", label: "Availability" }
  ]

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "live", label: "Live Events" },
    { value: "past", label: "Past Events" },
    { value: "upcoming", label: "Upcoming" }
  ]

  // Helper function to determine event status for mock events
  const getEventStatus = (event: Event) => {
    const now = new Date()
    const eventDate = new Date(event.date)
    const isUpcoming = eventDate > now
    const isLive = event.isActive && !isUpcoming
    const isPast = !event.isActive || eventDate < now

    if (isLive) return "live"
    if (isPast) return "past"
    return "upcoming"
  }

  // For blockchain events, we can't filter/sort until data is loaded
  // For mock events, we can filter and sort normally
  const filteredEvents = useBlockchainData ? [] : mockEvents
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || getEventStatus(event) === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.ticketPrice - b.ticketPrice
        case "popularity":
          return (b.totalTickets - b.availableTickets) - (a.totalTickets - a.availableTickets)
        case "availability":
          return b.availableTickets - a.availableTickets
        default: // date
          return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
    })

  // Filter blockchain event addresses based on search (basic filtering by address)
  const filteredEventAddresses = useBlockchainData && eventAddresses ? 
    eventAddresses.filter(address => 
      searchQuery === "" || address.toLowerCase().includes(searchQuery.toLowerCase())
    ) : []

  const isLoading = isLoadingAddresses

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
          {/* Network Check */}
          <div className="max-w-6xl mx-auto mb-6">
            <NetworkCheck />
          </div>

          {/* Data Source Indicator */}
          {!useBlockchainData && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Showing demo data. Connect to Somnia Testnet to see live events.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {addressError && (
            <div className="max-w-6xl mx-auto mb-6">
              <ErrorMessage error={addressError} onRetry={refetch} />
            </div>
          )}
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Discover Events
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Find amazing blockchain-powered events happening around the world. 
            From conferences to concerts, your next experience awaits.
          </p>
        </div>

        {/* Event Status Tabs */}
        {useBlockchainData && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>All Events</span>
                    <span className="text-xs bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full">
                      {allEventAddresses?.length || 0}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("live")}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "live"
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    <span>Live Events</span>
                    <span className="text-xs bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full">
                      {liveEventAddresses?.length || 0}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "past"
                      ? "bg-slate-600 text-white shadow-lg"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Past Events</span>
                    <span className="text-xs bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full">
                      {pastEventAddresses?.length || 0}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <p className="text-slate-600 dark:text-slate-300">
              {useBlockchainData 
                ? `${filteredEventAddresses.length} event${filteredEventAddresses.length !== 1 ? 's' : ''} found`
                : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`
              }
            </p>
            {!useBlockchainData && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                  {mockEvents.filter(e => getEventStatus(e) === "live").length} Live
                </span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                  {mockEvents.filter(e => getEventStatus(e) === "upcoming").length} Upcoming
                </span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-full text-xs">
                  {mockEvents.filter(e => getEventStatus(e) === "past").length} Past
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">View:</span>
            <button className="p-2 rounded-lg bg-black/10 dark:bg-black/30 text-black dark:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

                {/* Loading State */}
                {isLoadingAddresses ? (
                  <LoadingSpinner message="Checking for events on blockchain..." />
                ) : useBlockchainData && filteredEventAddresses.length > 0 ? (
                  /* Blockchain Events Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEventAddresses.map((eventAddress) => (
                      <BlockchainEventCard key={eventAddress} eventAddress={eventAddress} />
                    ))}
                  </div>
                ) : !useBlockchainData && filteredEvents.length > 0 ? (
                  /* Mock Events Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.004-5.824-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {useBlockchainData ? "No events created yet" : "No events found"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {useBlockchainData 
                ? "Be the first to create an event on the blockchain!" 
                : "Try adjusting your search criteria or browse all events."
              }
            </p>
            {useBlockchainData ? (
              <a
                href="/create-event"
                className="inline-flex items-center px-6 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Event
              </a>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedStatus("all")
                }}
                className="px-6 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
        </main>

        <Footer />
        </div>
      </div>
    </ErrorBoundary>
  )
}
