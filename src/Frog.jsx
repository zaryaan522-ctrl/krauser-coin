export default function Frog({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 400 400" role="img" aria-label="Cool green frog wearing black sunglasses and a golden crown">
      <defs>
        <radialGradient id="skin" cx="50%" cy="40%" r="65%">
          <stop offset="0" stopColor="#7dff5a" />
          <stop offset="1" stopColor="#1fbf1f" />
        </radialGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff08a" />
          <stop offset="1" stopColor="#e0a800" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {/* body */}
      <ellipse cx="200" cy="350" rx="120" ry="60" fill="url(#skin)" />
      {/* head */}
      <ellipse cx="200" cy="235" rx="150" ry="115" fill="url(#skin)" filter="url(#glow)" />
      {/* eye bumps */}
      <circle cx="115" cy="140" r="52" fill="url(#skin)" />
      <circle cx="285" cy="140" r="52" fill="url(#skin)" />
      {/* sunglasses */}
      <rect x="62" y="125" width="110" height="64" rx="26" fill="#000" stroke="#b026ff" strokeWidth="4" />
      <rect x="228" y="125" width="110" height="64" rx="26" fill="#000" stroke="#b026ff" strokeWidth="4" />
      <rect x="170" y="145" width="60" height="10" fill="#000" />
      <path d="M78 140 L120 140 L96 176 Z" fill="#fff" opacity=".18" />
      <path d="M244 140 L286 140 L262 176 Z" fill="#fff" opacity=".18" />
      {/* nostrils + smirk */}
      <circle cx="184" cy="226" r="5" fill="#0c6b0c" />
      <circle cx="216" cy="226" r="5" fill="#0c6b0c" />
      <path d="M110 262 Q200 330 290 258" fill="none" stroke="#073d07" strokeWidth="9" strokeLinecap="round" />
      <path d="M290 258 q12 -4 16 -16" fill="none" stroke="#073d07" strokeWidth="7" strokeLinecap="round" />
      {/* crown */}
      <path d="M125 78 L145 20 L175 62 L200 8 L225 62 L255 20 L275 78 Z" fill="url(#gold)" stroke="#a87800" strokeWidth="3" strokeLinejoin="round" />
      <rect x="125" y="74" width="150" height="16" rx="6" fill="url(#gold)" stroke="#a87800" strokeWidth="3" />
      <circle cx="145" cy="20" r="6" fill="#b026ff" />
      <circle cx="200" cy="8" r="7" fill="#39ff14" />
      <circle cx="255" cy="20" r="6" fill="#b026ff" />
    </svg>
  )
}
