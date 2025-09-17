'use client'

import { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DateTimePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  minDate?: Date
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

// Custom input component that makes the entire input clickable
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, className, disabled }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      disabled={disabled}
      className={`w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className || ''}`}
    />
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  </div>
))

CustomInput.displayName = 'CustomInput'

export function DateTimePicker({
  selected,
  onChange,
  minDate,
  placeholder = "Select date and time",
  className,
  required = false,
  disabled = false,
}: DateTimePickerProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="MMMM d, yyyy h:mm aa"
      minDate={minDate}
      placeholderText={placeholder}
      customInput={<CustomInput className={className} disabled={disabled} />}
      required={required}
      disabled={disabled}
      popperClassName="react-datepicker-popper"
      calendarClassName="react-datepicker-calendar"
      wrapperClassName="w-full"
      // Custom styling props
      dayClassName={(date) => {
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        const isPast = date < today
        
        if (isPast) {
          return 'react-datepicker__day--disabled'
        }
        if (isToday) {
          return 'react-datepicker__day--today'
        }
        return 'react-datepicker__day'
      }}
      // Prevent selection of past dates
      filterDate={(date) => {
        const now = new Date()
        return date >= now
      }}
      // Start with next available hour
      openToDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
    />
  )
}
