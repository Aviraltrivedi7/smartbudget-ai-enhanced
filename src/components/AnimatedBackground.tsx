import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

interface Particle {
  id: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  x: number;
  y: number;
  shape: 'circle' | 'square' | 'diamond';
}

interface FloatingIcon {
  id: number;
  icon: React.ReactNode;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

const AnimatedBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);

  useEffect(() => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];

    const shapes: Array<'circle' | 'square' | 'diamond'> = ['circle', 'square', 'diamond'];

    const newParticles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 30,
      duration: Math.random() * 20 + 15,
      x: Math.random() * 100,
      y: Math.random() * 100,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));

    const icons = [
      <DollarSign className="w-6 h-6" />,
      <TrendingUp className="w-6 h-6" />,
      <PieChart className="w-6 h-6" />,
      <BarChart3 className="w-6 h-6" />,
    ];

    const newFloatingIcons: FloatingIcon[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 15,
      duration: Math.random() * 10 + 20,
    }));

    setParticles(newParticles);
    setFloatingIcons(newFloatingIcons);
  }, []);

  const getShapeClass = (shape: string) => {
    switch (shape) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-lg';
      case 'diamond': return 'rounded-lg transform rotate-45';
      default: return 'rounded-full';
    }
  };

  return (
    <>
      {/* Enhanced animated gradient background */}
      <div 
        className="fixed inset-0 -z-50"
        style={{
          background: 'linear-gradient(-45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1), rgba(240, 147, 251, 0.08), rgba(245, 87, 108, 0.1))',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 20s ease infinite'
        }}
      />
      
      {/* Enhanced floating geometric shapes */}
      <div className="fixed inset-0 -z-40 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute opacity-60 ${getShapeClass(particle.shape)}`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              top: `${particle.y}%`,
              left: `${particle.x}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              animation: `drift ${particle.duration}s linear infinite`,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
        
        {/* Floating financial icons */}
        {floatingIcons.map((iconData) => (
          <div
            key={iconData.id}
            className="absolute text-blue-400/30 float-animation"
            style={{
              top: `${iconData.y}%`,
              left: `${iconData.x}%`,
              animationDelay: `${iconData.delay}s`,
              animationDuration: `${iconData.duration}s`,
            }}
          >
            {iconData.icon}
          </div>
        ))}
        
        {/* Glowing particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute animate-pulse opacity-40"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              borderRadius: '50%',
              background: `hsl(${Math.random() * 360}, 70%, 60%)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              boxShadow: `0 0 ${10 + Math.random() * 20}px currentColor`,
            }}
          />
        ))}
      </div>

      {/* Enhanced morphing background shapes */}
      <div className="fixed inset-0 -z-30 overflow-hidden">
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 morphing-shape opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%)',
            filter: 'blur(1px)',
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-80 h-80 morphing-shape opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.1) 100%)',
            animationDelay: '4s',
            filter: 'blur(1px)',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-60 h-60 morphing-shape opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.1) 100%)',
            animationDelay: '8s',
            animationDuration: '12s',
            filter: 'blur(2px)',
          }}
        />
      </div>

      {/* Enhanced orbiting elements */}
      <div className="fixed top-1/2 left-1/2 -z-20 opacity-40">
        <div 
          className="orbiting-element absolute w-6 h-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, rgba(102, 126, 234, 0.2) 100%)',
            boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)',
          }}
        />
        <div 
          className="orbiting-element absolute w-4 h-4 rounded-full"
          style={{ 
            animationDelay: '10s', 
            animationDuration: '25s',
            background: 'radial-gradient(circle, rgba(240, 147, 251, 0.6) 0%, rgba(240, 147, 251, 0.2) 100%)',
            boxShadow: '0 0 15px rgba(240, 147, 251, 0.4)',
          }}
        />
        <div 
          className="orbiting-element absolute w-3 h-3 rounded-full"
          style={{ 
            animationDelay: '5s', 
            animationDuration: '35s',
            background: 'radial-gradient(circle, rgba(67, 233, 123, 0.6) 0%, rgba(67, 233, 123, 0.2) 100%)',
            boxShadow: '0 0 10px rgba(67, 233, 123, 0.4)',
          }}
        />
      </div>

      {/* Interactive hover effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`interactive-${i}`}
            className="absolute w-32 h-32 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
              background: `radial-gradient(circle, hsl(${i * 72}, 70%, 60%) 0%, transparent 70%)`,
              animation: `pulse 4s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default AnimatedBackground;