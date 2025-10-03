import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const AnimatedBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'hsl(var(--primary) / 0.3)',
      'hsl(var(--digital-blue) / 0.2)',
      'hsl(var(--digital-purple) / 0.25)',
      'hsl(var(--digital-cyan) / 0.2)',
    ];

    const newParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 20,
      duration: Math.random() * 10 + 15,
    }));

    setParticles(newParticles);
  }, []);

  return (
    <>
      {/* Animated gradient background */}
      <div className="fixed inset-0 animated-bg -z-50" />
      
      {/* Floating geometric shapes */}
      <div className="fixed inset-0 -z-40 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle absolute rounded-full opacity-60"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              top: `${Math.random() * 100}vh`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Morphing background shapes */}
      <div className="fixed inset-0 -z-30 overflow-hidden">
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 morphing-shape opacity-20"
          style={{
            background: 'linear-gradient(45deg, hsl(var(--primary) / 0.3), hsl(var(--digital-purple) / 0.2))',
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-80 h-80 morphing-shape opacity-15"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--digital-blue) / 0.2), hsl(var(--digital-cyan) / 0.3))',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Orbiting elements */}
      <div className="fixed top-1/2 left-1/2 -z-20 opacity-30">
        <div className="orbiting-element absolute w-4 h-4 rounded-full bg-primary/40" />
        <div 
          className="orbiting-element absolute w-3 h-3 rounded-full bg-digital-blue/50" 
          style={{ animationDelay: '10s', animationDuration: '25s' }}
        />
        <div 
          className="orbiting-element absolute w-2 h-2 rounded-full bg-digital-purple/60" 
          style={{ animationDelay: '5s', animationDuration: '35s' }}
        />
      </div>
    </>
  );
};

export default AnimatedBackground;