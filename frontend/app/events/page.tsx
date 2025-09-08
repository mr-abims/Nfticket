'use client'

import { useState } from "react"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { EventCard } from "../components/EventCard"
import { EventFilters } from "../types/event"

// Mock data - in a real app, this would come from the blockchain/API
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
  }
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")

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

  // Filter and sort events
  const filteredEvents = mockEvents
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      return matchesSearch && matchesCategory
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
          <p className="text-slate-600 dark:text-slate-300">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">View:</span>
            <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
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

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
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
              No events found
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Try adjusting your search criteria or browse all events.
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
