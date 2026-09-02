import { useEffect, useState, useRef, useCallback } from 'react'
import { ScanBarcode, Minus, Plus, Trash2 } from 'lucide-react'
import { productsApi, salesApi } from '../services/api'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'

export default function PosTerminal() {
  const barcodeRef = useRef<HTMLInputElement>(null)
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal } = useStore()
  const [scanning, setScanning] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [lastScanned, setLastScanned] = useState<any>(null)
  const { subtotal, tax, total } = getCartTotal()

  useEffect(() => {
    barcodeRef.current?.focus()
  }, [cart])

  const handleBarcodeScan = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const value = barcode.trim()
    if (!value) return

    setScanning(true)
    try {
      const res = await productsApi.scan(value)
      const product = res.data
      if (!product || !product.variants?.length) {
        toast.error(`No product found: ${value}`)
        setBarcode('')
        return
      }
      const variant = product.variants[0]
      addToCart({
        variantId: variant.id,
        productName: product.name,
        sku: variant.sku || value,
        quantity: 1,
        unitPrice: Number(variant.sellingPrice || 0),
        total: Number(variant.sellingPrice || 0),
      })
      setLastScanned(product)
      toast.success(`${product.name} added`)
      setBarcode('')
    } catch {
      toast.error(`Barcode not found: ${value}`)
      setBarcode('')
    } finally {
      setScanning(false)
      barcodeRef.current?.focus()
    }
  }, [barcode, addToCart])

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty')
    setScanning(true)
    try {
      await salesApi.create({
        items: cart.map((i) => ({ variantId: i.variantId, quantity: i.quantity, unitPrice: i.unitPrice })),
        paymentMethod: 'CASH',
        payments: [{ method: 'CASH', amount: total }],
      })
      toast.success(`Sale completed — KES ${total.toLocaleString()}`)
      clearCart()
      setLastScanned(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sale failed')
    } finally {
      setScanning(false)
      barcodeRef.current?.focus()
    }
  }

  return (
    <div className="flex-1 flex gap-4 min-h-0">
      <div className="flex-1 flex flex-col gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-forest-600">
              <ScanBarcode className="w-6 h-6" />
              <span className="text-sm font-medium whitespace-nowrap">Scan Barcode</span>
            </div>
            <input
              ref={barcodeRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleBarcodeScan}
              placeholder={scanning ? 'Scanning...' : 'Point scanner here or type barcode + Enter'}
              className="flex-1 text-lg font-mono py-3 px-4"
              autoFocus
              disabled={scanning}
            />
            {lastScanned && (
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-slate-900">{lastScanned.name}</p>
                <p className="text-xs text-forest-600">KES {Number(lastScanned.variants?.[0]?.sellingPrice || 0).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 card overflow-auto p-0">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-slate-500 text-left">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium text-center">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                  <ScanBarcode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Scan a barcode to add items</p>
                </td></tr>
              ) : cart.map((item) => (
                <tr key={item.variantId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium">{item.productName}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.sku}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)} className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="text-sm font-mono w-8 text-center text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)} className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">KES {item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-forest-600 font-medium">KES {item.total.toLocaleString()}</td>
                  <td className="px-2">
                    <button onClick={() => removeFromCart(item.variantId)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-80 card flex flex-col">
        <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm flex-1">
          <div className="flex justify-between text-slate-500">
            <span>Items</span><span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span><span className="font-mono">KES {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>VAT 16%</span><span className="font-mono">KES {tax.toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-bold text-lg">
            <span>Total</span><span className="font-mono">KES {total.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={handleCheckout} disabled={scanning || cart.length === 0} className="w-full btn-primary py-3 text-lg mt-4 disabled:opacity-50">
          {scanning ? 'Processing...' : 'Complete Sale'}
        </button>
        <button onClick={clearCart} disabled={cart.length === 0} className="w-full btn-danger text-sm mt-2 disabled:opacity-50">
          Clear Cart
        </button>
      </div>
    </div>
  )
}
