import { useEffect, useState } from 'react'
import { analyticsService } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function MetricCard({ label, value, unit = '', color = '#1D9E75' }) {
  return (
    <div style={{
      background: '#f8f9fa', borderRadius: 12, padding: '20px 24px',
      border: '1px solid #e9ecef', flex: 1, minWidth: 160
    }}>
      <p style={{ margin: 0, fontSize: 13, color: '#666', marginBottom: 8 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color }}>{value}{unit}</p>
    </div>
  )
}

export default function Dashboard() {
  const [successRate, setSuccessRate] = useState(null)
  const [mttr, setMttr] = useState(null)
  const [trends, setTrends] = useState([])
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(true)

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
        console.error('Failed to load analytics:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p style={{ padding: 32 }}>Loading analytics...</p>

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 8, fontSize: 24 }}>DevInsight Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>CI/CD Pipeline and Reliability Overview</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <MetricCard label="Deployment Success Rate" value={successRate?.rate ?? '—'} unit="%" color="#1D9E75" />
        <MetricCard label="Total Deployments (30d)" value={successRate?.total ?? '—'} color="#378ADD" />
        <MetricCard label="Mean Time to Recovery" value={mttr?.mttr_minutes ?? '—'} unit=" min" color="#BA7517" />
        <MetricCard label="Recurring Failure Patterns" value={patterns?.length ?? '—'} color="#E24B4A" />
      </div>

      <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 24, border: '1px solid #e9ecef', marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16, marginTop: 0 }}>Deployment Trends (30 days)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#378ADD" strokeWidth={2} dot={false} name="Total" />
            <Line type="monotone" dataKey="failed" stroke="#E24B4A" strokeWidth={2} dot={false} name="Failed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {patterns.length > 0 && (
        <div style={{ background: '#fff5f5', borderRadius: 12, padding: 24, border: '1px solid #ffc9c9' }}>
          <h2 style={{ fontSize: 16, marginBottom: 16, marginTop: 0, color: '#c92a2a' }}>
            Recurring Failure Patterns Detected
          </h2>
          {patterns.map((p, i) => (
            <div key={i} style={{ marginBottom: 12, padding: '12px 16px', background: '#fff', borderRadius: 8, border: '1px solid #ffc9c9' }}>
              <strong style={{ color: '#c92a2a' }}>{p.service}</strong>
              <span style={{ marginLeft: 12, fontSize: 13, color: '#666' }}>
                Failed {p.failure_count} times — Risk: <span style={{ color: p.risk_level === 'high' ? '#c92a2a' : '#e67700', fontWeight: 600 }}>{p.risk_level}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}