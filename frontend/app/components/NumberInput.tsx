'use client'

import { useState, useEffect } from 'react'

interface NumberInputProps {
  name: string
  value: number
  onChange: (name: string, value: number) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  label?: string
  required?: boolean
  suffix?: string
  disabled?: boolean
  className?: string
}

export function NumberInput({
  name,
  value,
  onChange,
  placeholder = "0",
  min = 0,
  max,
  step = 1,
  label,
  required = false,
  suffix,
  disabled = false,
  className = ""
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const [isFocused, setIsFocused] = useState(false)

  // Update input value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString())
    }
  }, [value, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Parse and validate the number
    const numValue = parseFloat(newValue)
    if (!isNaN(numValue)) {
      // Apply min/max constraints
      let constrainedValue = numValue
      if (min !== undefined && constrainedValue < min) {
        constrainedValue = min
      }
      if (max !== undefined && constrainedValue > max) {
        constrainedValue = max
      }
      onChange(name, constrainedValue)
    } else if (newValue === '') {
      onChange(name, 0)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Clear the input for easier typing
    e.target.select()
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Ensure the input shows the correct formatted value
    setInputValue(value.toString())
  }

  const increment = () => {
    const newValue = value + step
    const constrainedValue = max !== undefined ? Math.min(newValue, max) : newValue
    onChange(name, constrainedValue)
  }

  const decrement = () => {
    const newValue = value - step
    const constrainedValue = min !== undefined ? Math.max(newValue, min) : newValue
    onChange(name, constrainedValue)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-4 py-3 pr-20 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        
        {/* Incrementer buttons */}
        <div className="absolute right-1 top-1 flex flex-col">
          <button
            type="button"
            onClick={increment}
            disabled={disabled || (max !== undefined && value >= max)}
            className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || (min !== undefined && value <= min)}
            className="px-2 py-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Suffix */}
        {suffix && (
          <div className="absolute inset-y-0 right-20 flex items-center pr-3 pointer-events-none">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {suffix}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
