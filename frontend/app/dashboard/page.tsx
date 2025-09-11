'use client'

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { formatDate, shortenAddress } from "../lib/utils"

// Mock data - in a real app, this would come from the blockchain/API
const mockUserData = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  balance: "2.5",
  eventsCreated: 3,
  ticketsOwned: 8,
  totalSpent: "1.25"
}

const mockCreatedEvents = [
  {
    id: "1",
    title: "Web3 Developer Conference 2024",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
    date: "2024-03-15T10:00:00Z",
    location: "San Francisco, CA",
    ticketsSold: 158,
    totalTickets: 500,
    revenue: "15.8",
    status: "active"
  },
  {
    id: "2",
    title: "NFT Art Workshop",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    date: "2024-04-10T14:00:00Z",
    location: "Los Angeles, CA",
    ticketsSold: 45,
    totalTickets: 50,
    revenue: "2.25",
    status: "active"
  },
  {
    id: "3",
    title: "Crypto Meetup NYC",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop",
    date: "2024-02-20T19:00:00Z",
    location: "New York, NY",
    ticketsSold: 30,
    totalTickets: 30,
    revenue: "0.6",
    status: "completed"
  }
]

const mockOwnedTickets = [
  {
    id: "t1",
    eventId: "e1",
    eventTitle: "Blockchain Music Festival",
    eventImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
    eventDate: "2024-04-20T18:00:00Z",
    eventLocation: "Austin, TX",
    tokenId: 1234,
    purchasePrice: "0.25",
    purchaseDate: "2024-02-01T10:00:00Z",
    isUsed: false
  },
  {
    id: "t2",
    eventId: "e2",
    eventTitle: "DeFi Workshop Series",
    eventImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=200&fit=crop",
    eventDate: "2024-03-25T14:00:00Z",
    eventLocation: "New York, NY",
    tokenId: 5678,
    purchasePrice: "0.05",
    purchaseDate: "2024-02-15T09:00:00Z",
    isUsed: false
  },
  {
    id: "t3",
    eventId: "e3",
    eventTitle: "Past Conference 2024",
    eventImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
    eventDate: "2024-01-15T10:00:00Z",
    eventLocation: "San Francisco, CA",
    tokenId: 9012,
    purchasePrice: "0.15",
    purchaseDate: "2024-01-01T12:00:00Z",
    isUsed: true
  }
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'tickets'>('overview')

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="bg-primary-gradient rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
              <p className="text-white/90 mb-4">
                Address: {shortenAddress(mockUserData.address)}
              </p>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-white/90 text-sm">Balance</p>
                  <p className="text-2xl font-bold">{mockUserData.balance} STT</p>
                </div>
                <div>
                  <p className="text-white/90 text-sm">Events Created</p>
                  <p className="text-2xl font-bold">{mockUserData.eventsCreated}</p>
                </div>
                <div>
                  <p className="text-white/90 text-sm">Tickets Owned</p>
                  <p className="text-2xl font-bold">{mockUserData.ticketsOwned}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                href="/create-event"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Event
              </Link>
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
                          {mockCreatedEvents.reduce((sum, event) => sum + parseFloat(event.revenue), 0).toFixed(2)} STT
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
                          {mockCreatedEvents.reduce((sum, event) => sum + event.ticketsSold, 0)}
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
                          {mockCreatedEvents.filter(event => event.status === 'active').length}
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
                        <p className="text-sm text-slate-600 dark:text-slate-400">Upcoming Events</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {mockOwnedTickets.filter(ticket => new Date(ticket.eventDate) > new Date() && !ticket.isUsed).length}
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-white font-medium">Ticket sold for Web3 Developer Conference</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">2 hours ago • +0.1 STT</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-10 h-10 bg-black/10 dark:bg-black/30 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-white font-medium">Purchased ticket for Blockchain Music Festival</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">1 day ago • -0.25 STT</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-white font-medium">Created new event: NFT Art Workshop</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">3 days ago</p>
                      </div>
                    </div>
                  </div>
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
                  {mockCreatedEvents.map((event) => (
                    <div key={event.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                      <div className="flex space-x-4">
                        <Image
                          src={event.imageUrl}
                          alt={event.title}
                          width={100}
                          height={80}
                          className="w-20 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{event.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {formatDate(event.date)} • {event.location}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                            <Link
                              href={`/events/${event.id}`}
                              className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Sold</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {event.ticketsSold}/{event.totalTickets}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{event.revenue} STT</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Rate</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {Math.round((event.ticketsSold / event.totalTickets) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Tickets</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockOwnedTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                      <div className="flex space-x-4">
                        <Image
                          src={ticket.eventImage}
                          alt={ticket.eventTitle}
                          width={100}
                          height={80}
                          className="w-20 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{ticket.eventTitle}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {formatDate(ticket.eventDate)} • {ticket.eventLocation}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ticket.isUsed 
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                : new Date(ticket.eventDate) > new Date()
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {ticket.isUsed ? 'Used' : new Date(ticket.eventDate) > new Date() ? 'Valid' : 'Expired'}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              Token #{ticket.tokenId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Purchase Price</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{ticket.purchasePrice} STT</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Purchased</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(ticket.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!ticket.isUsed && new Date(ticket.eventDate) > new Date() && (
                        <button className="w-full mt-4 px-4 py-2 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium">
                          Show QR Code
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
