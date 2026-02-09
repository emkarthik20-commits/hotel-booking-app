"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RoomCard } from "@/components/room-card"
import { rooms } from "@/lib/seed-data"

export default function RoomsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Accommodation
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
              <span className="text-balance">Our Rooms & Suites</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Choose from our selection of elegantly appointed rooms and suites, each designed for your comfort and relaxation.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
