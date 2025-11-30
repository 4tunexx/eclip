'use client';

import React, { useState, useEffect } from 'react';

const Particles = () => {
  const [particles, setParticles] = useState<JSX.Element[] | null>(null);
  const particleCount = 75;

  useEffect(() => {
    const generatedParticles = Array.from({ length: particleCount }).map((_, i) => {
      const size = Math.random() * 4 + 1;
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 8 + 7; // 7 to 15 seconds
      const animationDelay = Math.random() * 15;

      return (
        <div
          key={i}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            animationDuration: `${animationDuration}s`,
            animationDelay: `${animationDelay}s`,
          }}
        />
      );
    });
    setParticles(generatedParticles);
  }, []); // Empty dependency array ensures this runs only once on the client

  return <div className="particle-container">{particles}</div>;
};

export default Particles;
