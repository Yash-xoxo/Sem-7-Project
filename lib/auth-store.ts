import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "./types"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  users: Record<string, { user: User; password: string }>
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: {},

      login: (email: string, password: string) => {
        const { users } = get()
        const userData = users[email.toLowerCase()]

        if (userData && userData.password === password) {
          set({ user: userData.user, isAuthenticated: true })
          return true
        }

        // Demo account login
        if (email.toLowerCase() === "demo@wealthwiz.com" && password === "demo123") {
          const demoUser: User = {
            id: "demo-user",
            email: "demo@wealthwiz.com",
            name: "Demo User",
            createdAt: new Date(),
          }
          set({ user: demoUser, isAuthenticated: true })
          return true
        }
        return false
      },

      register: (name: string, email: string, password: string) => {
        const { users } = get()
        const emailLower = email.toLowerCase()

        if (users[emailLower]) {
          return false // User already exists
        }

        const newUser: User = {
          id: Date.now().toString(),
          email: emailLower,
          name,
          createdAt: new Date(),
        }

        set({
          users: { ...users, [emailLower]: { user: newUser, password } },
          user: newUser,
          isAuthenticated: true,
        })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "wealth-wiz-auth",
    },
  ),
)
