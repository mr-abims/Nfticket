export interface Event {
  id: string
  title: string
  description: string
  imageUrl: string
  date: string
  location: string
  category: string
  ticketPrice: number
  totalTickets: number
  availableTickets: number
  organizer: string
  contractAddress: string
  isActive: boolean
  createdAt: string
}

export interface Ticket {
  id: string
  eventId: string
  owner: string
  tokenId: number
  purchasePrice: number
  purchaseDate: string
  isUsed: boolean
  qrCode?: string
}

export interface EventFormData {
  title: string
  description: string
  imageUrl: string
  date: string
  location: string
  category: string
  ticketPrice: number
  totalTickets: number
}

export type EventCategory = 
  | 'conference'
  | 'concert'
  | 'workshop'
  | 'meetup'
  | 'sports'
  | 'exhibition'
  | 'other'

export interface EventFilters {
  category?: EventCategory
  priceRange?: {
    min: number
    max: number
  }
  dateRange?: {
    start: string
    end: string
  }
  location?: string
}
