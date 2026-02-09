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
import { restaurantTables, timeSlots } from "@/lib/seed-data"
import { Loader2, UtensilsCrossed, Users, MapPin, Clock } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function RestaurantReservationForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [guests, setGuests] = useState("")
  const [location, setLocation] = useState("")
  const [duration, setDuration] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const availableTables = restaurantTables.filter((table) => {
    if (location && table.location !== location) return false
    if (guests && table.seats < Number.parseInt(guests)) return false
    return true
  })

  const locations = [...new Set(restaurantTables.map((t) => t.location))]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to reserve a table")
      router.push("/login")
      return
    }
    if (!date || !time || !guests || !duration) {
      toast.error("Please fill in all required fields")
      return
    }

    const selectedTable = availableTables[0]
    if (!selectedTable) {
      toast.error("No tables available for your selection. Try different options.")
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, "tableReservations"), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Guest",
        tableId: selectedTable.id,
        tableName: selectedTable.name,
        tableLocation: selectedTable.location,
        tableSeats: selectedTable.seats,
        date,
        time,
        duration,
        guests: Number.parseInt(guests),
        specialRequests,
        status: "confirmed",
        createdAt: Timestamp.now(),
      })
      toast.success("Table reserved successfully!")
      router.push("/my-bookings")
    } catch {
      toast.error("Failed to reserve table. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-xl text-card-foreground">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Reserve a Table
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
              to reserve a table
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time</Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {slot}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="guests">Guests</Label>
              <Select value={guests} onValueChange={setGuests} required>
                <SelectTrigger id="guests">
                  <SelectValue placeholder="Guests" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        {n} {n === 1 ? "Guest" : "Guests"}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Preferred Area</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Any area" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {loc}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="duration">Approximate Duration</Label>
            <Select value={duration} onValueChange={setDuration} required>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30 mins">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    30 minutes
                  </div>
                </SelectItem>
                <SelectItem value="1 hour">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    1 hour
                  </div>
                </SelectItem>
                <SelectItem value="1.5 hours">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    1.5 hours
                  </div>
                </SelectItem>
                <SelectItem value="2 hours">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    2 hours
                  </div>
                </SelectItem>
                <SelectItem value="2.5 hours">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    2.5 hours
                  </div>
                </SelectItem>
                <SelectItem value="3 hours">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    3 hours
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="special">Special Requests (optional)</Label>
            <Input
              id="special"
              placeholder="e.g. Birthday celebration, dietary needs..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          {guests && (
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm font-medium text-foreground">
                {availableTables.length > 0
                  ? `${availableTables.length} table(s) available for your selection`
                  : "No tables available for this selection. Try different options."}
              </p>
              {availableTables.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Best match: {availableTables[0].name} ({availableTables[0].location}, {availableTables[0].seats} seats)
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !user || availableTables.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reserving...
              </>
            ) : (
              "Confirm Reservation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
