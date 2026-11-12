import { useEffect, useMemo, useRef, useState } from 'react'

const PLACEHOLDER_TOKEN = 'PLACEHOLDER_ADDRESS_NOT_A_REAL_CONTRACT'
const PLACEHOLDER_POOL = 'PLACEHOLDER_POOL_NOT_A_REAL_ADDRESS'

const TF = {
  '1H': { n: 60, step: 1 },
  '24H': { n: 96, step: 15 },
  '7D': { n: 84, step: 120 },
  '30D': { n: 120, step: 360 },
}

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

function genSeries(tf, seed, endPrice) {
  const { n } = TF[tf]
  const r = rng(seed + hash(tf))
  let v = 1
  const raw = []
  for (let i = 0; i < n; i++) {
    const ret = (r() - 0.485) * 0.05
    v *= 1 + ret
    raw.push({ p: v, vol: (15000 + r() * 70000) * (1 + Math.abs(ret) * 25) })
  }
  const k = endPrice / raw[n - 1].p
  return raw.map(d => ({ price: d.p * k, vol: d.vol }))
}

const usd = n =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`
const px = p => `$${p.toFixed(6)}`
const num = n => n.toLocaleString('en-US', { maximumFractionDigits: 0 })
const ago = m => (m < 1 ? 'now' : m < 60 ? `${Math.round(m)}m ago` : m < 2880 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`)

function makeTrade(r, price, id, minsAgo = 0) {
  const buy = r() > 0.46
  const qty = Math.round(2e4 + r() * r() * 2.5e6)
  const p = price * (1 + (r() - 0.5) * 0.01)
  return {
    id,
    buy,
    qty,
    price: p,
    total: qty * p,
    who: `sim_${Math.floor(r() * 0xfffff).toString(16).padStart(5, '0')}`,
    minsAgo,
  }
}

function Sim({ children = 'SIM' }) {
  return <span className="db-sim">{children}</span>
}

