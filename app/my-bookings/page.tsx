"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Hotel, UtensilsCrossed, CalendarDays, Users, MapPin, Clock, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface RoomBooking {
  id: string
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  totalPrice: number
  status: string
  specialRequests: string
}

interface TableReservation {
  id: string
  tableName: string
  tableLocation: string
  tableSeats: number
  date: string
  time: string
  duration: string
  guests: number
  status: string
  specialRequests: string
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([])
  const [tableReservations, setTableReservations] = useState<TableReservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    const fetchBookings = async () => {
      try {
        const roomQuery = query(
          collection(db, "roomBookings"),
          where("userId", "==", user.uid)
        )
        const roomSnap = await getDocs(roomQuery)
        const roomData = roomSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RoomBooking & { createdAt?: { seconds: number } }))
        roomData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setRoomBookings(roomData)

        const tableQuery = query(
          collection(db, "tableReservations"),
          where("userId", "==", user.uid)
        )
        const tableSnap = await getDocs(tableQuery)
        const tableData = tableSnap.docs.map((d) => ({ id: d.id, ...d.data() } as TableReservation & { createdAt?: { seconds: number } }))
        tableData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setTableReservations(tableData)
      } catch {
        toast.error("Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [user, authLoading, router])

  const cancelRoomBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, "roomBookings", bookingId))
      setRoomBookings((prev) => prev.filter((b) => b.id !== bookingId))
      toast.success("Room booking cancelled")
    } catch {
      toast.error("Failed to cancel booking")
    }
  }

  const cancelTableReservation = async (reservationId: string) => {
    try {
      await deleteDoc(doc(db, "tableReservations", reservationId))
      setTableReservations((prev) => prev.filter((r) => r.id !== reservationId))
      toast.success("Table reservation cancelled")
    } catch {
      toast.error("Failed to cancel reservation")
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-muted text-muted-foreground",
    }
    return (
      <Badge className={variants[status] || "bg-muted text-muted-foreground"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="mt-2 text-muted-foreground">Manage your room bookings and restaurant reservations</p>

          <Tabs defaultValue="rooms" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rooms" className="gap-2">
                <Hotel className="h-4 w-4" />
                Rooms ({roomBookings.length})
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Restaurant ({tableReservations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="mt-6">
              {roomBookings.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center p-12 text-center">
                    <Hotel className="h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">No room bookings yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Browse our rooms and book your stay</p>
                    <Button className="mt-4" onClick={() => router.push("/rooms")}>
                      Browse Rooms
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {roomBookings.map((booking) => (
                    <Card key={booking.id} className="border-border bg-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="font-serif text-lg text-card-foreground">
                            {booking.roomName}
                          </CardTitle>
                          {statusBadge(booking.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Check-in</p>
                              <p className="font-medium text-foreground">{booking.checkIn}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Check-out</p>
                              <p className="font-medium text-foreground">{booking.checkOut}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Guests</p>
                              <p className="font-medium text-foreground">{booking.guests}</p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-serif text-lg font-bold text-primary">{'\u20B9'}{booking.totalPrice?.toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                        {booking.specialRequests && (
                          <>
                            <Separator className="my-3" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Note:</span> {booking.specialRequests}
                            </p>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <Separator className="my-3" />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent">
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Cancel Booking
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently cancel your room booking for {booking.roomName}. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelRoomBooking(booking.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="restaurant" className="mt-6">
              {tableReservations.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center p-12 text-center">
                    <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">No reservations yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Reserve a table at our restaurant</p>
                    <Button className="mt-4" onClick={() => router.push("/restaurant")}>
                      Reserve a Table
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {tableReservations.map((reservation) => (
                    <Card key={reservation.id} className="border-border bg-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="font-serif text-lg text-card-foreground">
                            {reservation.tableName}
                          </CardTitle>
                          {statusBadge(reservation.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Date</p>
                              <p className="font-medium text-foreground">{reservation.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Time</p>
                              <p className="font-medium text-foreground">{reservation.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Duration</p>
                              <p className="font-medium text-foreground">{reservation.duration || "1 hour"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Guests</p>
                              <p className="font-medium text-foreground">{reservation.guests}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs">Area ({reservation.tableSeats || "-"} seats)</p>
                              <p className="font-medium text-foreground">{reservation.tableLocation}</p>
                            </div>
                          </div>
                        </div>
                        {reservation.specialRequests && (
                          <>
                            <Separator className="my-3" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Note:</span> {reservation.specialRequests}
                            </p>
                          </>
                        )}
                        {reservation.status === "confirmed" && (
                          <>
                            <Separator className="my-3" />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent">
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Cancel Reservation
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel this reservation?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently cancel your table reservation at {reservation.tableLocation} area. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelTableReservation(reservation.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
