"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Hotel,
  UtensilsCrossed,
  Loader2,
  Trash2,
  LayoutDashboard,
  Users,
  CalendarCheck,
  DollarSign,
} from "lucide-react"
import { toast } from "sonner"

interface RoomBooking {
  id: string
  userName: string
  userEmail: string
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
  userName: string
  userEmail: string
  tableName: string
  tableLocation: string
  date: string
  time: string
  guests: number
  status: string
  specialRequests: string
}

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([])
  const [tableReservations, setTableReservations] = useState<TableReservation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const roomQuery = query(collection(db, "roomBookings"), orderBy("createdAt", "desc"))
      const roomSnap = await getDocs(roomQuery)
      setRoomBookings(roomSnap.docs.map((d) => ({ id: d.id, ...d.data() } as RoomBooking)))

      const tableQuery = query(collection(db, "tableReservations"), orderBy("createdAt", "desc"))
      const tableSnap = await getDocs(tableQuery)
      setTableReservations(tableSnap.docs.map((d) => ({ id: d.id, ...d.data() } as TableReservation)))
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user || userData?.role !== "admin") {
      router.push("/")
      return
    }
    fetchData()
  }, [user, userData, authLoading, router, fetchData])

  const updateRoomStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "roomBookings", id), { status })
      setRoomBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
      toast.success(`Booking ${status}`)
    } catch {
      toast.error("Failed to update status")
    }
  }

  const updateTableStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "tableReservations", id), { status })
      setTableReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(`Reservation ${status}`)
    } catch {
      toast.error("Failed to update status")
    }
  }

  const deleteRoomBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, "roomBookings", id))
      setRoomBookings((prev) => prev.filter((b) => b.id !== id))
      toast.success("Booking deleted")
    } catch {
      toast.error("Failed to delete booking")
    }
  }

  const deleteTableReservation = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tableReservations", id))
      setTableReservations((prev) => prev.filter((r) => r.id !== id))
      toast.success("Reservation deleted")
    } catch {
      toast.error("Failed to delete reservation")
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      "no-show": "bg-amber-100 text-amber-800",
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

  if (userData?.role !== "admin") {
    return null
  }

  const activeRoomBookings = roomBookings.filter((b) => b.status === "confirmed")
  const totalRevenue = roomBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const totalGuests = roomBookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.guests, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage all bookings and reservations</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Hotel className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Room Bookings</p>
                  <p className="font-serif text-2xl font-bold text-foreground">{activeRoomBookings.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Table Reservations</p>
                  <p className="font-serif text-2xl font-bold text-foreground">
                    {tableReservations.filter((r) => r.status === "confirmed").length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Guests</p>
                  <p className="font-serif text-2xl font-bold text-foreground">{totalGuests}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="font-serif text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking tables */}
          <Tabs defaultValue="rooms" className="mt-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="rooms" className="gap-2">
                <Hotel className="h-4 w-4" />
                Room Bookings
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Table Reservations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="mt-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-serif">
                    <span className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                      All Room Bookings ({roomBookings.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roomBookings.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No room bookings yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {roomBookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-foreground">{booking.userName}</p>
                                  <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{booking.roomName}</TableCell>
                              <TableCell>{booking.checkIn}</TableCell>
                              <TableCell>{booking.checkOut}</TableCell>
                              <TableCell>{booking.guests}</TableCell>
                              <TableCell className="font-semibold text-primary">
                                ${booking.totalPrice}
                              </TableCell>
                              <TableCell>{statusBadge(booking.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={booking.status}
                                    onValueChange={(value) => updateRoomStatus(booking.id, value)}
                                  >
                                    <SelectTrigger className="h-8 w-[120px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                      <SelectItem value="no-show">No Show</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete booking</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete booking?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Permanently delete {booking.userName}&apos;s booking for {booking.roomName}?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteRoomBooking(booking.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="restaurant" className="mt-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-serif">
                    <span className="flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                      All Table Reservations ({tableReservations.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tableReservations.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No table reservations yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Table</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableReservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-foreground">{reservation.userName}</p>
                                  <p className="text-xs text-muted-foreground">{reservation.userEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{reservation.tableName}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{reservation.tableLocation}</Badge>
                              </TableCell>
                              <TableCell>{reservation.date}</TableCell>
                              <TableCell>{reservation.time}</TableCell>
                              <TableCell>{reservation.guests}</TableCell>
                              <TableCell>{statusBadge(reservation.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={reservation.status}
                                    onValueChange={(value) => updateTableStatus(reservation.id, value)}
                                  >
                                    <SelectTrigger className="h-8 w-[120px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                      <SelectItem value="no-show">No Show</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete reservation</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete reservation?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Permanently delete {reservation.userName}&apos;s reservation for {reservation.tableName}?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteTableReservation(reservation.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
