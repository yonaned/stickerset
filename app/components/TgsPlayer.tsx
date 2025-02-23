// app/components/TgsPlayer.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export interface TgsPlayerProps {
  source: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
}

const TgsPlayer: React.FC<TgsPlayerProps> = ({ 
  source, 
  className, 
  autoplay = true, 
  loop = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay,
      path: source,
    });

    return () => animation.destroy();
  }, [source, autoplay, loop]);

  return <div ref={containerRef} className={className} />;
};

export default TgsPlayer;
