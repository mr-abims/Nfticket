'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useWaitForTransactionReceipt } from "wagmi"
import { parseEther, decodeEventLog } from "viem"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { NetworkCheck } from "../components/NetworkCheck"
import { EventCreationModal, EventCreationStep } from "../components/EventCreationModal"
import { DateTimePicker } from "../components/DateTimePicker"
import { NumberInput } from "../components/NumberInput"
import { EventFormData, EventCategory } from "../types/event"
import { useEventFactory } from "../hooks/useContracts"
import { usePinata } from "../hooks/usePinata"
import { areContractsConfigured, CONTRACT_ABIS } from "../contracts/config"
import { validateAndGenerateEventTimes, getMinDateTimeLocal } from "../lib/dateUtils"

export default function CreateEventPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { createEvent, isCreating, createError, transactionHash: realTransactionHash } = useEventFactory()
  const { uploadToPinata, uploadJSON, isUploading, uploadError, clearError } = usePinata()
  
  // Wait for transaction receipt to get event address
  const { data: transactionReceipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: realTransactionHash,
  })

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    imageUrl: "",
    date: "",
    location: "",
    category: "other",
    ticketPrice: 0,
    totalTickets: 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<EventCreationStep>('uploading-image')
  const [transactionHash, setTransactionHash] = useState<string>()
  const [eventAddress, setEventAddress] = useState<string>()
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [metadataUploadProgress, setMetadataUploadProgress] = useState(0)
  
  // Separate state for date picker
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const categories: { value: EventCategory; label: string }[] = [
    { value: "conference", label: "Conference" },
    { value: "concert", label: "Concert" },
    { value: "workshop", label: "Workshop" },
    { value: "meetup", label: "Meetup" },
    { value: "sports", label: "Sports" },
    { value: "exhibition", label: "Exhibition" },
    { value: "other", label: "Other" }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "ticketPrice" || name === "totalTickets" ? Number(value) : value
    }))
    // Clear errors when user starts typing
    if (submitError) setSubmitError(null)
    if (uploadError) clearError()
  }

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    // Convert to datetime-local format for form data
    if (date) {
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setFormData(prev => ({ ...prev, date: localDateTime }))
    } else {
      setFormData(prev => ({ ...prev, date: "" }))
    }
    
    // Clear errors when user selects date
    if (submitError) setSubmitError(null)
  }

  const handleNumberChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user changes number
    if (submitError) setSubmitError(null)
  }

  // Watch for real transaction hash and receipt from wagmi
  useEffect(() => {
    if (realTransactionHash && modalStep === 'creating-event') {
      setTransactionHash(realTransactionHash)
      
      // If we have the transaction receipt, extract event address from logs
      if (transactionReceipt && transactionReceipt.logs) {
        try {
          // Look for EventCreated event in logs
          for (const log of transactionReceipt.logs) {
            try {
              const decodedLog = decodeEventLog({
                abi: CONTRACT_ABIS.EVENT_FACTORY,
                data: log.data,
                topics: log.topics,
              })
              
              // Check if this is the EventCreated event
              if (decodedLog.eventName === 'EventCreated' && decodedLog.args) {
                const args = decodedLog.args as any
                const eventContractAddress = args.eventContract || args[0] // First argument is eventContract
                if (eventContractAddress) {
                  setEventAddress(eventContractAddress as string)
                  console.log('Extracted event contract address:', eventContractAddress)
                  break
                }
              }
            } catch (decodeError) {
              // Skip logs that can't be decoded with our ABI
              continue
            }
          }
        } catch (error) {
          console.error('Error parsing transaction logs:', error)
          // Fallback to a derived address
          setEventAddress(`0x${realTransactionHash.slice(2, 42)}`)
        }
      }
      
      // Move to success step
      setModalStep('success')
    }
  }, [realTransactionHash, transactionReceipt, modalStep])

  // Initialize selectedDate from formData.date if it exists
  useEffect(() => {
    if (formData.date && !selectedDate) {
      const date = new Date(formData.date)
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
      }
    }
  }, [formData.date, selectedDate])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    
    try {
      const ipfsUrl = await uploadToPinata(file)
      setFormData(prev => ({ ...prev, imageUrl: ipfsUrl }))
    } catch (error) {
      console.error('Image upload failed:', error)
      // Error is handled by the usePinata hook
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setModalOpen(true)
    setModalStep('uploading-image')

    try {
      // Validation
      if (!isConnected) {
        throw new Error('Please connect your wallet first')
      }

      if (!areContractsConfigured()) {
        throw new Error('Smart contracts not configured. Please contact support.')
      }

      if (!imageFile && !formData.imageUrl) {
        throw new Error('Please upload an event image')
      }

      // Step 1: Upload image to IPFS
      setModalStep('uploading-image')
      setImageUploadProgress(0)
      
      let imageUrl: string
      if (formData.imageUrl) {
        // Image already uploaded
        imageUrl = formData.imageUrl
        setImageUploadProgress(100)
      } else if (imageFile) {
        // Upload image with progress tracking
        const uploadPromise = uploadToPinata(imageFile)
        
        // Simulate progress (since Pinata doesn't provide real progress)
        const progressInterval = setInterval(() => {
          setImageUploadProgress(prev => Math.min(prev + 10, 90))
        }, 200)

        imageUrl = await uploadPromise
        clearInterval(progressInterval)
        setImageUploadProgress(100)
      } else {
        throw new Error('No image to upload')
      }

      // Step 2: Create and upload metadata
      setModalStep('uploading-metadata')
      setMetadataUploadProgress(0)

      // Validate date and generate timestamps
      const { 
        eventDate, 
        regStartTime, 
        regEndTime, 
        regStartTimeDate, 
        regEndTimeDate 
      } = validateAndGenerateEventTimes(formData.date)

      // Create event acronym from title
      const eventAcronym = formData.title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 5)

      // Create metadata for ticket URI
      const ticketMetadata = {
        name: `${formData.title} Ticket`,
        description: formData.description,
        image: imageUrl,
        attributes: [
          { trait_type: "Event", value: formData.title },
          { trait_type: "Location", value: formData.location },
          { trait_type: "Category", value: formData.category },
          { trait_type: "Date", value: formData.date },
        ]
      }

      // Upload metadata with progress tracking
      const metadataProgressInterval = setInterval(() => {
        setMetadataUploadProgress(prev => Math.min(prev + 15, 90))
      }, 150)

      const ticketURI = await uploadJSON(ticketMetadata)
      clearInterval(metadataProgressInterval)
      setMetadataUploadProgress(100)

      // Step 3: Create event on blockchain
      setModalStep('creating-event')

      console.log('Creating event with data:', {
        eventName: formData.title,
        eventAcronym,
        regStartTime: regStartTime.toString(),
        regStartTimeDate: regStartTimeDate.toISOString() + ' (3min buffer)',
        regEndTime: regEndTime.toString(),
        regEndTimeDate: regEndTimeDate.toISOString(),
        eventDate: eventDate.toISOString(),
        ticketFee: formData.ticketPrice.toString() + ' STT',
        maxTickets: formData.totalTickets,
        ticketURI,
      })

      // Create event on blockchain
      await createEvent({
        eventName: formData.title,
        eventAcronym,
        regStartTime,
        regEndTime,
        ticketFee: parseEther(formData.ticketPrice.toString()),
        maxTickets: BigInt(formData.totalTickets),
        ticketURI,
      })

      // The useEffect will handle moving to success when transaction hash is available
      // For now, keep showing "creating-event" until transaction is confirmed

    } catch (error) {
      console.error("Error creating event:", error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event. Please try again.'
      setSubmitError(errorMessage)
      setModalStep('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    // Let the Link components in the modal handle navigation
    // No automatic redirect here to avoid conflicts
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category
      case 2:
        return formData.date && formData.location && formData.imageUrl
      case 3:
        return formData.ticketPrice >= 0 && formData.totalTickets > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-purple-600/10 dark:from-black/20 dark:to-purple-400/10"></div>
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-r from-black/30 to-purple-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative">
        <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Wallet Connection Check */}
        {!isConnected && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Wallet Connection Required</h3>
                  <p className="text-yellow-700 dark:text-yellow-300">Please connect your wallet to create events on the blockchain.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Check */}
        <div className="max-w-4xl mx-auto mb-8">
          <NetworkCheck />
        </div>

        {/* Contract Configuration Check */}
        {!areContractsConfigured() && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Smart Contracts Not Configured</h3>
                  <p className="text-red-700 dark:text-red-300">The smart contract addresses need to be configured. Please contact support.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(submitError || createError) && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Creating Event</h3>
                  <p className="text-red-700 dark:text-red-300">{submitError || createError?.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Create Your Event
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Launch your event on the blockchain and reach a global audience. 
              Secure, transparent, and decentralized ticketing made simple.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step <= currentStep
                        ? "bg-primary-gradient text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {step}
                  </div>
                  <div className="ml-3 text-sm">
                    <p className={`font-medium ${
                      step <= currentStep
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {step === 1 && "Basic Info"}
                      {step === 2 && "Event Details"}
                      {step === 3 && "Ticketing"}
                    </p>
                  </div>
                  {step < 3 && (
                    <div className={`ml-8 w-16 h-0.5 ${
                      step < currentStep
                        ? "bg-primary-gradient"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Basic Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter your event title"
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Event Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your event in detail..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Event Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Event Details
                  </h2>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Event Date & Time *
                      </label>
                      <DateTimePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        minDate={new Date(Date.now() + 2 * 60 * 60 * 1000)} // Minimum 2 hours from now
                        placeholder="Select event date and time"
                        required
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Event must be scheduled at least 2 hours from now to allow for registration.
                      </p>
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter event location or 'Virtual Event'"
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Event Image *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Upload your event image. This will be the main image displayed for your event and stored on IPFS for decentralized access.
                    </p>
                    {isUploading && (
                      <div className="flex items-center mt-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-purple-600">Uploading to IPFS...</span>
                      </div>
                    )}
                    {uploadError && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{uploadError}</p>
                      </div>
                    )}
                    {formData.imageUrl && !isUploading && !uploadError && (
                      <div className="flex items-center mt-2">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-600">Image uploaded successfully and ready to use!</span>
                      </div>
                    )}
                  </div>

                  {/* Event Image Preview */}
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Event Image Preview:</p>
                      <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Event image preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Ticketing */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Ticketing Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <NumberInput
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleNumberChange}
                        label="Ticket Price (STT)"
                        placeholder="0.1"
                        min={0}
                        step={0.01}
                        suffix="STT"
                        required
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enter price in STT (e.g., 1 = 1 STT, 0.1 = 0.1 STT)
                      </p>
                    </div>

                    <div>
                      <NumberInput
                        name="totalTickets"
                        value={formData.totalTickets}
                        onChange={handleNumberChange}
                        label="Total Tickets"
                        placeholder="100"
                        min={1}
                        step={1}
                        required
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Click to type directly or use ▲▼ buttons to adjust
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Event Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Title:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{formData.title || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Category:</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {categories.find(c => c.value === formData.category)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Date:</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {formData.date ? new Date(formData.date).toLocaleDateString() : "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Location:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{formData.location || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Ticket Price:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{formData.ticketPrice} STT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Total Tickets:</span>
                        <span className="text-slate-900 dark:text-white font-medium">{formData.totalTickets}</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Potential Revenue:</span>
                          <span className="text-slate-900 dark:text-white font-bold">
                            {(formData.ticketPrice * formData.totalTickets).toFixed(4)} STT
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="px-6 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isStepValid(currentStep) || isSubmitting || isCreating || isUploading || !isConnected}
                    className="px-8 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {(isSubmitting || isCreating || isUploading) ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isUploading ? 'Uploading...' : isCreating ? 'Creating on Blockchain...' : 'Processing...'}
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
      </div>

      {/* Event Creation Modal */}
      <EventCreationModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        step={modalStep}
        error={submitError || undefined}
        transactionHash={transactionHash}
        eventAddress={eventAddress}
        eventName={formData.title}
        imageUploadProgress={imageUploadProgress}
        metadataUploadProgress={metadataUploadProgress}
      />
    </div>
  )
}
