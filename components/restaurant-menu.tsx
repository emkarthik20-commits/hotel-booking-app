"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Leaf, Drumstick, Loader2 } from "lucide-react"
import { type MenuItem, getMenuItems, seedMenuToFirestore } from "@/lib/menu-data"

type Tab = "north" | "south" | "desserts" | "beverages"

export function RestaurantMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("north")

  useEffect(() => {
    async function load() {
      await seedMenuToFirestore()
      const items = await getMenuItems()
      setMenuItems(items)
      setLoading(false)
    }
    load()
  }, [])

  const tabs: { id: Tab; label: string }[] = [
    { id: "north", label: "North Indian" },
    { id: "south", label: "South Indian" },
    { id: "desserts", label: "Desserts" },
    { id: "beverages", label: "Beverages" },
  ]

  const filteredItems = menuItems.filter((item) => item.section === activeTab)

  const categories = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>
  )

  const renderMenuItems = (items: MenuItem[]) => (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id || item.name}
          className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
        >
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {item.isVeg ? (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border-2 border-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                </span>
              ) : (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border-2 border-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-medium text-card-foreground">{item.name}</h4>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <span className="shrink-0 font-serif text-base font-semibold text-primary">
            {"\u20B9"}{item.price}
          </span>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <section className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Curated for you
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
            <span className="text-balance">Our Menu</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Savour the finest flavours from across India, prepared with locally sourced ingredients and traditional recipes.
          </p>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border-2 border-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Leaf className="h-3.5 w-3.5 text-green-600" />
              Vegetarian
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border-2 border-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Drumstick className="h-3.5 w-3.5 text-red-600" />
              Non-Vegetarian
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Menu Content */}
        <div className="mt-8">
          {Object.keys(categories).length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No items in this section yet.</p>
          ) : (
            <div className="flex flex-col gap-8">
              {Object.entries(categories).map(([cat, items]) => (
                <div key={cat}>
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-lg font-bold text-foreground">{cat}</h3>
                    <Separator className="flex-1" />
                  </div>
                  <div className="mt-4">{renderMenuItems(items)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
