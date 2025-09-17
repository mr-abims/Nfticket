/**
 * Date utility functions for event management
 */

/**
 * Convert a date to Unix timestamp in seconds (epoch time)
 */
export const dateToEpoch = (date: Date): bigint => {
  return BigInt(Math.floor(date.getTime() / 1000))
}

/**
 * Convert Unix timestamp (seconds) to Date
 */
export const epochToDate = (epoch: bigint | number): Date => {
  const timestamp = typeof epoch === 'bigint' ? Number(epoch) : epoch
  return new Date(timestamp * 1000)
}

/**
 * Get current time as Unix timestamp in seconds
 */
export const getCurrentEpoch = (): bigint => {
  return BigInt(Math.floor(Date.now() / 1000))
}

/**
 * Validate event date and generate registration timestamps
 * Registration starts 3 minutes from now (buffer for transaction mining)
 * Registration ends 1 hour before the event starts
 */
export const validateAndGenerateEventTimes = (eventDateString: string) => {
  const eventDate = new Date(eventDateString)
  
  // Validate the date
  if (isNaN(eventDate.getTime())) {
    throw new Error('Invalid event date. Please select a valid date.')
  }
  
  if (eventDate.getTime() <= Date.now()) {
    throw new Error('Event date must be in the future.')
  }
  
  // Check minimum time requirement (2 hours from now)
  const minEventTime = Date.now() + (2 * 60 * 60 * 1000) // 2 hours from now
  if (eventDate.getTime() < minEventTime) {
    throw new Error('Event must be scheduled at least 2 hours from now to allow for registration.')
  }
  
  // Registration starts 3 minutes from now (buffer for transaction mining) and ends 1 hour before the event
  const regStartTime = BigInt(Math.floor((Date.now() + (3 * 60 * 1000)) / 1000)) // 3 minutes from now
  const regEndTime = dateToEpoch(new Date(eventDate.getTime() - (60 * 60 * 1000))) // 1 hour before event
  
  return {
    eventDate,
    regStartTime,
    regEndTime,
    regStartTimeDate: epochToDate(regStartTime),
    regEndTimeDate: epochToDate(regEndTime),
  }
}

/**
 * Get minimum datetime string for HTML datetime-local input
 * (2 hours from now)
 */
export const getMinDateTimeLocal = (): string => {
  const minTime = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
  return minTime.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
}

/**
 * Format epoch timestamp for display
 */
export const formatEpochTime = (epoch: bigint | number): string => {
  const date = epochToDate(epoch)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}
