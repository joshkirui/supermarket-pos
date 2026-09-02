import { ShoppingCart, Bell } from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function Header() {
  const toggleCart = useStore((s) => s.toggleCart)
  const cartCount = useStore((s) => s.getCartCount())

  return (
    <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm text-slate-500">
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-forest-500 rounded-full"></span>
        </button>
        <button
          onClick={toggleCart}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-forest-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
