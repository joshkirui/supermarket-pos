import { useEffect, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { customersApi } from '../services/api'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCustomers() }, [])

  const loadCustomers = async () => {
    try {
      const res = await customersApi.list({ limit: 100 })
      setCustomers(res.data.data || res.data || [])
    } catch { /* */ } finally { setLoading(false) }
  }

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <span className="text-sm text-slate-500">{filtered.length} customers</span>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone, or email..." className="w-full pl-10" />
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />Add Customer
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium text-right">Loyalty Points</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No customers found</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-900 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-slate-600 font-mono">{c.phone}</td>
                <td className="px-4 py-3 text-slate-500">{c.email || '-'}</td>
                <td className="px-4 py-3 text-right font-mono text-forest-600">{c.loyaltyPoints || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
