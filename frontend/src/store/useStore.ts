import { create } from 'zustand'
import { authApi } from '../services/api'

interface User {
  id: string
  username: string
  role: string
  branchId?: string
}

interface CartItem {
  variantId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
}

interface AppState {
  user: User | null
  token: string | null
  cart: CartItem[]
  cartOpen: boolean
  login: (username: string, pin: string) => Promise<void>
  logout: () => void
  addToCart: (item: CartItem) => void
  removeFromCart: (variantId: string) => void
  updateCartQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getCartTotal: () => { subtotal: number; tax: number; total: number }
  getCartCount: () => number
}

export const useStore = create<AppState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  cart: [],
  cartOpen: false,

  login: async (username: string, pin: string) => {
    const res = await authApi.login({ username, pin })
    const { accessToken, user } = res.data
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token: accessToken })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, cart: [] })
  },

  addToCart: (item) => {
    const cart = get().cart
    const existing = cart.find((i) => i.variantId === item.variantId)
    if (existing) {
      set({
        cart: cart.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.unitPrice }
            : i
        ),
      })
    } else {
      set({ cart: [...cart, item] })
    }
  },

  removeFromCart: (variantId) => {
    set({ cart: get().cart.filter((i) => i.variantId !== variantId) })
  },

  updateCartQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(variantId)
      return
    }
    set({
      cart: get().cart.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity, total: quantity * i.unitPrice }
          : i
      ),
    })
  },

  clearCart: () => set({ cart: [] }),
  toggleCart: () => set({ cartOpen: !get().cartOpen }),

  getCartTotal: () => {
    const cart = get().cart
    const subtotal = cart.reduce((sum, i) => sum + i.total, 0)
    const tax = Math.round(subtotal * 0.16 * 100) / 100
    return { subtotal, tax, total: subtotal + tax }
  },

  getCartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),
}))
