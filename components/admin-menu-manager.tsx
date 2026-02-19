"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Leaf,
  Drumstick,
} from "lucide-react"
import { toast } from "sonner"
import {
  type MenuItem,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenuToFirestore,
} from "@/lib/menu-data"

const sections = [
  { value: "north", label: "North Indian" },
  { value: "south", label: "South Indian" },
  { value: "desserts", label: "Desserts" },
  { value: "beverages", label: "Beverages" },
]

const categoryOptions: Record<string, string[]> = {
  north: ["Starters", "Main Course", "Breads"],
  south: ["Starters", "Dosa & Tiffin", "Main Course", "Breads & Rice"],
  desserts: ["Desserts"],
  beverages: ["Beverages"],
}

type FormData = {
  name: string
  description: string
  price: string
  isVeg: boolean
  category: string
  section: "north" | "south" | "desserts" | "beverages"
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  isVeg: true,
  category: "",
  section: "north",
}

export function AdminMenuManager() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSection, setFilterSection] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    await seedMenuToFirestore()
    const data = await getMenuItems()
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filteredItems = items.filter((item) => {
    const matchSection = filterSection === "all" || item.section === filterSection
    const matchSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSection && matchSearch
  })

  const openAddDialog = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      isVeg: item.isVeg,
      category: item.category,
      section: item.section,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.category) {
      toast.error("Please fill in all fields")
      return
    }
    const price = Number.parseFloat(form.price)
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    setSaving(true)
    try {
      const data = {
        name: form.name,
        description: form.description,
        price,
        isVeg: form.isVeg,
        category: form.category,
        section: form.section,
      }

      if (editingItem?.id) {
        await updateMenuItem(editingItem.id, data)
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...data } : i))
        )
        toast.success("Menu item updated")
      } else {
        const newId = await addMenuItem(data)
        setItems((prev) => [...prev, { ...data, id: newId }])
        toast.success("Menu item added")
      }
      setDialogOpen(false)
    } catch {
      toast.error("Failed to save item")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: MenuItem) => {
    if (!item.id) return
    try {
      await deleteMenuItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      toast.success("Menu item deleted")
    } catch {
      toast.error("Failed to delete item")
    }
  }

  const sectionLabel = (s: string) =>
    sections.find((sec) => sec.value === s)?.label || s

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex flex-col gap-4 font-serif sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              Menu Items ({items.length})
            </span>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No menu items found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id || item.name}>
                      <TableCell>
                        {item.isVeg ? (
                          <Leaf className="h-4 w-4 text-green-600" />
                        ) : (
                          <Drumstick className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell className="hidden max-w-[250px] truncate text-muted-foreground md:table-cell">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sectionLabel(item.section)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.category}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {"\u20B9"}{item.price}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(item)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit {item.name}</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete {item.name}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete menu item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Permanently remove &quot;{item.name}&quot; from the menu?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Paneer Tikka"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-desc">Description</Label>
              <Textarea
                id="item-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the dish"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-price">Price (INR)</Label>
                <Input
                  id="item-price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="280"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <Select
                  value={form.isVeg ? "veg" : "nonveg"}
                  onValueChange={(v) => setForm({ ...form, isVeg: v === "veg" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">
                      <span className="flex items-center gap-2">
                        <Leaf className="h-3.5 w-3.5 text-green-600" />
                        Veg
                      </span>
                    </SelectItem>
                    <SelectItem value="nonveg">
                      <span className="flex items-center gap-2">
                        <Drumstick className="h-3.5 w-3.5 text-red-600" />
                        Non-Veg
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Section</Label>
                <Select
                  value={form.section}
                  onValueChange={(v: "north" | "south" | "desserts" | "beverages") => {
                    const cats = categoryOptions[v] || []
                    setForm({ ...form, section: v, category: cats[0] || "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoryOptions[form.section] || []).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
