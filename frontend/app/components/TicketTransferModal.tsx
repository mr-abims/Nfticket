'use client'

import { useState } from 'react'
import { useEventManager } from '../hooks/useContracts'

interface TicketTransferModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    eventId: string
    eventTitle: string
    tokenId: number
    eventAddress: string
  } | null
  onTransferComplete: () => void
}

export const TicketTransferModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
  onTransferComplete 
}: TicketTransferModalProps) => {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transferError, setTransferError] = useState<string | null>(null)
  
  const { transferTicket, isRegistering: isTransferring, registerError } = useEventManager(
    ticket?.eventAddress as `0x${string}` | undefined
  )

  const handleTransfer = async () => {
    if (!recipientAddress) {
      setTransferError('Please enter a recipient address')
      return
    }

    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      setTransferError('Please enter a valid Ethereum address')
      return
    }

    try {
      setTransferError(null)
      await transferTicket(recipientAddress as `0x${string}`, BigInt(ticket?.tokenId || 0))
      onTransferComplete()
      onClose()
    } catch (error) {
      console.error('Transfer failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Transfer failed. Please try again.'
      setTransferError(errorMessage)
    }
  }

  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transfer Ticket
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{ticket.eventTitle}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">Token ID: #{ticket.tokenId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Recipient Address *
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value)
                if (transferError) setTransferError(null)
              }}
              placeholder="0x..."
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Enter the Ethereum address of the person you want to transfer this ticket to.
            </p>
          </div>

          {(transferError || registerError) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {transferError || registerError?.message}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This action cannot be undone. Make sure you trust the recipient and have entered the correct address.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isTransferring}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={isTransferring || !recipientAddress}
            className="flex-1 px-4 py-3 bg-primary-gradient text-white rounded-lg bg-primary-gradient-hover transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isTransferring ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transferring...
              </>
            ) : (
              'Transfer Ticket'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
