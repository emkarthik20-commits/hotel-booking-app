"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { restaurantTables, timeSlots } from "@/lib/seed-data"
import { Loader2, UtensilsCrossed, Users, MapPin, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ExistingReservation {
  tableId: string
  time: string
  duration: string
  status: string
}

function parseTimeTo24(timeStr: string): number {
  const [time, period] = timeStr.split(" ")
  const parts = time.split(":")
  let hours = Number.parseInt(parts[0])
  const minutes = Number.parseInt(parts[1])
  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0
  return hours * 60 + minutes
}

function parseDurationToMinutes(dur: string): number {
  if (dur === "30 mins") return 30
  if (dur === "1 hour") return 60
  if (dur === "1.5 hours") return 90
  if (dur === "2 hours") return 120
  if (dur === "2.5 hours") return 150
  if (dur === "3 hours") return 180
  return 60
}

function minutesTo12hr(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

function isTableBooked(
  tableId: string,
  selectedTime: string,
  selectedDuration: string,
  reservations: ExistingReservation[]
): { booked: boolean; bookedUntil: string | null } {
  const selStart = parseTimeTo24(selectedTime)
  const selEnd = selStart + parseDurationToMinutes(selectedDuration)

  for (const res of reservations) {
    if (res.tableId !== tableId) continue
    if (res.status === "cancelled") continue

    const resStart = parseTimeTo24(res.time)
    const resEnd = resStart + parseDurationToMinutes(res.duration)

    if (selStart < resEnd && selEnd > resStart) {
      return { booked: true, bookedUntil: minutesTo12hr(resEnd) }
    }
  }
  return { booked: false, bookedUntil: null }
}

export function RestaurantReservationForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [guests, setGuests] = useState("")
  const [location, setLocation] = useState("")
  const [duration, setDuration] = useState("")
  const [selectedTableId, setSelectedTableId] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingReservations, setFetchingReservations] = useState(false)
  const [existingReservations, setExistingReservations] = useState<ExistingReservation[]>([])

  const today = new Date().toISOString().split("T")[0]

  const fetchReservationsForDate = useCallback(async (selectedDate: string) => {
    if (!selectedDate) {
      setExistingReservations([])
      return
    }
    setFetchingReservations(true)
    try {
      const q = query(
        collection(db, "tableReservations"),
        where("date", "==", selectedDate)
      )
      const snap = await getDocs(q)
      const res = snap.docs.map((d) => {
        const data = d.data()
        return {
          tableId: data.tableId || "",
          time: data.time || "",
          duration: data.duration || "1 hour",
          status: data.status || "confirmed",
        } as ExistingReservation
      })
      setExistingReservations(res)
    } catch {
      console.error("Failed to fetch existing reservations")
    } finally {
      setFetchingReservations(false)
    }
  }, [])

  useEffect(() => {
    fetchReservationsForDate(date)
  }, [date, fetchReservationsForDate])

  useEffect(() => {
    setSelectedTableId("")
  }, [date, time, guests, location, duration])

  const filteredTables = restaurantTables.filter((table) => {
    if (location && table.location !== location) return false
    if (guests && table.seats < Number.parseInt(guests)) return false
    return true
  })

  const tablesWithStatus = filteredTables.map((table) => {
    if (!time || !duration) {
      return { ...table, isBooked: false, bookedUntil: null as string | null }
    }
    const result = isTableBooked(table.id, time, duration, existingReservations)
    return { ...table, isBooked: result.booked, bookedUntil: result.bookedUntil }
  })

  const availableTables = tablesWithStatus.filter((t) => !t.isBooked)
  const bookedTables = tablesWithStatus.filter((t) => t.isBooked)

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
    if (!selectedTableId) {
      toast.error("Please select a table")
      return
    }

    const selectedTable = restaurantTables.find((t) => t.id === selectedTableId)
    if (!selectedTable) {
      toast.error("Selected table not found")
      return
    }

    const conflict = isTableBooked(selectedTableId, time, duration, existingReservations)
    if (conflict.booked) {
      toast.error(`This table is already booked until ${conflict.bookedUntil}`)
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
                <SelectItem value="30 mins">30 minutes</SelectItem>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                <SelectItem value="2 hours">2 hours</SelectItem>
                <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                <SelectItem value="3 hours">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table selection with availability */}
          {date && time && duration && guests && (
            <div className="flex flex-col gap-3">
              <Label>Select a Table</Label>
              {fetchingReservations ? (
                <div className="flex items-center gap-2 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking availability...
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableTables.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available</p>
                      {availableTables.map((table) => (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => setSelectedTableId(table.id)}
                          className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                            selectedTableId === table.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{table.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {table.location} &middot; {table.seats} seats
                              </p>
                            </div>
                          </div>
                          {selectedTableId === table.id && (
                            <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {bookedTables.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Booked</p>
                      {bookedTables.map((table) => (
                        <div
                          key={table.id}
                          className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3 opacity-70"
                        >
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{table.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {table.location} &middot; {table.seats} seats
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-destructive/30 text-destructive text-xs">
                            Booked till {table.bookedUntil}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredTables.length === 0 && (
                    <div className="rounded-lg bg-secondary p-4 text-center text-sm text-muted-foreground">
                      No tables match your guest count or area preference. Try different options.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="special">Special Requests (optional)</Label>
            <Input
              id="special"
              placeholder="e.g. Birthday celebration, dietary needs..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !user || !selectedTableId}
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
