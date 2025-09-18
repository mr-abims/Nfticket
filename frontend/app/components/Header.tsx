'use client'

import Link from "next/link"
import { useState } from "react"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from "next/image"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image 
                src="/Ticketify.svg" 
                alt="Ticketify" 
                width={40} 
                height={40}
                className="object-contain"
                style={{ width: '40px', height: '40px' }}
              />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Ticketify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium text-lg"
            >
              Events
            </Link>
            <Link
              href="/create-event"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium text-lg"
            >
              Create Event
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium text-lg"
            >
              Dashboard
            </Link>
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex items-center space-x-4">
            {/* <button className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
              Connect Wallet
            </button> */}
            <ConnectButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-slate-200 dark:border-slate-700">
            <nav className="flex flex-col space-y-5">
              <Link
                href="/events"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/create-event"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Event
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {/* <button className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                Connect Wallet
              </button> */}
              <ConnectButton />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
