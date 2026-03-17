import React, { useMemo } from 'react';
import './Sakura.css';

interface PetalProps {
  id: number;
}

const Petal: React.FC<PetalProps> = () => {
  const style = useMemo(() => {
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 15;
    const delay = Math.random() * -20;
    const size = 10 + Math.random() * 15;
    const rotate = Math.random() * 360;
    
    return {
      left: `${left}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      width: `${size}px`,
      height: `${size * 0.8}px`,
      transform: `rotate(${rotate}deg)`,
    } as React.CSSProperties;
  }, []);

  return <div className="sakura-petal" style={style} />;
};

export const SakuraEffect: React.FC = () => {
  const petals = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);
  
  return (
    <div className="sakura-container" aria-hidden="true">
      {petals.map((id) => (
        <Petal key={id} id={id} />
      ))}
    </div>
  );
};
