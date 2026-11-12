import { useEffect, useMemo, useState } from 'react'
import Frog from './Frog.jsx'

// Add your real links here when they exist. Empty = shows "coming soon".
const LINKS = { telegram: '', x: '' }

const NAV = [
  ['about', 'About'],
  ['tokenomics', 'Tokenomics'],
  ['chart', 'Chart'],
  ['roadmap', 'Roadmap'],
  ['community', 'Community'],
]

const SUPPLY = 1_000_000_000
const ALLOCATION = [
  { name: 'Community and liquidity', pct: 50, color: '#39ff14' },
  { name: 'Ecosystem', pct: 20, color: '#b026ff' },
  { name: 'Marketing', pct: 15, color: '#8dffb4' },
  { name: 'Treasury', pct: 10, color: '#d68cff' },
  { name: 'Creator allocation', pct: 5, color: '#ffd34d' },
]

const ROADMAP = [
  { phase: 'Phase 1: Spawn', text: 'Brand, mascot and website. Publish the concept and this disclaimer-first landing page.' },
  { phase: 'Phase 2: Hop', text: 'Open the Telegram and X communities. Run meme contests and gather feedback on the concept.' },
  { phase: 'Phase 3: Crown', text: 'Release community-made art packs, stickers and a mascot style guide.' },
  { phase: 'Phase 4: Kingdom', text: 'Review the experiment in public, publish lessons learned and decide what comes next.' },
]

function makeSeries(n = 80) {
  let v = 100
  const out = []
  for (let i = 0; i < n; i++) {
    v = Math.max(20, v + (Math.random() - 0.47) * 8)
    out.push(v)
  }
  return out
}

function SimChart() {
  const [series, setSeries] = useState(makeSeries)
  const W = 800, H = 320, P = 20
  const { line, area } = useMemo(() => {
    const min = Math.min(...series), max = Math.max(...series)
    const pts = series.map((v, i) => [
      P + (i / (series.length - 1)) * (W - P * 2),
      H - P - ((v - min) / (max - min || 1)) * (H - P * 2),
    ])
    const l = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
    return { line: l, area: `${l} L${W - P} ${H - P} L${P} ${H - P} Z` }
  }, [series])

  return (
    <div className="chart-card">
      <div className="chart-top">
        <span className="badge">SIMULATION</span>
        <span className="muted">Random data generated in your browser. Not a price, not live, not real.</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Simulated random chart, not real market data">
        <defs>
          <linearGradient id="fillg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b026ff" stopOpacity=".5" />
            <stop offset="1" stopColor="#b026ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[1, 2, 3].map(i => <line key={i} x1={P} x2={W - P} y1={(H / 4) * i} y2={(H / 4) * i} className="grid" />)}
        <path d={area} fill="url(#fillg)" />
        <path d={line} className="chartline" key={line} />
        <text x={W / 2} y={H / 2} textAnchor="middle" className="watermark">SIMULATION</text>
      </svg>
      <button className="btn ghost" onClick={() => setSeries(makeSeries())}>Generate new simulation</button>
    </div>
  )
}

function CommunityLink({ href, label, note }) {
  const live = Boolean(href)
  return (
    <a
      className={`social ${live ? '' : 'off'}`}
      href={live ? href : undefined}
      target="_blank"
      rel="noreferrer noopener"
      aria-disabled={!live}
      onClick={e => !live && e.preventDefault()}
    >
      <strong>{label}</strong>
      <span>{live ? note : 'Link coming soon'}</span>
    </a>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const donut = useMemo(() => {
    let acc = 0
    return ALLOCATION.map(a => { const s = acc; acc += a.pct; return `${a.color} ${s}% ${acc}%` }).join(', ')
  }, [])

  const go = id => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <>
      <div className="notice">Experimental fictional project. Not a real cryptocurrency, not for sale, not financial advice.</div>

      <header className={`nav ${scrolled ? 'solid' : ''}`}>
        <a href="#top" className="logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          KRAUSER<span>COIN</span>
        </a>
        <button className="burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <i /><i /><i />
        </button>
        <nav className={open ? 'open' : ''}>
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); go(id) }}>{label}</a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="ticker">$KRAUS</p>
            <h1>KRAUSER <em>COIN</em></h1>
            <p className="lead">A frog with sunglasses, a golden crown and zero real-world utility. A meme concept built to explore branding and community, nothing more.</p>
            <div className="cta">
              <button className="btn primary" onClick={() => go('about')}>Meet the frog</button>
              <button className="btn ghost" onClick={() => go('tokenomics')}>See the proposed tokenomics</button>
            </div>
          </div>
          <div className="hero-art">
            <div className="halo" />
            <Frog className="frog" />
          </div>
        </section>

        <section id="about" className="section">
          <h2>About the project</h2>
          <div className="two">
            <p>KRAUSER COIN is a fictional memecoin concept. There is no token, no smart contract, no sale and no wallet connection on this site. It exists as a design and community experiment.</p>
            <p>The mascot is a cool green frog who wears black sunglasses and a golden crown. Everything you see here is a proposal. If the idea ever changes, this page will say so clearly.</p>
          </div>
          <ul className="facts">
            <li><strong>No transactions</strong>Nothing on this site can send, receive or swap anything.</li>
            <li><strong>No live data</strong>No prices, trading volume or holder counts are shown, because none exist.</li>
            <li><strong>No promises</strong>Nothing here suggests returns or value. Memes are for fun.</li>
          </ul>
        </section>

        <section id="tokenomics" className="section">
          <h2>Proposed tokenomics</h2>
          <p className="muted">A proposal for a fictional token. Total supply: <b>{SUPPLY.toLocaleString('en-US')}</b> $KRAUS.</p>
          <div className="token">
            <div className="donut" style={{ background: `conic-gradient(${donut})` }} role="img" aria-label="Allocation donut chart">
              <div className="donut-hole"><b>1B</b><span>total supply</span></div>
            </div>
            <ul className="alloc">
              {ALLOCATION.map(a => (
                <li key={a.name}>
                  <span className="dot" style={{ background: a.color }} />
                  <span className="an">{a.name}</span>
                  <span className="ap">{a.pct}%</span>
                  <span className="aa">{((SUPPLY * a.pct) / 100).toLocaleString('en-US')}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="chart" className="section">
          <h2>Market chart</h2>
          <p className="muted">A visual placeholder only. The line is random and regenerates on demand.</p>
          <SimChart />
        </section>

        <section id="roadmap" className="section">
          <h2>Roadmap</h2>
          <ol className="road">
            {ROADMAP.map(r => (
              <li key={r.phase}><h3>{r.phase}</h3><p>{r.text}</p></li>
            ))}
          </ol>
        </section>

        <section id="community" className="section">
          <h2>Community</h2>
          <p className="muted">Our channels are not open yet. These are placeholders.</p>
          <div className="socials">
            <CommunityLink href={LINKS.telegram} label="Telegram" note="Join the chat" />
            <CommunityLink href={LINKS.x} label="X" note="Follow for updates" />
          </div>
        </section>
      </main>

      <footer className="footer">
        <Frog className="mini" />
        <p>© {new Date().getFullYear()} KRAUSER COIN ($KRAUS). All rights reserved.</p>
        <p className="muted">Experimental fictional project for entertainment. Not a financial product, not investment advice, and not an offer to sell anything. Do not buy any token claiming to be $KRAUS.</p>
      </footer>
    </>
  )
}
