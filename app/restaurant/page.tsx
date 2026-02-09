"use client"

import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { RestaurantReservationForm } from "@/components/restaurant-reservation-form"

export default function RestaurantPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <section className="relative flex h-64 items-center justify-center overflow-hidden md:h-80">
          <Image
            src="/images/restaurant.jpg"
            alt="The Grand Haven Restaurant"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="relative z-10 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-background/80">
              Fine Dining
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-background md:text-5xl">
              Our Restaurant
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Info */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                  <span className="text-balance">A Culinary Journey Awaits</span>
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Our award-winning restaurant offers an unforgettable dining experience with a curated menu of seasonal dishes, 
                  expertly crafted by our executive chef. From locally sourced ingredients to international flavors, 
                  every plate tells a story.
                </p>

                <div className="mt-8 flex flex-col gap-6">
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="font-serif text-lg font-semibold text-card-foreground">Lunch Service</h3>
                    <p className="mt-1 text-sm text-muted-foreground">12:00 PM - 2:30 PM, Daily</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="font-serif text-lg font-semibold text-card-foreground">Dinner Service</h3>
                    <p className="mt-1 text-sm text-muted-foreground">6:00 PM - 10:00 PM, Daily</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="font-serif text-lg font-semibold text-card-foreground">Table Locations</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose from Window seats, Indoor dining, Private rooms, or our beautiful Terrace.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div>
                <RestaurantReservationForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
