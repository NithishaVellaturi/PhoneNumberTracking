import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { countryOptions } from '../../constants/tracking'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface SearchBarProps {
  compact?: boolean
  countryCode: string
  phoneNumber: string
  onCountryCodeChange: (value: string) => void
  onPhoneNumberChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  submitLabel?: string
}

export function SearchBar({
  compact = false,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  onSubmit,
  loading = false,
  submitLabel = 'Track Now',
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className={`glass-panel flex flex-col gap-3 rounded-3xl p-3 ${compact ? 'md:flex-row' : 'md:flex-row md:p-4'}`}>
      <select
        value={countryCode}
        onChange={(event) => onCountryCodeChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none"
      >
        {countryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Input
        value={phoneNumber}
        onChange={(event) => onPhoneNumberChange(event.target.value)}
        placeholder="Enter phone number to inspect"
        className="flex-1"
      />
      <Button className="min-w-40" type="submit" disabled={loading}>
        <Search className="mr-2 h-4 w-4" />
        {loading ? 'Checking...' : submitLabel}
      </Button>
    </form>
  )
}
