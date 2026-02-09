"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: "user" | "admin"
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user)
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
              setUserData(userDoc.data() as UserData)
            }
          } catch (err) {
            console.error("Error fetching user data:", err)
          }
        } else {
          setUserData(null)
        }
        setLoading(false)
      })
      return () => unsubscribe()
    } catch (err) {
      console.error("Auth state listener error:", err)
      setLoading(false)
      return () => {}
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    try {
      const userDoc = await getDoc(doc(db, "users", result.user.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData)
      } else {
        // User exists in Auth but not in Firestore - create the doc
        const newUserData: UserData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: "user",
        }
        await setDoc(doc(db, "users", result.user.uid), newUserData)
        setUserData(newUserData)
      }
    } catch (err) {
      console.error("Error fetching user doc on sign in:", err)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    const newUserData: UserData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: name,
      role: "user",
    }
    await setDoc(doc(db, "users", result.user.uid), newUserData)
    setUserData(newUserData)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserData(null)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
