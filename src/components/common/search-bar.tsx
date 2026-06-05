import type { FormEvent } from 'react'
import { Search, Sparkles } from 'lucide-react'
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
  helperText?: string
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
  helperText = 'Use international format when possible for the strongest validation signal.',
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className={`glass-panel rounded-[28px] p-3 ${compact ? '' : 'blue-ring'}`}>
      <div className={`flex flex-col gap-3 ${compact ? 'lg:flex-row' : 'lg:flex-row lg:items-center'}`}>
        <label className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-slate-300">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <select
            value={countryCode}
            onChange={(event) => onCountryCodeChange(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 outline-none"
          >
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-950">
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Input
          value={phoneNumber}
          onChange={(event) => onPhoneNumberChange(event.target.value)}
          placeholder="Enter phone number"
          className="h-14 flex-1 rounded-2xl bg-slate-950/65 text-base"
        />
        <Button className="h-14 min-w-44 rounded-2xl px-6" type="submit" disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {loading ? 'Tracking...' : submitLabel}
        </Button>
      </div>
      <p className="px-1 pt-3 text-xs text-slate-400">{helperText}</p>
    </form>
  )
}
