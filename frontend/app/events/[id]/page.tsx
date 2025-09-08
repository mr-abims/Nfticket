'use client'

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"
import { formatDate, shortenAddress } from "../../lib/utils"

// Mock data - in a real app, this would come from the blockchain/API
const mockEvent = {
  id: "1",
  title: "Web3 Developer Conference 2024",
  description: "Join the biggest Web3 development conference of the year featuring industry leaders and cutting-edge technology. This comprehensive event will cover the latest developments in blockchain technology, decentralized applications, smart contracts, and the future of Web3.\n\nFeaturing keynote speakers from major blockchain companies, hands-on workshops, networking sessions, and exclusive product launches. Whether you're a seasoned developer or just starting your Web3 journey, this conference offers valuable insights and connections.",
  imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
  date: "2024-03-15T10:00:00Z",
  endDate: "2024-03-17T18:00:00Z",
  location: "Moscone Center, San Francisco, CA",
  category: "conference" as const,
  ticketPrice: 0.1,
  totalTickets: 500,
  availableTickets: 342,
  organizer: "0x1234567890abcdef1234567890abcdef12345678",
  organizerName: "Web3 Foundation",
  contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
  isActive: true,
  createdAt: "2024-01-15T08:00:00Z",
  agenda: [
    { time: "09:00", title: "Registration & Welcome Coffee" },
    { time: "10:00", title: "Opening Keynote: The Future of Web3" },
    { time: "11:00", title: "Panel: DeFi Innovations" },
    { time: "12:00", title: "Lunch Break" },
    { time: "13:00", title: "Workshop: Building dApps" },
    { time: "15:00", title: "NFT Marketplace Development" },
    { time: "16:00", title: "Networking Session" },
    { time: "17:00", title: "Closing Remarks" }
  ],
  speakers: [
    { name: "Vitalik Buterin", role: "Ethereum Founder", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { name: "Gavin Wood", role: "Polkadot Founder", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    { name: "Hayden Adams", role: "Uniswap Founder", image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face" }
  ]
}

export default function EventDetailPage() {
  const params = useParams()
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  const totalPrice = ticketQuantity * mockEvent.ticketPrice
  const availabilityPercentage = (mockEvent.availableTickets / mockEvent.totalTickets) * 100

  const handlePurchase = () => {
    setShowPurchaseModal(true)
  }

  const confirmPurchase = () => {
    // In a real app, this would interact with the smart contract
    alert(`Purchasing ${ticketQuantity} ticket(s) for ${totalPrice} ETH`)
    setShowPurchaseModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                src={mockEvent.imageUrl}
                alt={mockEvent.title}
                width={800}
                height={500}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                  {mockEvent.category.charAt(0).toUpperCase() + mockEvent.category.slice(1)}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                {mockEvent.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Start: {formatDate(mockEvent.date)}</p>
                    <p className="text-sm">End: {formatDate(mockEvent.endDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{mockEvent.location}</span>
                </div>

                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="font-medium">{mockEvent.organizerName}</p>
                    <p className="text-sm">{shortenAddress(mockEvent.organizer)}</p>
                  </div>
                </div>

                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <div>
                    <p className="font-medium">{mockEvent.availableTickets} / {mockEvent.totalTickets} available</p>
                    <p className="text-sm">{mockEvent.ticketPrice} ETH per ticket</p>
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">About This Event</h3>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {mockEvent.description}
                </div>
              </div>
            </div>

            {/* Speakers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Featured Speakers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {mockEvent.speakers.map((speaker, index) => (
                  <div key={index} className="text-center">
                    <Image
                      src={speaker.image}
                      alt={speaker.name}
                      width={100}
                      height={100}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h4 className="font-semibold text-slate-900 dark:text-white">{speaker.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{speaker.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Event Agenda</h3>
              <div className="space-y-4">
                {mockEvent.agenda.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-blue-600 dark:text-blue-400 font-mono text-sm font-medium min-w-[60px]">
                      {item.time}
                    </div>
                    <div className="text-slate-900 dark:text-white font-medium">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {mockEvent.ticketPrice} ETH
                </div>
                <p className="text-slate-600 dark:text-slate-300">per ticket</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Availability</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {mockEvent.availableTickets} / {mockEvent.totalTickets}
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quantity
                </label>
                <select
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {[...Array(Math.min(10, mockEvent.availableTickets))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} ticket{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Total</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {totalPrice.toFixed(4)} ETH
                  </span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={mockEvent.availableTickets === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {mockEvent.availableTickets === 0 ? "Sold Out" : "Purchase Tickets"}
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
                    {shortenAddress(mockEvent.contractAddress)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Network:</span>
                  <p className="text-slate-900 dark:text-white">Ethereum Mainnet</p>
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
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Event:</span>
                <span className="font-medium text-slate-900 dark:text-white">{mockEvent.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Quantity:</span>
                <span className="font-medium text-slate-900 dark:text-white">{ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Price per ticket:</span>
                <span className="font-medium text-slate-900 dark:text-white">{mockEvent.ticketPrice} ETH</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{totalPrice.toFixed(4)} ETH</span>
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
