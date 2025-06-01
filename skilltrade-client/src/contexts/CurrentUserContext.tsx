"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import client from "../../api/client"

interface CurrentUser {
  id: string
  email: string
  profilePicture: string
  fullName: string
  isPremium: boolean
}

interface CurrentUserContextType {
  currentUser: CurrentUser | null
  setCurrentUser: (user: CurrentUser | null) => void
  loading: boolean
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined)

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const axiosInstance = client({ req: {} })
        const { data } = await axiosInstance.get("/api/users/currentuser")
        setCurrentUser(data.currentUser)
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider")
  }
  return context
}
