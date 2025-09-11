import Link from "next/link"
import Image from "next/image"
import { Event } from "../types/event"
import { formatDate } from "../lib/utils"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const availabilityPercentage = (event.availableTickets / event.totalTickets) * 100

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      conference: "bg-black/10 text-black dark:bg-black/30 dark:text-white",
      concert: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      workshop: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      meetup: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      sports: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      exhibition: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
    return colors[category] || colors.other
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 group">
      <div className="relative">
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {event.ticketPrice} STT
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)}
          </div>
          
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
        </div>

        {/* Availability indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">Availability</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {event.availableTickets} / {event.totalTickets}
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

        <Link
          href={`/events/${event.id}`}
          className="block w-full bg-primary-gradient text-white text-center py-3 rounded-xl bg-primary-gradient-hover transition-all duration-200 font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
