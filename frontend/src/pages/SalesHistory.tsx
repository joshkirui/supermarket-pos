import { useEffect, useState } from 'react'
import { Search, Receipt } from 'lucide-react'
import { salesApi } from '../services/api'

export default function SalesHistory() {
  const [sales, setSales] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSales() }, [])

  const loadSales = async () => {
    try {
      const res = await salesApi.list({ limit: 50 })
      setSales(res.data.data || res.data || [])
    } catch { /* */ } finally { setLoading(false) }
  }

  const filtered = sales.filter((s) =>
    s.saleNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by sale number..." className="w-full pl-10" />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left">
              <th className="px-4 py-3 font-medium">Sale #</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Cashier</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No sales found</p>
              </td></tr>
            ) : filtered.map((sale) => (
              <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-slate-900">{sale.saleNumber}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(sale.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500">{sale.cashier?.username || '-'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-forest-600">{sale.paymentMethod}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-forest-600">KES {Number(sale.totalAmount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
