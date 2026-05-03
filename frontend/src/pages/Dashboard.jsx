import { useEffect, useState } from 'react'
import { analyticsService } from '../services/api'
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts'

function MetricCard({ label, value, unit = '', color, sub }) {
  return (
    <div className={`metric-card ${color}`}>
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${color}`}>
        {value ?? <span style={{ fontSize: '1.4rem', opacity: .4 }}>—</span>}
        {value != null && unit && <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: 3 }}>{unit}</span>}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="metric-card" style={{ padding: '20px 22px' }}>
      <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 32, width: '45%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 10, width: '70%' }} />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow)',
      fontSize: 13
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-1)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function fmt(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  })
}

function RecoveryEvidenceRow({ ev }) {
  const [open, setOpen] = useState(false)
  const recColor = ev.recovery_minutes < 60
    ? { bg: 'var(--green-light)', fg: 'var(--green-dark)' }
    : ev.recovery_minutes < 240
    ? { bg: 'var(--amber-light)', fg: 'var(--amber)' }
    : { bg: 'var(--red-light)',   fg: 'var(--red)' }

  return (
    <>
      <tr
        onClick={() => setOpen(v => !v)}
        style={{ cursor: 'pointer' }}
        title="Click to see proof"
      >
        <td className="td-primary">{ev.service}</td>
        <td style={{ fontSize: 12, color: 'var(--red)' }}>{fmt(ev.failed_at)}</td>
        <td>
          {/* arrow */}
          <span style={{ color: 'var(--text-3)', fontSize: 16, userSelect: 'none' }}>→</span>
        </td>
        <td style={{ fontSize: 12, color: 'var(--green)' }}>{fmt(ev.recovered_at)}</td>
        <td style={{ textAlign: 'right' }}>
          <span style={{
            padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: recColor.bg, color: recColor.fg,
          }}>
            {ev.recovery_minutes} min
          </span>
        </td>
        <td style={{ textAlign: 'right', color: 'var(--text-3)', fontSize: 12 }}>
          {open ? '▲ hide' : '▼ proof'}
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={6} style={{ padding: 0, background: 'var(--surface-2)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 40px 1fr',
              gap: 0, padding: '14px 20px', alignItems: 'start',
            }}>
              {/* Failed deployment */}
              <div style={{
                background: '#fff5f5', border: '1px solid #fecaca',
                borderRadius: 8, padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span className="badge failed">FAILED</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-3)' }}>
                    #{ev.failed_id.slice(0, 8)}
                  </span>
                </div>
                <EvidenceRow label="Service"     value={ev.service} />
                <EvidenceRow label="Branch"      value={ev.failed_branch} mono />
                <EvidenceRow label="Triggered by" value={ev.failed_triggered_by} />
                <EvidenceRow label="Source"      value={ev.failed_source} />
                <EvidenceRow label="Time"        value={fmt(ev.failed_at)} />
                {ev.error_message && (
                  <EvidenceRow label="Error" value={ev.error_message} red />
                )}
              </div>

              {/* Arrow connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', gap: 4, paddingTop: 20 }}>
                <div style={{ width: 1, flex: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 18, color: 'var(--green)' }}>✓</span>
                <div style={{ width: 1, flex: 1, background: 'var(--border)' }} />
              </div>

              {/* Recovery deployment */}
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 8, padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span className="badge success">RECOVERED</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-3)' }}>
                    #{ev.recovery_id.slice(0, 8)}
                  </span>
                </div>
                <EvidenceRow label="Service"     value={ev.service} />
                <EvidenceRow label="Branch"      value={ev.recovery_branch} mono />
                <EvidenceRow label="Triggered by" value={ev.recovery_triggered_by} />
                <EvidenceRow label="Source"      value={ev.recovery_source} />
                <EvidenceRow label="Time"        value={fmt(ev.recovered_at)} />
                <EvidenceRow label="Recovery in" value={`${ev.recovery_minutes} minutes`} green />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function EvidenceRow({ label, value, mono, red, green }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: 12 }}>
      <span style={{ color: 'var(--text-3)', minWidth: 80 }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'monospace' : 'inherit',
        color: red ? 'var(--red)' : green ? 'var(--green-dark)' : 'var(--text-1)',
        fontWeight: 500, wordBreak: 'break-all',
      }}>{value}</span>
    </div>
  )
}

function RecoveryEvents({ mttr }) {
  return (
    <div className="section-card">
      <div className="section-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
        </svg>
        Recovery Events
        <span>{mttr?.sample_count ?? 0} verified recoveries · last 30 days</span>
        {mttr?.mttr_minutes > 0 && (
          <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--amber)', fontSize: 13 }}>
            avg MTTR: {mttr.mttr_minutes} min
          </span>
        )}
      </div>

      {!mttr?.events?.length ? (
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <p>No recovery events found in the last 30 days</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
            Each row is a verified failure→recovery pair from the same service. Click any row to see the exact deployment IDs as proof.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Failed at</th>
                  <th></th>
                  <th>Recovered at</th>
                  <th style={{ textAlign: 'right' }}>Recovery time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mttr.events.map((ev, i) => (
                  <RecoveryEvidenceRow key={i} ev={ev} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [successRate, setSuccessRate] = useState(null)
  const [mttr, setMttr]               = useState(null)
  const [trends, setTrends]           = useState([])
  const [patterns, setPatterns]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [sr, mt, tr, pt] = await Promise.all([
          analyticsService.getSuccessRate(),
          analyticsService.getMTTR(),
          analyticsService.getTrends(),
          analyticsService.getPatterns(),
        ])
        setSuccessRate(sr.data)
        setMttr(mt.data)
        setTrends(tr.data)
        setPatterns(pt.data)
      } catch (e) {
        setError('Could not reach the API. Make sure the backend is running.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const successPct = successRate?.rate ?? null
  const rateColor  = successPct == null ? 'green' : successPct >= 80 ? 'green' : successPct >= 60 ? 'amber' : 'red'

  return (
    <div className="page">
      <div className="page-header">
        <h1>CI/CD Pipeline Overview</h1>
        <p>Real-time deployment health and reliability metrics across all services</p>
      </div>

      {error && (
        <div className="alert error" style={{ marginBottom: 24 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Metric cards */}
      <div className="metrics-grid">
        {loading ? (
          [0,1,2,3].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard
              label="Deployment Success Rate"
              value={successRate?.rate}
              unit="%"
              color={rateColor}
              sub={`${successRate?.successful ?? 0} of ${successRate?.total ?? 0} deployments`}
            />
            <MetricCard
              label="Total Deployments"
              value={successRate?.total}
              color="blue"
              sub="Last 30 days"
            />
            <MetricCard
              label="Mean Time to Recovery"
              value={mttr?.mttr_minutes}
              unit=" min"
              color="amber"
              sub={`Based on ${mttr?.sample_count ?? 0} recovery events`}
            />
            <MetricCard
              label="Recurring Failure Patterns"
              value={patterns?.length}
              color={patterns?.length > 0 ? 'red' : 'green'}
              sub={patterns?.length > 0 ? 'Services need attention' : 'No patterns detected'}
            />
          </>
        )}
      </div>

      {/* Trend chart */}
      <div className="section-card">
        <div className="section-title">
          Deployment Trends
          <span>30-day window</span>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 220, borderRadius: 8 }} />
        ) : trends.length === 0 ? (
          <div className="empty-state">No trend data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-3)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="total"  stroke="#3b82f6" strokeWidth={2} fill="url(#gradTotal)"  name="Total" dot={false} />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="url(#gradFailed)" name="Failed" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Failure patterns */}
      {!loading && patterns.length > 0 && (
        <div className="section-card" style={{ borderColor: '#fecaca', background: '#fff8f8' }}>
          <div className="section-title" style={{ color: '#b91c1c' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Recurring Failure Patterns Detected
            <span>{patterns.length} service{patterns.length !== 1 ? 's' : ''} flagged</span>
          </div>
          <div className="pattern-list">
            {patterns.map((p, i) => (
              <div key={i} className="pattern-item">
                <div>
                  <div className="pattern-service">{p.service}</div>
                  <div className="pattern-meta">
                    {p.failure_count} failures · Last seen {new Date(p.last_seen).toLocaleDateString()}
                  </div>
                </div>
                <span className={`risk-badge ${p.risk_level}`}>
                  {p.risk_level.toUpperCase()} RISK
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && patterns.length === 0 && (
        <div className="section-card" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#15803d' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{ fontWeight: 600, fontSize: 14 }}>No recurring failure patterns detected</span>
            <span style={{ fontSize: 13, color: '#16a34a', marginLeft: 4 }}>All services are healthy</span>
          </div>
        </div>
      )}

      {/* Recovery events */}
      {!loading && (
        <RecoveryEvents mttr={mttr} />
      )}
    </div>
  )
}
