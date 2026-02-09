"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Loader2, Users } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Room {
  id: string
  name: string
  price: number
  capacity: number
}

export function RoomBookingForm({ room }: { room: Room }) {
  const { user } = useAuth()
  const router = useRouter()
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("1")
  const [specialRequests, setSpecialRequests] = useState("")
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
      : 0
  const totalPrice = nights * room.price

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to book a room")
      router.push("/login")
      return
    }
    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date")
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, "roomBookings"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Guest",
        roomId: room.id,
        roomName: room.name,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: Number.parseInt(guests),
        nights,
        pricePerNight: room.price,
        totalPrice,
        specialRequests,
        status: "confirmed",
        createdAt: Timestamp.now(),
      })
      toast.success("Room booked successfully!")
      router.push("/my-bookings")
    } catch {
      toast.error("Failed to book room. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-24 border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl text-card-foreground">
          <CalendarDays className="h-5 w-5 text-primary" />
          Book This Room
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!user && (
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                sign in
              </Link>{" "}
              to book a room
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkIn">Check-in Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkOut">Check-out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || today}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger id="guests">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: room.capacity }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {i + 1} {i === 0 ? "Guest" : "Guests"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="special">Special Requests (optional)</Label>
            <Input
              id="special"
              placeholder="e.g. Extra pillows, late check-in..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <Separator />

          {/* Price summary */}
          <div className="flex flex-col gap-2 rounded-lg bg-secondary p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${room.price} x {nights} {nights === 1 ? "night" : "nights"}
              </span>
              <span className="text-foreground">${totalPrice}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="font-serif text-xl text-primary">${totalPrice}</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading || !user}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
