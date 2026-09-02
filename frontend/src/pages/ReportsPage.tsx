import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Printer, FileText, Building2 } from 'lucide-react'
import { reportsApi } from '../services/api'

type Tab = 'overview' | 'departments' | 'sales' | 'cash'

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <div className="flex gap-2">
          {([
            ['overview', 'Overview'],
            ['departments', 'Department Report'],
            ['sales', 'Sales Report'],
            ['cash', 'Cash Report'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === key ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <OverviewReport />}
      {tab === 'departments' && <DepartmentReport />}
      {tab === 'sales' && <SalesReport />}
      {tab === 'cash' && <CashReport />}
    </div>
  )
}

function OverviewReport() {
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

function DepartmentReport() {
  const [data, setData] = useState<any[]>([])
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReport() }, [period])

  const loadReport = async () => {
    setLoading(true)
    try {
      const res = await reportsApi.departmentReport({ period })
      setData(res.data || [])
    } catch { /* */ } finally { setLoading(false) }
  }

  const grandRevenue = data.reduce((s, d) => s + d.totalRevenue, 0)
  const grandCost = data.reduce((s, d) => s + d.totalCost, 0)
  const grandProfit = data.reduce((s, d) => s + d.totalProfit, 0)
  const grandQty = data.reduce((s, d) => s + d.totalUnitsSold, 0)

  const handlePrint = () => {
    const printContent = document.getElementById('dept-report-print')?.innerHTML
    if (!printContent) return
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    w.document.write(`
      <html><head><title>Department Report - ${period}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #1e293b; padding: 20px; font-size: 12px; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 16px 0 6px; color: #166534; border-bottom: 2px solid #16a34a; padding-bottom: 4px; }
        .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1e293b; padding-bottom: 8px; }
        .header p { margin: 2px 0; font-size: 11px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th { background: #166534; color: white; padding: 6px 8px; text-align: left; font-size: 11px; }
        td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        tr:nth-child(even) { background: #f8fafc; }
        .total-row { font-weight: bold; background: #f0fdf4 !important; }
        .summary { display: flex; gap: 20px; margin: 12px 0; }
        .summary-box { flex: 1; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; }
        .summary-box p { margin: 2px 0; font-size: 11px; }
        .summary-box .value { font-size: 16px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <div class="header">
        <h1>SUPERMARKET KENYA - DEPARTMENT REPORT</h1>
        <p>Period: ${period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'Last 365 Days'}</p>
        <p>Generated: ${new Date().toLocaleString('en-KE')}</p>
      </div>
      ${printContent}
      <div class="footer">POS System Report — Confidential</div>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === p ? 'bg-forest-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {p === 'week' ? 'Last 7 Days' : p === 'month' ? 'Last 30 Days' : 'Last Year'}
            </button>
          ))}
        </div>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <Printer className="w-4 h-4" />Print Report
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading department data...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No sales data for this period</div>
      ) : (
        <div id="dept-report-print">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <p className="text-xs text-slate-500">Total Revenue</p>
              <p className="text-xl font-bold text-slate-900">KES {grandRevenue.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-slate-500">Total Cost</p>
              <p className="text-xl font-bold text-slate-900">KES {grandCost.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-slate-500">Net Profit</p>
              <p className="text-xl font-bold text-forest-600">KES {grandProfit.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-slate-500">Units Sold</p>
              <p className="text-xl font-bold text-slate-900">{grandQty.toLocaleString()}</p>
            </div>
          </div>

          {data.map((dept) => (
            <div key={dept.department} className="card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-forest-600" />
                <h3 className="text-base font-semibold text-slate-900">{dept.department}</h3>
                <span className="text-xs text-slate-400 ml-auto">{dept.productCount} products</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                <div><span className="text-slate-500">Revenue:</span> <span className="font-mono font-medium text-slate-900">KES {dept.totalRevenue.toLocaleString()}</span></div>
                <div><span className="text-slate-500">Cost:</span> <span className="font-mono text-slate-600">KES {dept.totalCost.toLocaleString()}</span></div>
                <div><span className="text-slate-500">Profit:</span> <span className="font-mono font-medium text-forest-600">KES {dept.totalProfit.toLocaleString()}</span></div>
              </div>
              {dept.products.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-left text-xs">
                      <th className="px-3 py-1.5 font-medium">Product</th>
                      <th className="px-3 py-1.5 font-medium">SKU</th>
                      <th className="px-3 py-1.5 font-medium text-right">Sold</th>
                      <th className="px-3 py-1.5 font-medium text-right">Revenue</th>
                      <th className="px-3 py-1.5 font-medium text-right">Cost</th>
                      <th className="px-3 py-1.5 font-medium text-right">Profit</th>
                      <th className="px-3 py-1.5 font-medium text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dept.products.map((p: any) => (
                      <tr key={p.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-3 py-1.5 text-slate-900">{p.name}</td>
                        <td className="px-3 py-1.5 text-slate-500 font-mono text-xs">{p.sku}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{p.unitsSold}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-forest-600">KES {p.revenue.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-slate-500">KES {p.cost.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-forest-600">KES {p.profit.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{p.currentStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SalesReport() {
  const [data, setData] = useState<any>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReport() }, [date])

  const loadReport = async () => {
    setLoading(true)
    try {
      const res = await reportsApi.dailySummary({ date })
      setData(res.data)
    } catch { /* */ } finally { setLoading(false) }
  }

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) return
    w.document.write(`
      <html><head><title>Sales Report - ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; font-size: 13px; }
        h1 { font-size: 18px; text-align: center; }
        .meta { text-align: center; color: #666; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
        .box { border: 1px solid #ddd; padding: 16px; border-radius: 8px; text-align: center; }
        .box .label { font-size: 12px; color: #666; }
        .box .value { font-size: 24px; font-weight: bold; margin-top: 4px; }
        .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print { body { padding: 15px; } }
      </style></head><body>
      <h1>SUPERMARKET KENYA - DAILY SALES REPORT</h1>
      <p class="meta">Date: ${date} | Generated: ${new Date().toLocaleString('en-KE')}</p>
      <div class="grid">
        <div class="box"><div class="label">Total Sales</div><div class="value">${data?.totalSales || 0}</div></div>
        <div class="box"><div class="label">Total Revenue</div><div class="value">KES ${(data?.totalRevenue || 0).toLocaleString()}</div></div>
        <div class="box"><div class="label">Total Tax</div><div class="value">KES ${(data?.totalTax || 0).toLocaleString()}</div></div>
      </div>
      <div class="footer">POS System Report — Confidential</div>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
        </div>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <Printer className="w-4 h-4" />Print Report
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-xs text-slate-500">Total Sales</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{data?.totalSales || 0}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">KES {(data?.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-slate-500">Total Tax</p>
            <p className="text-2xl font-bold text-forest-600 mt-1">KES {(data?.totalTax || 0).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CashReport() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReport() }, [date])

  const loadReport = async () => {
    setLoading(true)
    try {
      const res = await reportsApi.cashReconciliation({ date })
      setData(res.data || [])
    } catch { /* */ } finally { setLoading(false) }
  }

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) return
    const rows = data.map((s) => `
      <tr>
        <td>${s.register}</td>
        <td style="text-align:right">KES ${(s.openingFloat || 0).toLocaleString()}</td>
        <td style="text-align:right">KES ${(s.totalSales || 0).toLocaleString()}</td>
        <td style="text-align:right">KES ${(s.closingFloat || 0).toLocaleString()}</td>
        <td>${s.status}</td>
      </tr>
    `).join('')

    w.document.write(`
      <html><head><title>Cash Report - ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; font-size: 13px; }
        h1 { font-size: 18px; text-align: center; }
        .meta { text-align: center; color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #166534; color: white; padding: 8px; text-align: left; }
        td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
        .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print { body { padding: 15px; } }
      </style></head><body>
      <h1>SUPERMARKET KENYA - CASH RECONCILIATION</h1>
      <p class="meta">Date: ${date} | Generated: ${new Date().toLocaleString('en-KE')}</p>
      <table>
        <thead><tr><th>Register</th><th>Opening Float</th><th>Sales</th><th>Closing Float</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center">No sessions found</td></tr>'}</tbody>
      </table>
      <div class="footer">POS System Report — Confidential</div>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Date:</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
        </div>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
          <Printer className="w-4 h-4" />Print Report
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
                <th className="px-4 py-3 font-medium">Register</th>
                <th className="px-4 py-3 font-medium text-right">Opening Float</th>
                <th className="px-4 py-3 font-medium text-right">Total Sales</th>
                <th className="px-4 py-3 font-medium text-right">Closing Float</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No cash sessions for this date</td></tr>
              ) : data.map((s, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">{s.register}</td>
                  <td className="px-4 py-3 text-right font-mono">KES {(s.openingFloat || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-forest-600">KES {(s.totalSales || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">KES {(s.closingFloat || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' : 'bg-forest-50 text-forest-600'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
