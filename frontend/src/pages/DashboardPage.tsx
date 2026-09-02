import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<any>(null)

  useEffect(() => {
    setKpis({
      todaySales: 45250,
      todayTransactions: 127,
      avgTransaction: 356,
      lowStock: 8,
    })
  }, [])

  const stats = [
    { label: 'Today Sales', value: `KES ${(kpis?.todaySales || 0).toLocaleString()}`, icon: DollarSign, color: 'text-forest-600' },
    { label: 'Transactions', value: kpis?.todayTransactions || 0, icon: ShoppingCart, color: 'text-forest-500' },
    { label: 'Avg Sale', value: `KES ${(kpis?.avgTransaction || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-forest-400' },
    { label: 'Low Stock Items', value: kpis?.lowStock || 0, icon: Package, color: 'text-amber-500' },
  ]

  const chartData = [
    { name: 'Mon', sales: 38000 },
    { name: 'Tue', sales: 42000 },
    { name: 'Wed', sales: 35000 },
    { name: 'Thu', sales: 48000 },
    { name: 'Fri', sales: 52000 },
    { name: 'Sat', sales: 61000 },
    { name: 'Sun', sales: 45000 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-50 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Weekly Sales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Sales']}
              />
              <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm text-slate-900">Sale #{1000 + i}</p>
                  <p className="text-xs text-slate-500">Cashier {i}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-forest-600">KES {(Math.random() * 2000 + 100).toFixed(0)}</p>
                  <p className="text-xs text-slate-400">2 min ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
