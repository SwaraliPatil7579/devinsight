import { useEffect, useState } from 'react'
import { deploymentService } from '../services/api'

const STATUS_COLORS = {
  success: { bg: '#d3f9d8', text: '#2b8a3e' },
  failed:  { bg: '#ffe3e3', text: '#c92a2a' },
  running: { bg: '#fff3bf', text: '#e67700' },
}

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: '#f1f3f5', text: '#495057' }
  return (
    <span style={{
      background: colors.bg, color: colors.text,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600
    }}>
      {status}
    </span>
  )
}

const EMPTY_FORM = {
  service_name: '', environment: 'production',
  status: 'success', branch: 'main',
  triggered_by: '', error_message: ''
}

export default function Deployments() {
  const [deployments, setDeployments] = useState([])
  const [services, setServices]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [filters, setFilters]         = useState({ status: '', service: '' })
  const [message, setMessage]         = useState(null)

  async function loadDeployments() {
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
    deploymentService.getServices().then(r => setServices(r.data))
  }, [])

  useEffect(() => {
    loadDeployments()
  }, [filters])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.service_name.trim()) {
      setMessage({ type: 'error', text: 'Service name is required.' })
      return
    }
    setSubmitting(true)
    try {
      await deploymentService.create(form)
      setMessage({ type: 'success', text: 'Deployment recorded successfully!' })
      setForm(EMPTY_FORM)
      loadDeployments()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to record deployment.' })
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid #dee2e6', fontSize: 14,
    background: '#fff', color: '#212529', boxSizing: 'border-box'
  }

  const labelStyle = { fontSize: 13, color: '#666', marginBottom: 4, display: 'block' }

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Deployments</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Record and browse all deployment events</p>

      {/* ── ADD DEPLOYMENT FORM ── */}
      <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 24, border: '1px solid #e9ecef', marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 20 }}>Add Deployment Manually</h2>

        {message && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14,
            background: message.type === 'success' ? '#d3f9d8' : '#ffe3e3',
            color: message.type === 'success' ? '#2b8a3e' : '#c92a2a',
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>

            <div>
              <label style={labelStyle}>Service name *</label>
              <input
                style={inputStyle}
                placeholder="e.g. auth-service"
                value={form.service_name}
                onChange={e => setForm({ ...form, service_name: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>Environment</label>
              <select style={inputStyle} value={form.environment}
                onChange={e => setForm({ ...form, environment: e.target.value })}>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Branch</label>
              <input style={inputStyle} placeholder="main"
                value={form.branch}
                onChange={e => setForm({ ...form, branch: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Triggered by</label>
              <input style={inputStyle} placeholder="your name"
                value={form.triggered_by}
                onChange={e => setForm({ ...form, triggered_by: e.target.value })} />
            </div>

            <div>
              <label style={labelStyle}>Error message (if failed)</label>
              <input style={inputStyle} placeholder="optional"
                value={form.error_message}
                onChange={e => setForm({ ...form, error_message: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{
            padding: '10px 28px', background: '#1D9E75', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}>
            {submitting ? 'Recording...' : 'Record Deployment'}
          </button>
        </form>
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, width: 180 }} value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
        </select>

        <select style={{ ...inputStyle, width: 200 }} value={filters.service}
          onChange={e => setFilters({ ...filters, service: e.target.value })}>
          <option value="">All services</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* ── DEPLOYMENTS TABLE ── */}
      {loading ? (
        <p style={{ color: '#666' }}>Loading...</p>
      ) : (
        <div style={{ borderRadius: 12, border: '1px solid #e9ecef', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                {['Service', 'Environment', 'Status', 'Branch', 'Triggered by', 'Time'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#495057' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deployments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>No deployments found</td></tr>
              ) : (
                deployments.map((d, i) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f3f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{d.service_name}</td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{d.environment}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={d.status} /></td>
                    <td style={{ padding: '12px 16px', color: '#666', fontFamily: 'monospace', fontSize: 12 }}>{d.branch}</td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{d.triggered_by || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#666', fontSize: 12 }}>
                      {new Date(d.started_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}