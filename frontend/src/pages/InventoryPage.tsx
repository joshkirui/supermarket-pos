import { useEffect, useState } from 'react'
import { Search, AlertTriangle, ArrowLeftRight, Plus, Minus, X } from 'lucide-react'
import { inventoryApi, productsApi } from '../services/api'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'stock' | 'low'>('stock')
  const [showAdjust, setShowAdjust] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

  useEffect(() => { loadInventory() }, [])
  useEffect(() => {
    productsApi.list({ limit: 100 }).then((r) => setProducts(r.data.data || r.data || [])).catch(() => {})
  }, [])

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
        <button onClick={() => setShowAdjust(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />Adjust Stock
        </button>
        <button onClick={() => setShowTransfer(true)} className="btn-secondary flex items-center gap-2">
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

      {showAdjust && <AdjustStockModal products={products} onClose={() => setShowAdjust(false)} onSaved={() => { setShowAdjust(false); loadInventory() }} />}
      {showTransfer && <TransferModal products={products} onClose={() => setShowTransfer(false)} onSaved={() => { setShowTransfer(false); loadInventory() }} />}
    </>
  )
}

function AdjustStockModal({ products, onClose, onSaved }: { products: any[]; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ variantId: '', type: 'RESTOCK', quantity: '', reason: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.variantId || !form.quantity) return toast.error('Select product and quantity')
    setLoading(true)
    try {
      await inventoryApi.adjust({
        variantId: form.variantId,
        type: form.type,
        quantity: Number(form.quantity),
        reason: form.reason || 'Manual adjustment',
      })
      toast.success('Stock adjusted!')
      onSaved()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock')
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Adjust Stock</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Product</label>
              <select value={form.variantId} onChange={(e) => setForm({ ...form, variantId: e.target.value })} className="w-full">
                <option value="">Select product...</option>
                {products.map((p) => p.variants?.map((v: any) => (
                  <option key={v.id} value={v.id}>{p.name} ({v.sku || v.barcode})</option>
                )))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full">
                  <option value="RESTOCK">Restock</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="DAMAGE">Damage</option>
                  <option value="RETURN">Return</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="10" className="w-full" min="1" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Reason</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Supplier delivery, count correction..." className="w-full" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Adjust'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function TransferModal({ products, onClose, onSaved }: { products: any[]; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ variantId: '', quantity: '', fromTerminal: 'terminal-1', toTerminal: 'terminal-2', reason: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.variantId || !form.quantity) return toast.error('Select product and quantity')
    setLoading(true)
    try {
      await inventoryApi.transfer({
        variantId: form.variantId,
        quantity: Number(form.quantity),
        fromTerminalId: form.fromTerminal,
        toTerminalId: form.toTerminal,
        reason: form.reason || 'Transfer',
      })
      toast.success('Stock transferred!')
      onSaved()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to transfer stock')
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Transfer Stock</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Product</label>
              <select value={form.variantId} onChange={(e) => setForm({ ...form, variantId: e.target.value })} className="w-full">
                <option value="">Select product...</option>
                {products.map((p) => p.variants?.map((v: any) => (
                  <option key={v.id} value={v.id}>{p.name} ({v.sku || v.barcode})</option>
                )))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="10" className="w-full" min="1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">From Terminal</label>
                <input value={form.fromTerminal} onChange={(e) => setForm({ ...form, fromTerminal: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">To Terminal</label>
                <input value={form.toTerminal} onChange={(e) => setForm({ ...form, toTerminal: e.target.value })} className="w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Reason</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Inter-branch transfer..." className="w-full" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Transfer'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
