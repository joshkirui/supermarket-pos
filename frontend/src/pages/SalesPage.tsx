import { useState } from 'react'
import { ScanBarcode, Receipt } from 'lucide-react'
import PosTerminal from './PosTerminal'
import SalesHistory from './SalesHistory'

export default function SalesPage() {
  const [tab, setTab] = useState<'pos' | 'history'>('pos')

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setTab('pos')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'pos' ? 'bg-forest-700 text-white' : 'bg-pos-surface text-pos-muted'}`}>
          <ScanBarcode className="w-4 h-4 inline mr-1" />POS Terminal
        </button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'history' ? 'bg-forest-700 text-white' : 'bg-pos-surface text-pos-muted'}`}>
          <Receipt className="w-4 h-4 inline mr-1" />History
        </button>
      </div>
      <div className="flex-1 min-h-0">
        {tab === 'pos' ? <PosTerminal /> : <SalesHistory />}
      </div>
    </div>
  )
}
