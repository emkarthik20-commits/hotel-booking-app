"use client"

import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Hotel, UtensilsCrossed, Wifi, Car, Dumbbell, Star } from "lucide-react"

const features = [
  {
    icon: Hotel,
    title: "Luxury Rooms",
    description: "From elegant suites to cozy rooms, every stay is unforgettable.",
  },
  {
    icon: UtensilsCrossed,
    title: "Fine Dining",
    description: "Savor world-class cuisine at our award-winning restaurant.",
  },
  {
    icon: Wifi,
    title: "Free Wi-Fi",
    description: "Stay connected with complimentary high-speed internet.",
  },
  {
    icon: Car,
    title: "Valet Parking",
    description: "Complimentary valet parking for all guests.",
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description: "State-of-the-art gym open 24/7 for our guests.",
  },
  {
    icon: Star,
    title: "Concierge",
    description: "Personalized services to make your stay exceptional.",
  },
]

const testimonials = [
  {
    name: "Sarah M.",
    text: "An absolutely stunning hotel. The staff went above and beyond to make our anniversary special.",
    rating: 5,
  },
  {
    name: "James L.",
    text: "The restaurant alone is worth the visit. Best fine dining experience I have had in years.",
    rating: 5,
  },
  {
    name: "Emily R.",
    text: "Clean, elegant, and perfectly located. Will definitely be returning for our next family trip.",
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-hotel.jpg"
          alt="Hotel KMK Hotel exterior at twilight"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-background/80">
            Welcome to
          </p>
          <h1 className="font-serif text-5xl font-bold leading-tight text-background md:text-7xl">
            <span className="text-balance">Hotel KMK</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-background/80">
            Experience luxury accommodation and world-class dining in the heart of the city. Your perfect getaway awaits.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/rooms">Book a Room</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-background/30 px-8 text-base text-background hover:bg-background/10 bg-transparent"
              asChild
            >
              <Link href="/restaurant">Reserve a Table</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Our Services
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
              <span className="text-balance">Everything You Need for a Perfect Stay</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-5 font-serif text-lg font-semibold text-card-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant CTA */}
      <section className="relative overflow-hidden py-20">
        <Image
          src="/images/restaurant.jpg"
          alt="Hotel KMK fine dining restaurant"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-lg">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-background/70">
              Fine Dining
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-background md:text-4xl">
              <span className="text-balance">An Exquisite Culinary Experience</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-background/80">
              Our award-winning restaurant offers a curated menu of seasonal dishes prepared by world-renowned chefs.
            </p>
            <Button size="lg" className="mt-8 h-12 px-8" asChild>
              <Link href="/restaurant">Reserve a Table</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Guest Reviews
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
              <span className="text-balance">What Our Guests Say</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border bg-card">
                <CardContent className="p-8">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {`"${t.text}"`}
                  </p>
                  <p className="mt-4 font-serif text-sm font-semibold text-card-foreground">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
