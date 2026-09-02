import { useState } from 'react'
import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export default function CashPage() {
  const [tab, setTab] = useState<'session' | 'expenses'>('session')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cash Management</h1>

      <div className="flex gap-2">
        <button onClick={() => setTab('session')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'session' ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Wallet className="w-4 h-4 inline mr-1" />Cash Session
        </button>
        <button onClick={() => setTab('expenses')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'expenses' ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          Expenses
        </button>
      </div>

      {tab === 'session' ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Open Session</h3>
            <p className="text-xs text-slate-500 mb-3">Start a new cash session for the terminal</p>
            <label className="block text-xs text-slate-500 mb-1">Opening Amount (KES)</label>
            <input type="number" placeholder="10000" className="w-full mb-3" />
            <button className="btn-primary w-full">Open Session</button>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownCircle className="w-5 h-5 text-forest-600" />
              <h3 className="text-sm font-semibold text-slate-900">Cash In</h3>
            </div>
            <label className="block text-xs text-slate-500 mb-1">Amount (KES)</label>
            <input type="number" placeholder="0" className="w-full mb-3" />
            <label className="block text-xs text-slate-500 mb-1">Reason</label>
            <input type="text" placeholder="Description" className="w-full mb-3" />
            <button className="btn-success w-full">Cash In</button>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-semibold text-slate-900">Cash Out</h3>
            </div>
            <label className="block text-xs text-slate-500 mb-1">Amount (KES)</label>
            <input type="number" placeholder="0" className="w-full mb-3" />
            <label className="block text-xs text-slate-500 mb-1">Reason</label>
            <input type="text" placeholder="Description" className="w-full mb-3" />
            <button className="btn-danger w-full">Cash Out</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Record Expense</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Category</label>
              <select className="w-full">
                <option>Utilities</option>
                <option>Supplies</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Amount (KES)</label>
              <input type="number" placeholder="0" className="w-full" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Description</label>
              <input type="text" placeholder="Expense description" className="w-full" />
            </div>
          </div>
          <button className="btn-primary mt-4">Record Expense</button>
        </div>
      )}
    </div>
  )
}
