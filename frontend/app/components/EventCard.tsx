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

  const getEventStatus = () => {
    const now = new Date()
    const eventDate = new Date(event.date)
    const isUpcoming = eventDate > now
    const isLive = event.isActive && !isUpcoming
    const isPast = !event.isActive || eventDate < now

    if (isLive) {
      return {
        status: "Live",
        color: "bg-green-500 text-white",
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      }
    } else if (isPast) {
      return {
        status: "Ended",
        color: "bg-slate-500 text-white",
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      }
    } else {
      return {
        status: "Upcoming",
        color: "bg-blue-500 text-white",
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      }
    }
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
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {event.ticketPrice} STT
          </div>
          {(() => {
            const statusInfo = getEventStatus()
            return (
              <div className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
                {statusInfo.icon}
                <span>{statusInfo.status}</span>
              </div>
            )
          })()}
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
