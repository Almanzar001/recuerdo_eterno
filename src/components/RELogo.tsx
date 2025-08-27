export default function RELogo({ size = 60 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
        className="transform rotate-45"
      >
        {/* Borde dorado del diamante */}
        <rect
          x="10"
          y="10"
          width="100"
          height="100"
          fill="white"
          stroke="#D4AF37"
          strokeWidth="3"
          rx="8"
        />
        
        {/* Corazón dorado */}
        <g transform="translate(60,25)">
          <path
            d="M0,15 C0,10 4,6 8,6 C12,6 16,10 16,15 C16,10 20,6 24,6 C28,6 32,10 32,15 C32,25 16,35 16,35 C16,35 0,25 0,15 Z"
            fill="url(#heartGradient)"
            transform="translate(-16,-6) scale(0.6)"
          />
        </g>
        
        {/* Texto RE */}
        <g transform="translate(60,55)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="28"
            fontWeight="bold"
            fontFamily="serif"
            fill="black"
          >
            RE
          </text>
        </g>
        
        {/* Decoraciones florales */}
        <g transform="translate(60,85)">
          {/* Flor central */}
          <circle cx="0" cy="0" r="4" fill="url(#flowerGradient)" />
          <circle cx="0" cy="-6" r="2" fill="url(#flowerGradient)" />
          <circle cx="0" cy="6" r="2" fill="url(#flowerGradient)" />
          <circle cx="-6" cy="0" r="2" fill="url(#flowerGradient)" />
          <circle cx="6" cy="0" r="2" fill="url(#flowerGradient)" />
          
          {/* Ramas decorativas */}
          <path
            d="M-15,-3 Q-10,-1 -8,0 Q-10,1 -15,3"
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M15,-3 Q10,-1 8,0 Q10,1 15,3"
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        </g>
        
        {/* Gradientes */}
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="flowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}