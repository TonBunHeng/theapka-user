import { create } from 'zustand'

const storedToken = typeof window !== 'undefined' ? localStorage.getItem('theapka_token') : null
const storedUser = typeof window !== 'undefined' ? localStorage.getItem('theapka_user') : null
const storedWedding = typeof window !== 'undefined' ? localStorage.getItem('theapka_wedding') : null

export const useAuthStore = create((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  wedding: storedWedding ? JSON.parse(storedWedding) : null,
  isAuthenticated: !!storedToken,

  login: ({ user, token, wedding }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theapka_token', token)
      localStorage.setItem('theapka_user', JSON.stringify(user))
      if (wedding) {
        localStorage.setItem('theapka_wedding', JSON.stringify(wedding))
      } else {
        localStorage.removeItem('theapka_wedding')
      }
    }
    set({
      token,
      user,
      wedding: wedding || null,
      isAuthenticated: true,
    })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theapka_token')
      localStorage.removeItem('theapka_user')
      localStorage.removeItem('theapka_wedding')
    }
    set({
      token: null,
      user: null,
      wedding: null,
      isAuthenticated: false,
    })
  },

  setWedding: (wedding) => {
    if (typeof window !== 'undefined') {
      if (wedding) {
        localStorage.setItem('theapka_wedding', JSON.stringify(wedding))
      } else {
        localStorage.removeItem('theapka_wedding')
      }
    }
    set({ wedding })
  },

  updateUser: (userData) => {
    set((state) => {
      const updated = { ...state.user, ...userData }
      if (typeof window !== 'undefined') {
        localStorage.setItem('theapka_user', JSON.stringify(updated))
      }
      return { user: updated }
    })
  },
}))

export default useAuthStore
