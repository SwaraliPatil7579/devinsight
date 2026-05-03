import { useState } from 'react'
import api from '../services/api'

const SCENARIOS = [
  {
    label: 'Successful deploy — auth-service',
    env: 'production', type: 'success',
    payload: { name: 'auth-service', environment: 'production', build: { status: 'SUCCESS' } }
  },
  {
    label: 'Failed deploy — payment-api',
    env: 'production', type: 'error',
    payload: { name: 'payment-api', environment: 'production', build: { status: 'FAILURE' } }
  },
  {
    label: 'Successful deploy — user-service',
    env: 'staging', type: 'success',
    payload: { name: 'user-service', environment: 'staging', build: { status: 'SUCCESS' } }
  },
  {
    label: 'Failed deploy — api-gateway',
    env: 'production', type: 'error',
    payload: { name: 'api-gateway', environment: 'production', build: { status: 'FAILURE' } }
  },
]

export default function Simulator() {
  const [log, setLog]         = useState([])
  const [loading, setLoading] = useState(null)

  async function fire(scenario, index) {
    setLoading(index)
    const time = new Date().toLocaleTimeString()
    try {
      const res = await api.post('/webhooks/jenkins', scenario.payload)
      setLog(prev => [{ time, label: scenario.label, result: `Recorded · ID ${res.data.deployment_id?.slice(0,8)}`, type: 'success' }, ...prev])
      // notify Deployments page to refresh
      window.dispatchEvent(new CustomEvent('deployment:new'))
    } catch (e) {
      setLog(prev => [{ time, label: scenario.label, result: 'Failed: ' + e.message, type: 'error' }, ...prev])
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Webhook Simulator</h1>
        <p>Simulate CI/CD pipeline events exactly as Jenkins or GitHub Actions would send them. Fire these and watch the Dashboard update live.</p>
      </div>

      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Available Scenarios
          <span>POST /webhooks/jenkins</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SCENARIOS.map((s, i) => (
            <div key={i} className="scenario-card">
              <div>
                <div className="scenario-label">
                  <span className={`badge ${s.type === 'success' ? 'success' : 'failed'}`} style={{ marginRight: 10 }}>
                    {s.type === 'success' ? 'SUCCESS' : 'FAILURE'}
                  </span>
                  {s.label}
                </div>
                <div className="scenario-sub">
                  env: {s.env} · POST /webhooks/jenkins
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => fire(s, i)}
                disabled={loading === i}
                style={{ minWidth: 80 }}
              >
                {loading === i ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    Firing…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Fire
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">
          Activity Log
          {log.length > 0 && (
            <button
              className="btn btn-ghost"
              style={{ padding: '3px 10px', fontSize: 12, marginLeft: 'auto' }}
              onClick={() => setLog([])}
            >
              Clear
            </button>
          )}
        </div>
        {log.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 24px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>No events fired yet. Hit a scenario above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {log.map((entry, i) => (
              <div key={i} className={`log-entry ${entry.type}`}>
                <span>
                  <strong style={{ fontFamily: 'monospace', marginRight: 10 }}>{entry.time}</strong>
                  {entry.label}
                </span>
                <span style={{ fontWeight: 600 }}>{entry.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
