import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Deployments from './pages/Deployments'
import Simulator from './pages/Simulator'
import BackendMonitor from './components/BackendMonitor'

const PAGES = [
  { id: 'dashboard',   label: 'Dashboard' },
  { id: 'deployments', label: 'Deployments' },
  { id: 'simulator',   label: 'Webhook Simulator' },
]

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div className="app">
      <nav className="topbar">
        <div className="topbar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          DevInsight
          <div className="topbar-dot" />
        </div>

        {PAGES.map(p => (
          <button
            key={p.id}
            className={`nav-btn${page === p.id ? ' active' : ''}`}
            onClick={() => setPage(p.id)}
          >
            {p.label}
          </button>
        ))}

        <div className="topbar-spacer" />

        <div className="topbar-badge">
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          Live
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {page === 'dashboard'   && <Dashboard />}
        {page === 'deployments' && <Deployments />}
        {page === 'simulator'   && <Simulator />}
      </main>

      <BackendMonitor />
    </div>
  )
}
