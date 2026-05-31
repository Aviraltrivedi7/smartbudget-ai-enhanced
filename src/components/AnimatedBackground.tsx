import React, { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

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
      'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
      'linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%)',
      'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
      'linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(57, 249, 215, 0.15) 100%)',
    ];

    const shapes: Array<'circle' | 'square' | 'diamond'> = ['circle', 'square', 'diamond'];

    // Reduced count from 35 to 8 for massive performance improvement
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 20, // slightly smaller to reduce GPU fillrate
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 15,
      duration: Math.random() * 15 + 15,
      x: Math.random() * 100,
      y: Math.random() * 100,
      shape: shapes[Math.floor(Math.random() * shapes.shape.length)] || 'circle',
    }));

    const icons = [
      <IndianRupee className="w-5 h-5" />,
      <TrendingUp className="w-5 h-5" />,
      <PieChart className="w-5 h-5" />,
      <BarChart3 className="w-5 h-5" />,
    ];

    // Reduced count from 12 to 4 to prevent layout/animation overhead
    const newFloatingIcons: FloatingIcon[] = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      icon: icons[i % icons.length],
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
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
        className="fixed inset-0 -z-50 smooth-load gpu-accelerated"
        style={{
          background: 'linear-gradient(-45deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05), rgba(240, 147, 251, 0.04), rgba(245, 87, 108, 0.05))',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 25s ease infinite',
        }}
      />

      {/* Enhanced floating geometric shapes */}
      <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute opacity-40 gpu-accelerated ${getShapeClass(particle.shape)}`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              top: `${particle.y}%`,
              left: `${particle.x}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              animation: `drift ${particle.duration}s linear infinite`,
            }}
          />
        ))}

        {/* Floating financial icons */}
        {floatingIcons.map((iconData) => (
          <div
            key={iconData.id}
            className="absolute text-blue-500/20 float-animation gpu-accelerated"
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

        {/* Glowing particles - reduced count from 15 to 4 */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute animate-pulse opacity-25 gpu-accelerated"
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: `hsl(${i * 90}, 70%, 65%)`,
              top: `${10 + i * 22}%`,
              left: `${15 + i * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '5s',
              boxShadow: '0 0 10px currentColor',
            }}
          />
        ))}
      </div>

      {/* Enhanced morphing background shapes - optimized size and opacity */}
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 right-1/4 w-72 h-72 morphing-shape opacity-15 gpu-accelerated"
          style={{
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 morphing-shape opacity-10 gpu-accelerated"
          style={{
            background: 'radial-gradient(circle, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.05) 100%)',
            animationDelay: '3s',
          }}
        />
      </div>

      {/* Orbiting elements - optimized to prevent pixel pipeline stalling */}
      <div className="fixed top-1/2 left-1/2 -z-20 opacity-20 pointer-events-none">
        <div
          className="orbiting-element absolute w-4 h-4 rounded-full gpu-accelerated"
          style={{
            background: 'rgba(102, 126, 234, 0.4)',
            boxShadow: '0 0 10px rgba(102, 126, 234, 0.3)',
          }}
        />
        <div
          className="orbiting-element absolute w-3 h-3 rounded-full gpu-accelerated"
          style={{
            animationDelay: '5s',
            animationDuration: '25s',
            background: 'rgba(240, 147, 251, 0.4)',
            boxShadow: '0 0 8px rgba(240, 147, 251, 0.3)',
          }}
        />
      </div>
    </>
  );
};

export default AnimatedBackground;