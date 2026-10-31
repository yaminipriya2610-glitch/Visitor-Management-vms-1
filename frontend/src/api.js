const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('vms_token')
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.blob()
  if (!response.ok) throw new Error(data?.detail || 'Request failed')
  return data
}

export const api = {
  health: () => request('/health'),
  seedDemo: () => request('/dev/seed-demo', { method: 'POST' }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  myBookings: () => request('/bookings/my'),
  securityBookings: (status) => request(`/security/bookings${status ? `?status_filter=${encodeURIComponent(status)}` : ''}`),
  approve: (id) => request(`/security/bookings/${id}/approve`, { method: 'POST' }),
  reject: (id, reason) => request(`/security/bookings/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejection_reason: reason }) }),
 verify: (qr_token) => request('/security/verify', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ qr_token }) 
}),
  downloadQr: async (id) => {
    const blob = await request(`/bookings/${id}/qr`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `visitor-${id}.png`; a.click(); URL.revokeObjectURL(url)
  }
}
