'use client'

import { useState } from "react"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { EventFormData, EventCategory } from "../types/event"

export default function CreateEventPage() {
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // In a real app, this would interact with the smart contract
    try {
      console.log("Creating event:", formData)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      alert("Event created successfully!")
      // Reset form or redirect
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        date: "",
        location: "",
        category: "other",
        ticketPrice: 0,
        totalTickets: 0
      })
      setCurrentStep(1)
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
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
                      Event Image URL *
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/event-image.jpg"
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Upload your image to a service like IPFS or use a direct URL
                    </p>
                  </div>

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preview:</p>
                      <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Event preview"
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
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Ticket Price (STT) *
                      </label>
                      <input
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleInputChange}
                        placeholder="0.1"
                        step="0.001"
                        min="0"
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Total Tickets *
                      </label>
                      <input
                        type="number"
                        name="totalTickets"
                        value={formData.totalTickets}
                        onChange={handleInputChange}
                        placeholder="100"
                        min="1"
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
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
                    disabled={!isStepValid(currentStep) || isSubmitting}
                    className="px-8 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Event...
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
  )
}
