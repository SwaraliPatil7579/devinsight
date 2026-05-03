import { useEffect, useRef, useState } from 'react'

const METHOD_COLORS = {
  GET:    '#60a5fa',
  POST:   '#34d399',
  DELETE: '#f87171',
  PUT:    '#fbbf24',
  PATCH:  '#fbbf24',
}

const STATUS_COLOR = (s) => {
  if (s < 300) return '#34d399'
  if (s < 400) return '#fbbf24'
  return '#f87171'
}

function LogRow({ entry }) {
  const t = new Date(entry.timestamp).toLocaleTimeString()
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '64px 52px 1fr 44px 60px',
      gap: 8, padding: '4px 12px',
      fontFamily: 'ui-monospace, monospace', fontSize: 12,
      borderBottom: '1px solid #1e293b',
      animation: 'fadeIn .2s ease',
    }}>
      <span style={{ color: '#64748b' }}>{t}</span>
      <span style={{ color: METHOD_COLORS[entry.method] ?? '#94a3b8', fontWeight: 700 }}>
        {entry.method}
      </span>
      <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.path}
      </span>
      <span style={{ color: STATUS_COLOR(entry.status), fontWeight: 600 }}>
        {entry.status}
      </span>
      <span style={{ color: '#475569', textAlign: 'right' }}>
        {entry.duration_ms}ms
      </span>
    </div>
  )
}

export default function BackendMonitor() {
  const [open, setOpen]     = useState(false)
  const [logs, setLogs]     = useState([])
  const [conn, setConn]     = useState('connecting') // connecting | live | error
  const bottomRef           = useRef(null)
  const esRef               = useRef(null)

  useEffect(() => {
    const es = new EventSource('http://localhost:8002/api/logs/stream')
    esRef.current = es

    es.onopen = () => setConn('live')
    es.onerror = () => setConn('error')
    es.onmessage = (e) => {
      try {
        const entry = JSON.parse(e.data)
        setLogs(prev => [...prev.slice(-199), entry])
      } catch {}
    }
    return () => es.close()
  }, [])

  // auto-scroll when open
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, open])

  const connColor = conn === 'live' ? '#34d399' : conn === 'error' ? '#f87171' : '#fbbf24'

  return (
    <>
      {/* Toggle button — fixed bottom-right */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 99,
          background: '#0f172a', color: '#e2e8f0',
          border: '1px solid #1e293b',
          fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,.4)',
          cursor: 'pointer', transition: 'transform .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: connColor,
          boxShadow: conn === 'live' ? `0 0 6px ${connColor}` : 'none',
          animation: conn === 'live' ? 'glow 1.5s infinite' : 'none'
        }} />
        Backend Monitor
        <span style={{ color: '#475569', fontWeight: 400 }}>
          {open ? '▼' : '▲'}
        </span>
        {logs.length > 0 && (
          <span style={{
            background: '#1e293b', color: '#94a3b8',
            padding: '1px 7px', borderRadius: 99, fontSize: 11
          }}>{logs.length}</span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 64, right: 20, zIndex: 199,
          width: 680, maxHeight: 340,
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp .2s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderBottom: '1px solid #1e293b',
            background: '#0a0f1a',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: connColor,
              boxShadow: conn === 'live' ? `0 0 8px ${connColor}` : 'none' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
              devinsight-api  ·  localhost:8002
            </span>
            <span style={{ fontSize: 11, color: connColor, marginLeft: 4 }}>
              {conn === 'live' ? '● LIVE' : conn === 'error' ? '✕ DISCONNECTED' : '○ CONNECTING'}
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setLogs([])}
              style={{ background: 'none', border: 'none', color: '#475569',
                fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' }}
            >
              clear
            </button>
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '64px 52px 1fr 44px 60px',
            gap: 8, padding: '5px 12px',
            fontFamily: 'monospace', fontSize: 10,
            color: '#334155', borderBottom: '1px solid #1e293b',
            background: '#0a0f1a', textTransform: 'uppercase', letterSpacing: '.06em'
          }}>
            <span>Time</span><span>Method</span><span>Path</span><span>Status</span><span style={{ textAlign: 'right' }}>Latency</span>
          </div>

          {/* Log rows */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {logs.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center',
                fontFamily: 'monospace', fontSize: 12, color: '#334155' }}>
                Waiting for requests…
              </div>
            ) : (
              logs.map((entry, i) => <LogRow key={i} entry={entry} />)
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow    { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
      `}</style>
    </>
  )
}
