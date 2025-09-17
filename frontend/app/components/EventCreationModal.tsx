'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'

export type EventCreationStep = 
  | 'uploading-image'
  | 'uploading-metadata' 
  | 'creating-event'
  | 'success'
  | 'error'

export interface EventCreationModalProps {
  isOpen: boolean
  onClose: () => void
  step: EventCreationStep
  error?: string
  transactionHash?: string
  eventAddress?: string
  eventName?: string
  imageUploadProgress?: number
  metadataUploadProgress?: number
}

const getExplorerUrl = (txHash: string) => {
  // Somnia Testnet explorer URL
  return `https://somnia-testnet.socialscan.io/tx/${txHash}`
}

const getStepInfo = (step: EventCreationStep) => {
  switch (step) {
    case 'uploading-image':
      return {
        title: 'Uploading Image',
        description: 'Uploading your event image to IPFS...',
        icon: (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
      }
    case 'uploading-metadata':
      return {
        title: 'Creating Metadata',
        description: 'Uploading event metadata to IPFS...',
        icon: (
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.004-5.824-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )
      }
    case 'creating-event':
      return {
        title: 'Creating Event',
        description: 'Deploying your event to the blockchain...',
        icon: (
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      }
    case 'success':
      return {
        title: 'Event Created Successfully!',
        description: 'Your event has been successfully created on the blockchain.',
        icon: (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    case 'error':
      return {
        title: 'Creation Failed',
        description: 'There was an error creating your event.',
        icon: (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      }
    default:
      return {
        title: 'Processing',
        description: 'Please wait...',
        icon: (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      }
  }
}

export function EventCreationModal({
  isOpen,
  onClose,
  step,
  error,
  transactionHash,
  eventAddress,
  eventName,
  imageUploadProgress = 0,
  metadataUploadProgress = 0
}: EventCreationModalProps) {
  const stepInfo = getStepInfo(step)
  const canClose = step === 'success' || step === 'error'

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={canClose ? onClose : () => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center">
                  {/* Icon */}
                  <div className="mb-4">
                    {step !== 'success' && step !== 'error' ? (
                      <div className="animate-spin">
                        {stepInfo.icon}
                      </div>
                    ) : (
                      stepInfo.icon
                    )}
                  </div>

                  {/* Title */}
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-slate-900 dark:text-white text-center mb-2"
                  >
                    {stepInfo.title}
                  </Dialog.Title>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-6">
                    {error || stepInfo.description}
                  </p>

                  {/* Progress Bars */}
                  {step === 'uploading-image' && (
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Image Upload</span>
                        <span>{Math.round(imageUploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${imageUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {step === 'uploading-metadata' && (
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Metadata Upload</span>
                        <span>{Math.round(metadataUploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${metadataUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Event Details */}
                  {step === 'success' && eventName && (
                    <div className="w-full bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Event Details</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                        <strong>Name:</strong> {eventName}
                      </p>
                      {eventAddress && (
                        <p className="text-sm text-green-700 dark:text-green-300">
                          <strong>Contract:</strong> {eventAddress.slice(0, 10)}...{eventAddress.slice(-8)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Transaction Hash */}
                  {transactionHash && (
                    <div className="w-full bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Transaction Details</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <strong>Hash:</strong> {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                      </p>
                      <Link
                        href={getExplorerUrl(transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View on Etherscan
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 w-full">
                    {step === 'success' && (
                      <>
                        <Link
                          href="/events"
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => {
                            // Close modal after a short delay to ensure navigation completes
                            setTimeout(() => onClose(), 100)
                          }}
                        >
                          View Events
                        </Link>
                        {eventAddress && (
                          <Link
                            href={`/events/${eventAddress}`}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            onClick={() => {
                              // Close modal after a short delay to ensure navigation completes
                              setTimeout(() => onClose(), 100)
                            }}
                          >
                            View Event
                          </Link>
                        )}
                      </>
                    )}

                    {step === 'error' && (
                      <button
                        type="button"
                        className="w-full inline-flex justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={onClose}
                      >
                        Close
                      </button>
                    )}

                    {!canClose && (
                      <div className="w-full text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Please wait while we process your request...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
