"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface Room {
  id: string
  name: string
  description: string
  price: number
  capacity: number
  image: string
  amenities: string[]
}

export function RoomCard({ room }: { room: Room }) {
  return (
    <Card className="group overflow-hidden border-border bg-card transition-shadow hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.image || "/placeholder.svg"}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <Badge className="bg-primary text-primary-foreground">
            ${room.price}/night
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-serif text-xl font-semibold text-card-foreground">{room.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{room.description}</p>
        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Up to {room.capacity} guests</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities.slice(0, 3).map((a) => (
            <Badge key={a} variant="secondary" className="text-xs font-normal">
              {a}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{room.amenities.length - 3} more
            </Badge>
          )}
        </div>
        <Button className="mt-5 w-full" asChild>
          <Link href={`/rooms/${room.id}`}>View & Book</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
