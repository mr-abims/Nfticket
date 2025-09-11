import Link from "next/link"
import { EventCard } from "./EventCard"

// Mock data for preview
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
  }
]

export function EventsPreview() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Discover amazing events happening around the world. From conferences to concerts, 
            find your next unforgettable experience.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium"
          >
            View All Events
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Create Your Own Event?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of event organizers who trust Ticketify for their blockchain-powered events.
            </p>
            <Link
              href="/create-event"
              className="inline-flex items-center px-8 py-4 bg-primary-gradient text-white rounded-xl bg-primary-gradient-hover transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Create Your Event
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
