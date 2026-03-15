import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Deployments from './pages/Deployments'
import Simulator from './pages/Simulator'

const navStyle = {
  display: 'flex', gap: 8, padding: '16px 32px',
  borderBottom: '1px solid #e9ecef', background: '#fff',
  fontFamily: 'system-ui, sans-serif'
}

const btnStyle = (active) => ({
  padding: '8px 18px', borderRadius: 8, border: 'none',
  background: active ? '#1D9E75' : 'transparent',
  color: active ? '#fff' : '#495057',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer', fontSize: 14
})

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <nav style={navStyle}>
        <span style={{ fontWeight: 700, fontSize: 16, marginRight: 16, color: '#1D9E75' }}>DevInsight</span>
        <button style={btnStyle(page === 'dashboard')} onClick={() => setPage('dashboard')}>Dashboard</button>
        <button style={btnStyle(page === 'deployments')} onClick={() => setPage('deployments')}>Deployments</button>
        <button style={btnStyle(page === 'simulator')} onClick={() => setPage('simulator')}>Webhook Simulator</button>
      </nav>
      {page === 'dashboard'    && <Dashboard />}
      {page === 'deployments'  && <Deployments />}
      {page === 'simulator'    && <Simulator />}
    </div>
  )
}