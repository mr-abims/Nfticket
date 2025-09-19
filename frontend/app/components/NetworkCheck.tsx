'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { isOnCorrectNetwork, getCurrentNetwork } from '../contracts/config'

export const NetworkCheck = () => {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const correctNetwork = getCurrentNetwork()

  if (isOnCorrectNetwork(chainId)) {
    return null 
  }

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: correctNetwork.chainId })
    }
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            Wrong Network
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
            Please switch to <strong>{correctNetwork.name}</strong> network to interact with the smart contracts.
          </p>
          <button
            onClick={handleSwitchNetwork}
            disabled={isPending}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Switching...
              </>
            ) : (
              `Switch to ${correctNetwork.name}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
