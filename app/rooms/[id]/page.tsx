"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RoomBookingForm } from "@/components/room-booking-form"
import { rooms } from "@/lib/seed-data"
import { Badge } from "@/components/ui/badge"
import { Users, Check } from "lucide-react"
import Image from "next/image"

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const room = rooms.find((r) => r.id === id)

  if (!room) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Room Image & Info */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={room.image || "/placeholder.svg"}
                  alt={room.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">{room.name}</h1>
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Up to {room.capacity} guests</span>
                    </div>
                  </div>
                  <Badge className="bg-primary px-3 py-1.5 text-lg font-bold text-primary-foreground">
                    {'\u20B9'}{room.price.toLocaleString("en-IN")}
                    <span className="text-xs font-normal">/night</span>
                  </Badge>
                </div>
                <p className="mt-4 leading-relaxed text-muted-foreground">{room.description}</p>
                <div className="mt-6">
                  <h3 className="font-serif text-lg font-semibold text-foreground">Amenities</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {room.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <RoomBookingForm room={room} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
