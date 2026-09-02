import axios from 'axios'

const API_BASE = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (data: { username: string; pin: string }) => api.post('/auth/login', data),
}

export const productsApi = {
  list: (params?: any) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  scan: (barcode: string) => api.get(`/products/scan/${barcode}`),
  categories: () => api.get('/products/categories'),
  brands: () => api.get('/products/brands'),
}

export const salesApi = {
  create: (data: any) => api.post('/sales', data),
  list: (params?: any) => api.get('/sales', { params }),
  get: (id: string) => api.get(`/sales/${id}`),
  receipt: (id: string) => api.get(`/sales/${id}/receipt`, { responseType: 'blob' }),
  dailySummary: (params?: any) => api.get('/sales/daily-summary', { params }),
  refunds: {
    list: () => api.get('/sales/refunds'),
    create: (data: any) => api.post('/sales/refunds', data),
    approve: (id: string) => api.post(`/sales/refunds/${id}/approve`),
    reject: (id: string) => api.post(`/sales/refunds/${id}/reject`),
  },
}

export const paymentsApi = {
  initiate: (data: any) => api.post('/payments/initiate', data),
  status: (id: string) => api.get(`/payments/${id}/status`),
  list: (params?: any) => api.get('/payments', { params }),
}

export const customersApi = {
  list: (params?: any) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  byPhone: (phone: string) => api.get(`/customers/phone/${phone}`),
  loyalty: {
    balance: (id: string) => api.get(`/customers/${id}/loyalty/balance`),
    history: (id: string) => api.get(`/customers/${id}/loyalty/history`),
    redeem: (id: string, data: any) => api.post(`/customers/${id}/loyalty/redeem`, data),
  },
}

export const inventoryApi = {
  list: (params?: any) => api.get('/inventory', { params }),
  lowStock: () => api.get('/inventory/low-stock'),
  movements: (variantId: string) => api.get(`/inventory/${variantId}/movements`),
  adjust: (data: any) => api.post('/inventory/adjust', data),
  transfer: (data: any) => api.post('/inventory/transfer', data),
  damage: (data: any) => api.post('/inventory/damage', data),
}

export const cashApi = {
  open: (data: any) => api.post('/cash-sessions/open', data),
  close: (id: string, data: any) => api.post(`/cash-sessions/${id}/close`, data),
  summary: (id: string) => api.get(`/cash-sessions/${id}/summary`),
  cashIn: (id: string, data: any) => api.post(`/cash-sessions/${id}/cash-in`, data),
  cashOut: (id: string, data: any) => api.post(`/cash-sessions/${id}/cash-out`, data),
  pettyCash: (id: string, data: any) => api.post(`/cash-sessions/${id}/petty-cash`, data),
}

export const expensesApi = {
  list: (params?: any) => api.get('/expenses', { params }),
  create: (data: any) => api.post('/expenses', data),
  summary: (params?: any) => api.get('/expenses/summary', { params }),
}

export const employeesApi = {
  list: (params?: any) => api.get('/employees', { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
}

export const reportsApi = {
  dailySummary: (params?: any) => api.get('/reports/daily-summary', { params }),
  topProducts: (params?: any) => api.get('/reports/top-products', { params }),
  cashReconciliation: (params?: any) => api.get('/reports/cash-reconciliation', { params }),
}

export const dashboardApi = {
  kpis: (params?: any) => api.get('/dashboard/kpis', { params }),
  salesChart: (params?: any) => api.get('/dashboard/sales-chart', { params }),
  topCashiers: (params?: any) => api.get('/dashboard/top-cashiers', { params }),
}

export const suppliersApi = {
  list: (params?: any) => api.get('/suppliers', { params }),
  get: (id: string) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
}

export const purchaseOrdersApi = {
  list: (params?: any) => api.get('/purchase-orders', { params }),
  get: (id: string) => api.get(`/purchase-orders/${id}`),
  create: (data: any) => api.post('/purchase-orders', data),
  receive: (id: string, data: any) => api.post(`/purchase-orders/${id}/receive`, data),
  cancel: (id: string) => api.post(`/purchase-orders/${id}/cancel`),
}

export const settingsApi = {
  list: () => api.get('/settings'),
  get: (key: string) => api.get(`/settings/${key}`),
  set: (data: any) => api.post('/settings', data),
  init: (data: any) => api.post('/settings/init', data),
}

export const promotionsApi = {
  list: (params?: any) => api.get('/promotions', { params }),
  active: () => api.get('/promotions/active'),
  get: (id: string) => api.get(`/promotions/${id}`),
  create: (data: any) => api.post('/promotions', data),
  update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
}

export const syncApi = {
  push: (data: any) => api.post('/sync/push', data),
  pull: (params?: any) => api.get('/sync/pull', { params }),
  process: (terminalId: string) => api.post(`/sync/process/${terminalId}`),
  status: (terminalId: string) => api.get(`/sync/status/${terminalId}`),
}

export default api
