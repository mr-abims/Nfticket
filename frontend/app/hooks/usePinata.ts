'use client'

import { useState } from 'react'

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

interface PinataError {
  error: string
  details?: string
}

// Note: In production, you should use environment variables for these keys
// For now, we'll use placeholder values that you can replace
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || 'your_pinata_api_key'
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || 'your_pinata_secret_key'

export const usePinata = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadToPinata = async (file: File): Promise<string> => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Validate API keys
      if (PINATA_API_KEY === 'your_pinata_api_key' || PINATA_SECRET_KEY === 'your_pinata_secret_key') {
        throw new Error('Pinata API keys not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY')
      }

      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Check file size (max 100MB)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 100MB')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed')
      }

      const formData = new FormData()
      formData.append('file', file)

      // Add metadata
      const metadata = JSON.stringify({
        name: `event-image-${Date.now()}`,
        keyvalues: {
          uploadedBy: 'ticketify',
          uploadDate: new Date().toISOString(),
        },
      })
      formData.append('pinataMetadata', metadata)

      // Add options
      const options = JSON.stringify({
        cidVersion: 1,
      })
      formData.append('pinataOptions', options)

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as PinataError
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      }

      const result = await response.json() as PinataResponse

      // Return the IPFS URL
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      return ipfsUrl

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const uploadJSON = async (jsonData: object): Promise<string> => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Validate API keys
      if (PINATA_API_KEY === 'your_pinata_api_key' || PINATA_SECRET_KEY === 'your_pinata_secret_key') {
        throw new Error('Pinata API keys not configured')
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
          pinataContent: jsonData,
          pinataMetadata: {
            name: `event-metadata-${Date.now()}`,
            keyvalues: {
              uploadedBy: 'ticketify',
              uploadDate: new Date().toISOString(),
            },
          },
          pinataOptions: {
            cidVersion: 1,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as PinataError
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      }

      const result = await response.json() as PinataResponse
      return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'JSON upload failed'
      setUploadError(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const clearError = () => setUploadError(null)

  return {
    uploadToPinata,
    uploadJSON,
    isUploading,
    uploadError,
    clearError,
  }
}
