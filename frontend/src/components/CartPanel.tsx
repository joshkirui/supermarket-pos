import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function CartPanel() {
  const cartOpen = useStore((s) => s.cartOpen)
  const toggleCart = useStore((s) => s.toggleCart)
  const { cart, removeFromCart, updateCartQuantity, clearCart, getCartTotal } = useStore()
  const { subtotal, tax, total } = getCartTotal()

  if (!cartOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={toggleCart} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Cart ({cart.length})</h2>
          <button onClick={toggleCart} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-slate-400 text-center mt-8">No items in cart</p>
          ) : cart.map((item) => (
            <div key={item.variantId} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{item.productName}</p>
                  <p className="text-xs text-slate-500">{item.sku}</p>
                </div>
                <button onClick={() => removeFromCart(item.variantId)} className="p-1 text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)} className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-mono w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)} className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-mono text-forest-600">KES {item.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span><span className="font-mono">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>VAT (16%)</span><span className="font-mono">KES {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span><span className="font-mono">KES {total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
