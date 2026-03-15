import { useState } from 'react'
import api from '../services/api'

const SCENARIOS = [
  { label: 'Successful deploy — auth-service', payload: { name: 'auth-service', environment: 'production', build: { status: 'SUCCESS' } } },
  { label: 'Failed deploy — payment-api',      payload: { name: 'payment-api',  environment: 'production', build: { status: 'FAILURE' } } },
  { label: 'Successful deploy — user-service', payload: { name: 'user-service', environment: 'staging',    build: { status: 'SUCCESS' } } },
  { label: 'Failed deploy — api-gateway',      payload: { name: 'api-gateway',  environment: 'production', build: { status: 'FAILURE' } } },
]

export default function Simulator() {
  const [log, setLog]         = useState([])
  const [loading, setLoading] = useState(null)

  async function fire(scenario, index) {
    setLoading(index)
    const time = new Date().toLocaleTimeString()
    try {
      await api.post('/webhooks/jenkins', scenario.payload)
      setLog(prev => [{
        time, label: scenario.label,
        result: 'Recorded successfully', type: 'success'
      }, ...prev])
    } catch (e) {
      setLog(prev => [{
        time, label: scenario.label,
        result: 'Failed: ' + e.message, type: 'error'
      }, ...prev])
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Webhook Simulator</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Simulate CI/CD pipeline events hitting your backend — exactly like real Jenkins or GitHub Actions would.
        Fire these and watch the Dashboard update live.
      </p>

      <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
        {SCENARIOS.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fff', borderRadius: 10, padding: '16px 20px',
            border: '1px solid #e9ecef'
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#aaa', marginTop: 2 }}>
                POST /webhooks/jenkins
              </p>
            </div>
            <button
              onClick={() => fire(s, i)}
              disabled={loading === i}
              style={{
                padding: '8px 20px', background: '#1D9E75', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: loading === i ? 'not-allowed' : 'pointer',
                opacity: loading === i ? 0.6 : 1
              }}>
              {loading === i ? 'Firing...' : 'Fire'}
            </button>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Activity log</h2>
          {log.map((entry, i) => (
            <div key={i} style={{
              padding: '10px 16px', borderRadius: 8, marginBottom: 8, fontSize: 13,
              background: entry.type === 'success' ? '#d3f9d8' : '#ffe3e3',
              color: entry.type === 'success' ? '#2b8a3e' : '#c92a2a',
              display: 'flex', justifyContent: 'space-between'
            }}>
              <span><strong>{entry.time}</strong> — {entry.label}</span>
              <span>{entry.result}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}