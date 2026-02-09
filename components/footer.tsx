import { Hotel, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Hotel className="h-6 w-6" />
              <span className="font-serif text-lg font-bold">The Grand Haven</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed opacity-70">
              Experience luxury accommodation and world-class dining in the heart of the city.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/rooms" className="text-sm opacity-70 transition-opacity hover:opacity-100">
                Rooms & Suites
              </Link>
              <Link href="/restaurant" className="text-sm opacity-70 transition-opacity hover:opacity-100">
                Restaurant
              </Link>
              <Link href="/my-bookings" className="text-sm opacity-70 transition-opacity hover:opacity-100">
                My Bookings
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">Contact</h3>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm opacity-70">
                <MapPin className="h-4 w-4 shrink-0" />
                123 Luxury Ave, Downtown City
              </div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Phone className="h-4 w-4 shrink-0" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2 text-sm opacity-70">
                <Mail className="h-4 w-4 shrink-0" />
                info@grandhaven.com
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-background/20 pt-6 text-center text-sm opacity-50">
          &copy; {new Date().getFullYear()} The Grand Haven Hotel & Restaurant. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
