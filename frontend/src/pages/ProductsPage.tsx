import { useEffect, useState } from 'react'
import { Search, Plus, Package, X } from 'lucide-react'
import { productsApi } from '../services/api'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const addToCart = useStore((s) => s.addToCart)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    try {
      const res = await productsApi.list({ limit: 100 })
      setProducts(res.data.data || res.data || [])
    } catch { /* */ } finally { setLoading(false) }
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  )

  const handleAddToCart = (product: any) => {
    const variant = product.variants?.[0]
    if (!variant) return toast.error('No variant available')
    addToCart({
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku || product.sku,
      quantity: 1,
      unitPrice: Number(variant.sellingPrice || product.sellingPrice || 0),
      total: Number(variant.sellingPrice || product.sellingPrice || 0),
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{filtered.length} items</span>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Product
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, or barcode..."
          className="w-full pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="card hover:border-forest-400 transition-colors cursor-pointer" onClick={() => handleAddToCart(product)}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-forest-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-xs text-slate-500">{product.sku || product.barcode}</p>
                  {product.category && <p className="text-xs text-forest-600">{product.category.name}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-forest-600">
                    KES {Number(product.sellingPrice || product.variants?.[0]?.sellingPrice || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    Stock: {product.variants?.[0]?.currentStock ?? 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">No products found</div>
          )}
        </div>
      )}

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); loadProducts() }} />}
    </div>
  )
}

function AddProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    sku: '', name: '', categoryId: '', barcode: '', price: '', costPrice: '', stock: '', reorderLevel: '10',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.sku || !form.name) return toast.error('SKU and Name are required')

    setLoading(true)
    try {
      const productRes = await productsApi.create({
        sku: form.sku,
        name: form.name,
        categoryId: form.categoryId || undefined,
      })
      const product = productRes.data

      if (form.barcode || form.price) {
        await productsApi.create(product.id).catch(() => {})
        await fetch(`http://localhost:3001/api/products/${product.id}/variants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            barcode: form.barcode || undefined,
            price: Number(form.price) || 0,
            costPrice: Number(form.costPrice) || 0,
            stockQuantity: Number(form.stock) || 0,
            reorderLevel: Number(form.reorderLevel) || 10,
          }),
        })
      }

      toast.success('Product added!')
      onSaved()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Add New Product</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">SKU *</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="MILK-001" className="w-full" required />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Fresh Milk 500ml" className="w-full" required />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Barcode</label>
                <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="6161100100011" className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Selling Price (KES)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="85" className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Cost Price (KES)</label>
                <input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="60" className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Initial Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Reorder Level</label>
                <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} placeholder="10" className="w-full" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Add Product'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
