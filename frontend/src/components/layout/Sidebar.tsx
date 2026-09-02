import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Package,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { useStore } from '../../store/useStore'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: ShoppingBag, label: 'Products' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/cash', icon: Wallet, label: 'Cash' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const logout = useStore((s) => s.logout)
  const user = useStore((s) => s.user)

  return (
    <aside className="w-64 bg-pos-sidebar flex flex-col">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-600 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">POS</h1>
            <p className="text-xs text-slate-400">Supermarket</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-forest-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <link.icon className="w-4.5 h-4.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm font-medium text-white">{user?.username}</p>
          <p className="text-xs text-forest-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
