import { Settings, Building, CreditCard, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-forest-600" />
            <h3 className="text-sm font-semibold text-slate-900">Business Info</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Business Name</label>
              <input type="text" defaultValue="Supermarket Kenya" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Phone</label>
              <input type="text" defaultValue="+254 700 000000" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Address</label>
              <input type="text" defaultValue="Nairobi, Kenya" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">KRA PIN</label>
              <input type="text" placeholder="A000000000" className="w-full" />
            </div>
            <button className="btn-primary">Save</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-forest-600" />
            <h3 className="text-sm font-semibold text-slate-900">M-Pesa Settings</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Consumer Key</label>
              <input type="password" placeholder="Enter consumer key" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Consumer Secret</label>
              <input type="password" placeholder="Enter consumer secret" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Shortcode</label>
              <input type="text" placeholder="174379" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Passkey</label>
              <input type="password" placeholder="Enter passkey" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Callback URL</label>
              <input type="text" defaultValue="https://yourdomain.com/api/payments/callback/mpesa" className="w-full" />
            </div>
            <button className="btn-primary">Save M-Pesa Config</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-forest-600" />
            <h3 className="text-sm font-semibold text-slate-900">Terminal</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Terminal ID</label>
              <input type="text" defaultValue="T-001" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Branch</label>
              <input type="text" defaultValue="Main Branch" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">VAT Rate (%)</label>
              <input type="number" defaultValue="16" className="w-full" />
            </div>
            <button className="btn-primary">Save</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-forest-600" />
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-forest-600" />
              <span className="text-sm text-slate-600">Low stock alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-forest-600" />
              <span className="text-sm text-slate-600">Daily sales summary</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-forest-600" />
              <span className="text-sm text-slate-600">Email notifications</span>
            </label>
            <button className="btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
