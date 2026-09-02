import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ReportsPage() {
  const salesData = [
    { name: 'Mon', sales: 38000, expenses: 5000 },
    { name: 'Tue', sales: 42000, expenses: 4500 },
    { name: 'Wed', sales: 35000, expenses: 6000 },
    { name: 'Thu', sales: 48000, expenses: 3800 },
    { name: 'Fri', sales: 52000, expenses: 5200 },
    { name: 'Sat', sales: 61000, expenses: 4800 },
    { name: 'Sun', sales: 45000, expenses: 5500 },
  ]

  const paymentData = [
    { name: 'Cash', value: 55, color: '#16a34a' },
    { name: 'M-Pesa', value: 35, color: '#22c55e' },
    { name: 'Card', value: 10, color: '#4ade80' },
  ]

  const topProducts = [
    { name: 'Milk 500ml', sold: 145, revenue: 7250 },
    { name: 'Bread Loaf', sold: 120, revenue: 8400 },
    { name: 'Sugar 1kg', sold: 98, revenue: 12740 },
    { name: 'Rice 2kg', sold: 87, revenue: 17400 },
    { name: 'Cooking Oil 1L', sold: 76, revenue: 13680 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-slate-500">Total Sales (Week)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">KES 321,000</p>
          <p className="text-xs text-forest-600 mt-1">+12% from last week</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500">Total Expenses</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">KES 34,800</p>
          <p className="text-xs text-slate-500 mt-1">10.8% of sales</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500">Net Profit</p>
          <p className="text-2xl font-bold text-forest-600 mt-1">KES 286,200</p>
          <p className="text-xs text-forest-600 mt-1">+14% margin</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Sales vs Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
              <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} name="Sales" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.5} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {paymentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Products</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left">
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium text-right">Units Sold</th>
              <th className="px-4 py-2 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-900">{p.name}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-600">{p.sold}</td>
                <td className="px-4 py-2 text-right font-mono text-forest-600">KES {p.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
