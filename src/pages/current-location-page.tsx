import { LocateFixed, MapPinned, ShieldCheck } from 'lucide-react'
import { DeviceLocationCard } from '../components/location/device-location-card'
import { Card } from '../components/ui/card'

export function CurrentLocationPage() {
  return (
    <div className="section-shell space-y-8 py-12">
      <div className="max-w-4xl space-y-4">
        <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-200">
          Current Device Location
        </div>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">See your current location in the app</h1>
        <p className="max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
          Use browser permission to show the current location of the person using this device. No sharing link is required.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-[32px]">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
            <LocateFixed className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Exact coordinates</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Show the current device latitude and longitude after browser consent.
          </p>
        </Card>
        <Card className="rounded-[32px]">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
            <MapPinned className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Live map view</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Visualize the current device position on the map with an accuracy radius and open it in Google Maps.
          </p>
        </Card>
        <Card className="rounded-[32px]">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Consent-based only</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This works only for the person currently using the browser. It does not turn a phone number into someone else&apos;s live location.
          </p>
        </Card>
      </div>

      <DeviceLocationCard />
    </div>
  )
}
