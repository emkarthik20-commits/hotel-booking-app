import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore"

export type MenuItem = {
  id?: string
  name: string
  description: string
  price: number
  isVeg: boolean
  category: string
  section: "north" | "south" | "desserts" | "beverages"
}

export const defaultMenuItems: MenuItem[] = [
  // North Indian - Starters
  { name: "Paneer Tikka", description: "Marinated cottage cheese grilled in tandoor with spices", price: 280, isVeg: true, category: "Starters", section: "north" },
  { name: "Hara Bhara Kebab", description: "Spinach and green pea patties, lightly spiced and pan-fried", price: 220, isVeg: true, category: "Starters", section: "north" },
  { name: "Chicken Malai Tikka", description: "Creamy marinated chicken pieces grilled to perfection", price: 340, isVeg: false, category: "Starters", section: "north" },
  { name: "Mutton Seekh Kebab", description: "Minced mutton skewers with aromatic spices", price: 380, isVeg: false, category: "Starters", section: "north" },
  { name: "Amritsari Fish Fry", description: "Crispy batter-fried fish fillets with ajwain and spices", price: 360, isVeg: false, category: "Starters", section: "north" },
  { name: "Dahi Ke Kebab", description: "Soft hung curd kebabs with mild spices", price: 240, isVeg: true, category: "Starters", section: "north" },
  // North Indian - Main Course
  { name: "Dal Makhani", description: "Slow-cooked black lentils in rich buttery tomato gravy", price: 260, isVeg: true, category: "Main Course", section: "north" },
  { name: "Shahi Paneer", description: "Cottage cheese in creamy cashew and tomato gravy", price: 300, isVeg: true, category: "Main Course", section: "north" },
  { name: "Butter Chicken", description: "Tandoori chicken in velvety tomato-butter sauce", price: 360, isVeg: false, category: "Main Course", section: "north" },
  { name: "Mutton Rogan Josh", description: "Kashmiri-style mutton curry with aromatic spices", price: 420, isVeg: false, category: "Main Course", section: "north" },
  { name: "Palak Paneer", description: "Cottage cheese cubes in creamy spinach gravy", price: 280, isVeg: true, category: "Main Course", section: "north" },
  { name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken", price: 340, isVeg: false, category: "Main Course", section: "north" },
  { name: "Veg Biryani", description: "Aromatic basmati rice with seasonal vegetables and saffron", price: 260, isVeg: true, category: "Main Course", section: "north" },
  { name: "Rajma Masala", description: "Kidney beans in thick onion-tomato gravy, Punjabi style", price: 220, isVeg: true, category: "Main Course", section: "north" },
  { name: "Kadai Chicken", description: "Chicken cooked with bell peppers in kadai masala", price: 340, isVeg: false, category: "Main Course", section: "north" },
  // North Indian - Breads
  { name: "Butter Naan", description: "Soft leavened bread brushed with butter", price: 60, isVeg: true, category: "Breads", section: "north" },
  { name: "Garlic Naan", description: "Naan topped with garlic and fresh coriander", price: 70, isVeg: true, category: "Breads", section: "north" },
  { name: "Laccha Paratha", description: "Flaky layered whole wheat bread", price: 60, isVeg: true, category: "Breads", section: "north" },
  { name: "Stuffed Kulcha", description: "Naan stuffed with spiced potato or paneer filling", price: 80, isVeg: true, category: "Breads", section: "north" },
  { name: "Tandoori Roti", description: "Whole wheat bread baked in clay oven", price: 40, isVeg: true, category: "Breads", section: "north" },
  // South Indian - Starters
  { name: "Medu Vada", description: "Crispy urad dal doughnuts served with sambar and chutney", price: 160, isVeg: true, category: "Starters", section: "south" },
  { name: "Chicken 65", description: "Spicy deep-fried chicken with curry leaves and chilies", price: 320, isVeg: false, category: "Starters", section: "south" },
  { name: "Gobi 65", description: "Crispy fried cauliflower tossed in spicy masala", price: 220, isVeg: true, category: "Starters", section: "south" },
  { name: "Prawns Fry", description: "Kerala-style spiced prawns, shallow fried", price: 380, isVeg: false, category: "Starters", section: "south" },
  // South Indian - Dosa & Tiffin
  { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling", price: 180, isVeg: true, category: "Dosa & Tiffin", section: "south" },
  { name: "Mysore Masala Dosa", description: "Dosa with red chutney spread and potato filling", price: 200, isVeg: true, category: "Dosa & Tiffin", section: "south" },
  { name: "Rava Dosa", description: "Crispy semolina crepe with onions and cashews", price: 190, isVeg: true, category: "Dosa & Tiffin", section: "south" },
  { name: "Set Dosa", description: "Soft spongy dosa served in a set of three", price: 160, isVeg: true, category: "Dosa & Tiffin", section: "south" },
  { name: "Idli Sambar", description: "Steamed rice cakes with lentil soup and chutneys", price: 140, isVeg: true, category: "Dosa & Tiffin", section: "south" },
  { name: "Uttapam", description: "Thick rice pancake topped with onion, tomato and chilies", price: 170, isVeg: true, category: "Dosa & Tiffin", section: "south" },
  // South Indian - Main Course
  { name: "Chettinad Chicken Curry", description: "Fiery chicken curry with freshly ground spices", price: 380, isVeg: false, category: "Main Course", section: "south" },
  { name: "Kerala Fish Curry", description: "Tangy coconut-based fish curry with kokum", price: 360, isVeg: false, category: "Main Course", section: "south" },
  { name: "Sambar Rice", description: "Steamed rice with aromatic lentil and vegetable stew", price: 200, isVeg: true, category: "Main Course", section: "south" },
  { name: "Hyderabadi Mutton Biryani", description: "Dum-cooked biryani with tender mutton and saffron rice", price: 420, isVeg: false, category: "Main Course", section: "south" },
  { name: "Avial", description: "Mixed vegetables in coconut and yogurt gravy", price: 240, isVeg: true, category: "Main Course", section: "south" },
  { name: "Egg Roast", description: "Kerala-style boiled eggs in spicy onion-tomato masala", price: 220, isVeg: false, category: "Main Course", section: "south" },
  { name: "Rasam Rice", description: "Steamed rice with tangy pepper-tomato rasam", price: 180, isVeg: true, category: "Main Course", section: "south" },
  // South Indian - Breads & Rice
  { name: "Appam", description: "Lacy rice pancake with soft center, served with stew", price: 120, isVeg: true, category: "Breads & Rice", section: "south" },
  { name: "Parotta", description: "Flaky layered Kerala-style flatbread", price: 60, isVeg: true, category: "Breads & Rice", section: "south" },
  { name: "Lemon Rice", description: "Tangy rice with peanuts, curry leaves and mustard", price: 160, isVeg: true, category: "Breads & Rice", section: "south" },
  { name: "Coconut Rice", description: "Rice tempered with coconut, cashews and spices", price: 170, isVeg: true, category: "Breads & Rice", section: "south" },
  // Desserts
  { name: "Gulab Jamun", description: "Soft milk dumplings soaked in rose-flavored sugar syrup", price: 120, isVeg: true, category: "Desserts", section: "desserts" },
  { name: "Rasmalai", description: "Soft cottage cheese patties in saffron-cardamom milk", price: 150, isVeg: true, category: "Desserts", section: "desserts" },
  { name: "Payasam", description: "Traditional South Indian vermicelli kheer with cardamom", price: 130, isVeg: true, category: "Desserts", section: "desserts" },
  { name: "Gajar Ka Halwa", description: "Warm carrot pudding with khoya, nuts and saffron", price: 160, isVeg: true, category: "Desserts", section: "desserts" },
  { name: "Double Ka Meetha", description: "Hyderabadi bread pudding with condensed milk and nuts", price: 140, isVeg: true, category: "Desserts", section: "desserts" },
  { name: "Kulfi", description: "Traditional Indian frozen dessert with pistachios", price: 120, isVeg: true, category: "Desserts", section: "desserts" },
  // Beverages
  { name: "Masala Chai", description: "Spiced Indian tea with ginger and cardamom", price: 60, isVeg: true, category: "Beverages", section: "beverages" },
  { name: "Filter Coffee", description: "Strong South Indian filter coffee with frothy milk", price: 80, isVeg: true, category: "Beverages", section: "beverages" },
  { name: "Mango Lassi", description: "Chilled yogurt smoothie with Alphonso mango", price: 120, isVeg: true, category: "Beverages", section: "beverages" },
  { name: "Sweet Lassi", description: "Traditional chilled sweetened yogurt drink", price: 90, isVeg: true, category: "Beverages", section: "beverages" },
  { name: "Buttermilk", description: "Spiced churned yogurt with curry leaves and cumin", price: 70, isVeg: true, category: "Beverages", section: "beverages" },
  { name: "Fresh Lime Soda", description: "Refreshing lime juice with soda, sweet or salted", price: 80, isVeg: true, category: "Beverages", section: "beverages" },
  { name: "Jaljeera", description: "Tangy cumin-mint cooler, a classic Indian refresher", price: 80, isVeg: true, category: "Beverages", section: "beverages" },
]

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const snap = await getDocs(collection(db, "menuItems"))
    if (snap.empty) return defaultMenuItems
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem))
  } catch {
    return defaultMenuItems
  }
}

export async function seedMenuToFirestore() {
  try {
    const snap = await getDocs(collection(db, "menuItems"))
    if (!snap.empty) return
    for (const item of defaultMenuItems) {
      const docRef = doc(collection(db, "menuItems"))
      await setDoc(docRef, item)
    }
  } catch (err) {
    console.error("Error seeding menu:", err)
  }
}

export async function addMenuItem(item: Omit<MenuItem, "id">) {
  const docRef = doc(collection(db, "menuItems"))
  await setDoc(docRef, item)
  return docRef.id
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>) {
  await updateDoc(doc(db, "menuItems", id), data)
}

export async function deleteMenuItem(id: string) {
  await deleteDoc(doc(db, "menuItems", id))
}
