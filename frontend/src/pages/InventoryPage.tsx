import { useEffect, useState } from 'react'
import { Search, AlertTriangle, ArrowLeftRight } from 'lucide-react'
import { inventoryApi } from '../services/api'

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'stock' | 'low'>('stock')

  useEffect(() => { loadInventory() }, [])

  const loadInventory = async () => {
    try {
      if (tab === 'low') {
        const res = await inventoryApi.lowStock()
        setItems(res.data || [])
      } else {
        const res = await inventoryApi.list({ limit: 100 })
        setItems(res.data.data || res.data || [])
      }
    } catch { /* */ } finally { setLoading(false) }
  }

  useEffect(() => { setLoading(true); loadInventory() }, [tab])

  const filtered = items.filter((i) =>
    i.productVariant?.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.productVariant?.sku?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('stock')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'stock' ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            All Stock
          </button>
          <button onClick={() => setTab('low')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'low' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <AlertTriangle className="w-4 h-4 inline mr-1" />Low Stock
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..." className="w-full pl-10" />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4" />Transfer
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium text-right">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Reorder Level</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No items found</td></tr>
            ) : filtered.map((item) => {
              const stock = item.currentStock || 0
              const reorder = item.reorderLevel || 10
              const isLow = stock <= reorder
              return (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900">{item.productVariant?.product?.name || item.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{item.productVariant?.sku || '-'}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-900">{stock}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">{reorder}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${isLow ? 'bg-amber-50 text-amber-600' : 'bg-forest-50 text-forest-600'}`}>
                      {isLow ? 'Low' : 'OK'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
