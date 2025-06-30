import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';

interface QuantumIntroProps {
  onComplete: () => void;
}

export const QuantumIntro: React.FC<QuantumIntroProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 7000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#E0E0E0] flex items-center justify-center relative overflow-hidden">
      {/* Quantum Particles Animation */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#666666]/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <div className="text-center relative z-10">
        <div className="mb-4 animate-pulse">
          <Shield className="h-20 w-20 text-[#666666] mx-auto transition-all duration-500 hover:scale-110" />
        </div>
        <h1 className="text-5xl font-bold text-[#333333] mb-2 drop-shadow-sm">
          BLACKBOX AI
        </h1>
        <h2 className="text-3xl font-semibold text-[#666666] mb-4">
          QUANTUM FIREWALL
        </h2>
        <p className="text-xl text-[#666666] max-w-md mx-auto">
          Initializing quantum security protocols. Please wait...
        </p>
      </div>
    </div>
  );
};

// CSS Animation
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);