function CopyRow({ label, value }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const t = document.createElement('textarea')
      t.value = value
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setDone(true)
    setTimeout(() => setDone(false), 1600)
  }
  return (
    <div className="db-copy">
      <div>
        <span className="db-label">{label}</span>
        <code>{value}</code>
      </div>
      <button className={`btn ghost db-copybtn ${done ? 'done' : ''}`} onClick={copy} aria-live="polite">
        {done ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function PriceChart({ data, tf }) {
  const [hover, setHover] = useState(null)
  const ref = useRef(null)
  const W = 800, H = 300, VH = 56, P = 14
  const geo = useMemo(() => {
    const prices = data.map(d => d.price)
    const min = Math.min(...prices), max = Math.max(...prices)
    const pad = (max - min) * 0.1 || 1e-6
    const lo = min - pad, hi = max + pad
    const maxVol = Math.max(...data.map(d => d.vol))
    const x = i => P + (i / (data.length - 1)) * (W - P * 2)
    const y = p => P + (1 - (p - lo) / (hi - lo)) * (H - P * 2 - VH)
    const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.price).toFixed(1)}`).join(' ')
    const area = `${line} L${x(data.length - 1)} ${H - VH - P} L${x(0)} ${H - VH - P} Z`
    return { x, y, line, area, lo, hi, maxVol }
  }, [data])

  const up = data[data.length - 1].price >= data[0].price
  const col = up ? '#39ff14' : '#ff3b6b'

  const onMove = e => {
    const rect = ref.current.getBoundingClientRect()
    const rel = (e.clientX - rect.left) / rect.width
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1)))))
  }
  const step = TF[tf].step
  const h = hover != null ? data[hover] : null

  return (
    <div className="db-chartwrap" ref={ref} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="db-chart" role="img" aria-label={`Simulated ${tf} price chart. Sample data only.`}>
        <defs>
          <linearGradient id="dbfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={col} stopOpacity=".35" />
            <stop offset="1" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={P} x2={W - P} y1={P + f * (H - P * 2 - VH)} y2={P + f * (H - P * 2 - VH)} className="db-gridline" />
        ))}
        <path d={geo.area} fill="url(#dbfill)" />
        <path d={geo.line} key={tf + geo.line} className="db-line" style={{ stroke: col, filter: `drop-shadow(0 0 6px ${col})` }} />
        {data.map((d, i) => {
          const bh = (d.vol / geo.maxVol) * (VH - 8)
          return <rect key={i} x={geo.x(i) - 2} y={H - P - bh} width={Math.max(1.5, (W - P * 2) / data.length - 2)} height={bh} className="db-vol" />
        })}
        <text x={W / 2} y={(H - VH) / 2 + 20} textAnchor="middle" className="db-water">SIMULATION</text>
        {h && (
          <g>
            <line x1={geo.x(hover)} x2={geo.x(hover)} y1={P} y2={H - P} className="db-cross" />
            <circle cx={geo.x(hover)} cy={geo.y(h.price)} r="5" fill={col} stroke="#000" strokeWidth="2" />
          </g>
        )}
      </svg>
      {h && (
        <div className="db-tip" style={{ left: `${(geo.x(hover) / W) * 100}%` }}>
          <b>{px(h.price)}</b>
          <span>Vol {usd(h.vol)}</span>
          <span>{ago((data.length - 1 - hover) * step)}</span>
          <Sim>SIMULATION</Sim>
        </div>
      )}
      <div className="db-axis"><span>{ago((data.length - 1) * step)}</span><span>now</span></div>
    </div>
  )
}

export default function Dashboard({ supply, allocation }) {
  const [seed, setSeed] = useState(2026)
  const [tf, setTf] = useState('24H')
  const [live, setLive] = useState(true)
  const [filter, setFilter] = useState('all')
  const [trades, setTrades] = useState([])
  const idRef = useRef(0)

  const base = useMemo(() => {
    const r = rng(seed)
    return {
      price: 0.0002 + r() * 0.0006,
      holders: Math.floor(3000 + r() * 9000),
      liqRatio: 0.05 + r() * 0.06,
    }
  }, [seed])

  const data = useMemo(() => genSeries(tf, seed, base.price), [tf, seed, base.price])
  const price = data[data.length - 1].price
  const change = ((price - data[0].price) / data[0].price) * 100
  const volume = data.reduce((s, d) => s + d.vol, 0)
  const mcap = price * supply
  const liquidity = mcap * base.liqRatio

  // reset the trade feed whenever a new simulation is generated
  useEffect(() => {
    const r = rng(seed * 7)
    idRef.current = 0
    setTrades(Array.from({ length: 16 }, (_, i) => makeTrade(r, base.price, idRef.current++, (i + 1) * 0.7)))
  }, [seed, base.price])

  // simulated live feed
  useEffect(() => {
    if (!live) return
    const r = rng(Date.now() & 0xffffff)
    const t = setInterval(() => {
      setTrades(prev => [makeTrade(r, base.price, idRef.current++), ...prev.map(x => ({ ...x, minsAgo: x.minsAgo + 0.04 }))].slice(0, 40))
    }, 2200)
    return () => clearInterval(t)
  }, [live, base.price])

  const shown = trades.filter(t => filter === 'all' || (filter === 'buy') === t.buy).slice(0, 12)
  const buys = trades.filter(t => t.buy).length
  const buyPct = trades.length ? Math.round((buys / trades.length) * 100) : 50

  const cards = [
    ['Simulated price', px(price), `${change >= 0 ? '+' : ''}${change.toFixed(2)}% (${tf})`, change >= 0],
    ['Simulated market cap', usd(mcap), 'Price × total supply', null],
    ['Simulated liquidity', usd(liquidity), 'Sample pool depth', null],
    ['Simulated holders', num(base.holders), 'Sample count', null],
  ]

  return (
    <div className="db">
      <div className="db-banner" role="note">
        <Sim>SIMULATION</Sim>
        <span>Every number, chart and trade on this dashboard is randomly generated sample data. $KRAUS is not a real token and nothing here is market data.</span>
      </div>

      <div className="db-head">
        <div>
          <h3>KRAUSER COIN <span className="db-tick">$KRAUS</span></h3>
          <p className="muted">Total supply: {num(supply)} (1 billion)</p>
        </div>
        <div className="db-actions">
          <button className="btn ghost" onClick={() => setSeed(s => s + 1)}>New simulation</button>
        </div>
      </div>

      <div className="db-cards">
        {cards.map(([label, value, sub, upDown]) => (
          <div className="db-card" key={label}>
            <div className="db-cardtop"><span className="db-label">{label}</span><Sim /></div>
            <strong>{value}</strong>
            <span className={`db-sub ${upDown === null ? '' : upDown ? 'up' : 'down'}`}>{sub}</span>
          </div>
        ))}
      </div>

      <div className="db-main">
        <div className="db-panel db-chartpanel">
          <div className="db-panelhead">
            <div>
              <span className="db-label">Price chart</span> <Sim>SIMULATION</Sim>
            </div>
            <div className="db-seg" role="tablist" aria-label="Time range">
              {Object.keys(TF).map(k => (
                <button key={k} role="tab" aria-selected={tf === k} className={tf === k ? 'on' : ''} onClick={() => setTf(k)}>{k}</button>
              ))}
            </div>
          </div>
          <PriceChart data={data} tf={tf} />
          <div className="db-stats">
            <div><span className="db-label">High</span><b>{px(Math.max(...data.map(d => d.price)))}</b></div>
            <div><span className="db-label">Low</span><b>{px(Math.min(...data.map(d => d.price)))}</b></div>
            <div><span className="db-label">Simulated volume ({tf})</span><b>{usd(volume)}</b></div>
          </div>
        </div>

        <div className="db-panel">
          <div className="db-panelhead">
            <div><span className="db-label">Trading activity</span> <Sim>SIMULATION</Sim></div>
            <button className={`db-live ${live ? 'on' : ''}`} onClick={() => setLive(!live)} aria-pressed={live}>
              <i /> {live ? 'Feed running' : 'Feed paused'}
            </button>
          </div>
          <div className="db-pressure" aria-label={`Simulated buy share ${buyPct} percent`}>
            <div className="b" style={{ width: `${buyPct}%` }} />
            <div className="s" style={{ width: `${100 - buyPct}%` }} />
          </div>
          <div className="db-pressurelabels"><span className="up">Buys {buyPct}%</span><span className="down">Sells {100 - buyPct}%</span></div>
          <div className="db-seg small" role="tablist" aria-label="Filter trades">
            {[['all', 'All'], ['buy', 'Buys'], ['sell', 'Sells']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <ul className="db-trades">
            {shown.map(t => (
              <li key={t.id} className={t.buy ? 'buy' : 'sell'}>
                <span className="side">{t.buy ? 'Buy' : 'Sell'}</span>
                <span>{num(t.qty)} $KRAUS</span>
                <span className="muted">{usd(t.total)}</span>
                <span className="muted who">{t.who} · {ago(t.minsAgo)}</span>
              </li>
            ))}
            {!shown.length && <li className="empty">No simulated trades match this filter yet.</li>}
          </ul>
        </div>
      </div>

      <div className="db-info">
        <div className="db-panel">
          <div className="db-panelhead"><span className="db-label">Token information</span></div>
          <div className="db-supply"><span className="db-label">Total supply</span><b>{num(supply)}</b><span className="muted">1 billion $KRAUS (proposed)</span></div>
          <ul className="db-alloc">
            {allocation.map(a => (
              <li key={a.name}>
                <div className="top"><span>{a.name}</span><b>{a.pct}%</b></div>
                <div className="bar"><div style={{ width: `${a.pct}%`, background: a.color, boxShadow: `0 0 10px ${a.color}` }} /></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="db-panel">
          <div className="db-panelhead"><span className="db-label">Addresses</span> <Sim>PLACEHOLDER</Sim></div>
          <p className="muted db-warn">These are labelled placeholders, not real contract or wallet addresses. No token exists. Never send funds to any address claiming to be $KRAUS.</p>
          <CopyRow label="Token address (placeholder)" value={PLACEHOLDER_TOKEN} />
          <CopyRow label="Liquidity pool (placeholder)" value={PLACEHOLDER_POOL} />
          <p className="muted db-warn">No wallet connection or trading is available on this site.</p>
        </div>
      </div>
    </div>
  )
}
