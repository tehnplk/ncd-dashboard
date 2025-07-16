'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  username: string | null
  login: (username: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in on component mount
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const storedUsername = localStorage.getItem('username')
    
    if (loggedIn && storedUsername) {
      setIsLoggedIn(true)
      setUsername(storedUsername)
    }
  }, [])

  const login = (username: string) => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', username)
    setIsLoggedIn(true)
    setUsername(username)
  }

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    setIsLoggedIn(false)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}