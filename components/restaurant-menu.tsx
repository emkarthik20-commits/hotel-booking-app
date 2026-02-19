"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Leaf, Drumstick } from "lucide-react"

type MenuItem = {
  name: string
  description: string
  price: number
  isVeg: boolean
}

type MenuCategory = {
  category: string
  items: MenuItem[]
}

const northIndianMenu: MenuCategory[] = [
  {
    category: "Starters",
    items: [
      { name: "Paneer Tikka", description: "Marinated cottage cheese grilled in tandoor with spices", price: 280, isVeg: true },
      { name: "Hara Bhara Kebab", description: "Spinach and green pea patties, lightly spiced and pan-fried", price: 220, isVeg: true },
      { name: "Chicken Malai Tikka", description: "Creamy marinated chicken pieces grilled to perfection", price: 340, isVeg: false },
      { name: "Mutton Seekh Kebab", description: "Minced mutton skewers with aromatic spices", price: 380, isVeg: false },
      { name: "Amritsari Fish Fry", description: "Crispy batter-fried fish fillets with ajwain and spices", price: 360, isVeg: false },
      { name: "Dahi Ke Kebab", description: "Soft hung curd kebabs with mild spices", price: 240, isVeg: true },
    ],
  },
  {
    category: "Main Course",
    items: [
      { name: "Dal Makhani", description: "Slow-cooked black lentils in rich buttery tomato gravy", price: 260, isVeg: true },
      { name: "Shahi Paneer", description: "Cottage cheese in creamy cashew and tomato gravy", price: 300, isVeg: true },
      { name: "Butter Chicken", description: "Tandoori chicken in velvety tomato-butter sauce", price: 360, isVeg: false },
      { name: "Mutton Rogan Josh", description: "Kashmiri-style mutton curry with aromatic spices", price: 420, isVeg: false },
      { name: "Palak Paneer", description: "Cottage cheese cubes in creamy spinach gravy", price: 280, isVeg: true },
      { name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken", price: 340, isVeg: false },
      { name: "Veg Biryani", description: "Aromatic basmati rice with seasonal vegetables and saffron", price: 260, isVeg: true },
      { name: "Rajma Masala", description: "Kidney beans in thick onion-tomato gravy, Punjabi style", price: 220, isVeg: true },
      { name: "Kadai Chicken", description: "Chicken cooked with bell peppers in kadai masala", price: 340, isVeg: false },
    ],
  },
  {
    category: "Breads",
    items: [
      { name: "Butter Naan", description: "Soft leavened bread brushed with butter", price: 60, isVeg: true },
      { name: "Garlic Naan", description: "Naan topped with garlic and fresh coriander", price: 70, isVeg: true },
      { name: "Laccha Paratha", description: "Flaky layered whole wheat bread", price: 60, isVeg: true },
      { name: "Stuffed Kulcha", description: "Naan stuffed with spiced potato or paneer filling", price: 80, isVeg: true },
      { name: "Tandoori Roti", description: "Whole wheat bread baked in clay oven", price: 40, isVeg: true },
    ],
  },
]

const southIndianMenu: MenuCategory[] = [
  {
    category: "Starters",
    items: [
      { name: "Medu Vada", description: "Crispy urad dal doughnuts served with sambar and chutney", price: 160, isVeg: true },
      { name: "Chicken 65", description: "Spicy deep-fried chicken with curry leaves and chilies", price: 320, isVeg: false },
      { name: "Gobi 65", description: "Crispy fried cauliflower tossed in spicy masala", price: 220, isVeg: true },
      { name: "Prawns Fry", description: "Kerala-style spiced prawns, shallow fried", price: 380, isVeg: false },
    ],
  },
  {
    category: "Dosa & Tiffin",
    items: [
      { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling", price: 180, isVeg: true },
      { name: "Mysore Masala Dosa", description: "Dosa with red chutney spread and potato filling", price: 200, isVeg: true },
      { name: "Rava Dosa", description: "Crispy semolina crepe with onions and cashews", price: 190, isVeg: true },
      { name: "Set Dosa", description: "Soft spongy dosa served in a set of three", price: 160, isVeg: true },
      { name: "Idli Sambar", description: "Steamed rice cakes with lentil soup and chutneys", price: 140, isVeg: true },
      { name: "Uttapam", description: "Thick rice pancake topped with onion, tomato and chilies", price: 170, isVeg: true },
    ],
  },
  {
    category: "Main Course",
    items: [
      { name: "Chettinad Chicken Curry", description: "Fiery chicken curry with freshly ground spices", price: 380, isVeg: false },
      { name: "Kerala Fish Curry", description: "Tangy coconut-based fish curry with kokum", price: 360, isVeg: false },
      { name: "Sambar Rice", description: "Steamed rice with aromatic lentil and vegetable stew", price: 200, isVeg: true },
      { name: "Hyderabadi Mutton Biryani", description: "Dum-cooked biryani with tender mutton and saffron rice", price: 420, isVeg: false },
      { name: "Avial", description: "Mixed vegetables in coconut and yogurt gravy", price: 240, isVeg: true },
      { name: "Egg Roast", description: "Kerala-style boiled eggs in spicy onion-tomato masala", price: 220, isVeg: false },
      { name: "Rasam Rice", description: "Steamed rice with tangy pepper-tomato rasam", price: 180, isVeg: true },
    ],
  },
  {
    category: "Breads & Rice",
    items: [
      { name: "Appam", description: "Lacy rice pancake with soft center, served with stew", price: 120, isVeg: true },
      { name: "Parotta", description: "Flaky layered Kerala-style flatbread", price: 60, isVeg: true },
      { name: "Lemon Rice", description: "Tangy rice with peanuts, curry leaves and mustard", price: 160, isVeg: true },
      { name: "Coconut Rice", description: "Rice tempered with coconut, cashews and spices", price: 170, isVeg: true },
    ],
  },
]

const desserts: MenuItem[] = [
  { name: "Gulab Jamun", description: "Soft milk dumplings soaked in rose-flavored sugar syrup", price: 120, isVeg: true },
  { name: "Rasmalai", description: "Soft cottage cheese patties in saffron-cardamom milk", price: 150, isVeg: true },
  { name: "Payasam", description: "Traditional South Indian vermicelli kheer with cardamom", price: 130, isVeg: true },
  { name: "Gajar Ka Halwa", description: "Warm carrot pudding with khoya, nuts and saffron", price: 160, isVeg: true },
  { name: "Double Ka Meetha", description: "Hyderabadi bread pudding with condensed milk and nuts", price: 140, isVeg: true },
  { name: "Kulfi", description: "Traditional Indian frozen dessert with pistachios", price: 120, isVeg: true },
]

const beverages: MenuItem[] = [
  { name: "Masala Chai", description: "Spiced Indian tea with ginger and cardamom", price: 60, isVeg: true },
  { name: "Filter Coffee", description: "Strong South Indian filter coffee with frothy milk", price: 80, isVeg: true },
  { name: "Mango Lassi", description: "Chilled yogurt smoothie with Alphonso mango", price: 120, isVeg: true },
  { name: "Sweet Lassi", description: "Traditional chilled sweetened yogurt drink", price: 90, isVeg: true },
  { name: "Buttermilk", description: "Spiced churned yogurt with curry leaves and cumin", price: 70, isVeg: true },
  { name: "Fresh Lime Soda", description: "Refreshing lime juice with soda, sweet or salted", price: 80, isVeg: true },
  { name: "Jaljeera", description: "Tangy cumin-mint cooler, a classic Indian refresher", price: 80, isVeg: true },
]

type Tab = "north" | "south" | "desserts" | "beverages"

export function RestaurantMenu() {
  const [activeTab, setActiveTab] = useState<Tab>("north")

  const tabs: { id: Tab; label: string }[] = [
    { id: "north", label: "North Indian" },
    { id: "south", label: "South Indian" },
    { id: "desserts", label: "Desserts" },
    { id: "beverages", label: "Beverages" },
  ]

  const renderMenuItems = (items: MenuItem[]) => (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.name}
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

  const renderCategoryMenu = (categories: MenuCategory[]) => (
    <div className="flex flex-col gap-8">
      {categories.map((cat) => (
        <div key={cat.category}>
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-lg font-bold text-foreground">{cat.category}</h3>
            <Separator className="flex-1" />
          </div>
          <div className="mt-4">
            {renderMenuItems(cat.items)}
          </div>
        </div>
      ))}
    </div>
  )

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

        {/* Veg/Non-veg legend */}
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
          {activeTab === "north" && renderCategoryMenu(northIndianMenu)}
          {activeTab === "south" && renderCategoryMenu(southIndianMenu)}
          {activeTab === "desserts" && (
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-lg font-bold text-foreground">Desserts</h3>
                <Separator className="flex-1" />
              </div>
              <div className="mt-4">{renderMenuItems(desserts)}</div>
            </div>
          )}
          {activeTab === "beverages" && (
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-lg font-bold text-foreground">Beverages</h3>
                <Separator className="flex-1" />
              </div>
              <div className="mt-4">{renderMenuItems(beverages)}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
