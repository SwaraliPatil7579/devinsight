import { useEffect, useState } from 'react'
import { deploymentService } from '../services/api'

const EMPTY_FORM = {
  service_name: '', environment: 'production',
  status: 'success', branch: 'main',
  triggered_by: '', error_message: ''
}

function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{status}</span>
}

function SkeletonRow() {
  return (
    <tr>
      {[140, 100, 80, 90, 100, 120].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 13, width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function Deployments() {
  const [deployments, setDeployments] = useState([])
  const [services, setServices]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [filters, setFilters]         = useState({ status: '', service: '' })
  const [message, setMessage]         = useState(null)
  const [showForm, setShowForm]       = useState(false)

  async function loadDeployments() {
    setLoading(true)
    try {
      const res = await deploymentService.getAll(filters)
      setDeployments(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    deploymentService.getServices().then(r => setServices(r.data)).catch(() => {})
    
    // Listen for new deployments from Simulator
    const handleNewDeployment = () => loadDeployments()
    window.addEventListener('deployment:new', handleNewDeployment)
    return () => window.removeEventListener('deployment:new', handleNewDeployment)
  }, [])

  useEffect(() => { loadDeployments() }, [filters])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.service_name.trim()) {
      setMessage({ type: 'error', text: 'Service name is required.' })
      return
    }
    setSubmitting(true)
    try {
      await deploymentService.create(form)
      setMessage({ type: 'success', text: 'Deployment recorded successfully.' })
      setForm(EMPTY_FORM)
      setShowForm(false)
      loadDeployments()
    } catch {
      setMessage({ type: 'error', text: 'Failed to record deployment.' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const f = v => e => setForm({ ...form, [v]: e.target.value })

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Deployments</h1>
          <p>Browse and record all deployment events across services</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {showForm ? 'Cancel' : 'Add Deployment'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.type}`}>
          {message.type === 'success'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {message.text}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="section-card" style={{ marginBottom: 20 }}>
          <div className="section-title">Record a Deployment</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Service name *</label>
                <input className="form-input" placeholder="e.g. auth-service" value={form.service_name} onChange={f('service_name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Environment</label>
                <select className="form-input" value={form.environment} onChange={f('environment')}>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={f('status')}>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="running">Running</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <input className="form-input" placeholder="main" value={form.branch} onChange={f('branch')} />
              </div>
              <div className="form-group">
                <label className="form-label">Triggered by</label>
                <input className="form-input" placeholder="your name" value={form.triggered_by} onChange={f('triggered_by')} />
              </div>
              <div className="form-group">
                <label className="form-label">Error message</label>
                <input className="form-input" placeholder="optional" value={form.error_message} onChange={f('error_message')} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Recording…' : 'Record Deployment'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
        </select>
        <select className="filter-select" value={filters.service} onChange={e => setFilters({ ...filters, service: e.target.value })}>
          <option value="">All services</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filters.status || filters.service) && (
          <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setFilters({ status: '', service: '' })}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Branch</th>
              <th>Triggered by</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [0,1,2,3,4].map(i => <SkeletonRow key={i} />)
            ) : deployments.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    <p>No deployments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              deployments.map(d => (
                <tr key={d.id}>
                  <td className="td-primary">{d.service_name}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: 99, fontSize: 12,
                      background: d.environment === 'production' ? 'var(--purple-light)' : 'var(--surface-2)',
                      color: d.environment === 'production' ? 'var(--purple)' : 'var(--text-2)',
                      fontWeight: 500
                    }}>
                      {d.environment}
                    </span>
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className="td-mono">{d.branch || '—'}</td>
                  <td>{d.triggered_by || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {new Date(d.started_at).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && deployments.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10, textAlign: 'right' }}>
          Showing {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
