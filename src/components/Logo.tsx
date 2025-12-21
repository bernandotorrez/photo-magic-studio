interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon/Symbol */}
      <div className={`${sizeClasses[size]} aspect-square relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Pixel squares on top left */}
          <rect x="40" y="45" width="15" height="15" fill="#3b82f6" rx="2" />
          <rect x="60" y="58" width="20" height="20" fill="#3b82f6" rx="2" />
          <rect x="75" y="75" width="25" height="25" fill="#5b8ff9" rx="2" />
          <rect x="35" y="75" width="12" height="12" fill="#60a5fa" rx="2" />
          
          {/* Main sparkle/star with 8 pointed rays */}
          <g transform="translate(100, 100)">
            {/* Top ray */}
            <path d="M 0,-80 L 8,-20 L 0,-15 L -8,-20 Z" fill="url(#blueGrad)" />
            
            {/* Top-right ray */}
            <path d="M 56,-56 L 14,-14 L 10,-18 L 18,-22 Z" fill="url(#purpleGrad)" />
            
            {/* Right ray */}
            <path d="M 80,0 L 20,8 L 15,0 L 20,-8 Z" fill="url(#purpleGrad)" />
            
            {/* Bottom-right ray */}
            <path d="M 56,56 L 14,14 L 18,10 L 22,18 Z" fill="url(#purpleGrad)" />
            
            {/* Bottom ray */}
            <path d="M 0,80 L 8,20 L 0,15 L -8,20 Z" fill="url(#purpleGrad)" />
            
            {/* Bottom-left ray */}
            <path d="M -56,56 L -14,14 L -10,18 L -18,22 Z" fill="url(#blueGrad)" />
            
            {/* Left ray */}
            <path d="M -80,0 L -20,8 L -15,0 L -20,-8 Z" fill="url(#blueGrad)" />
            
            {/* Top-left ray */}
            <path d="M -56,-56 L -14,-14 L -18,-10 L -22,-18 Z" fill="url(#blueGrad)" />
            
            {/* Center circle */}
            <circle cx="0" cy="0" r="8" fill="white" />
          </g>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#5b8ff9" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap`}>
          PixelNova AI
        </span>
      )}
    </div>
  );
}
