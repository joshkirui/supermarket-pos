import { useEffect, useState } from 'react'
import { Search, Plus, Package } from 'lucide-react'
import { productsApi } from '../services/api'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
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
        <span className="text-sm text-slate-500">{filtered.length} items</span>
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
    </div>
  )
}
