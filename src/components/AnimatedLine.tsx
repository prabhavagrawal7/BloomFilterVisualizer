import React, { useEffect, useState } from 'react';
import styles from './AnimatedLine.module.css';

interface AnimatedLineProps {
  startX: number;
  startY: number;
  angle: number;
  distance: number;
  duration: number;
  color?: string;
  thickness?: number;
}

const AnimatedLine: React.FC<AnimatedLineProps> = ({
  startX,
  startY,
  angle,
  distance,
  duration,
  color = '#4285f4',
  thickness = 2
}) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // Start animation after a short delay to ensure mounting is complete
    const animationId = requestAnimationFrame(() => {
      setWidth(distance);
    });
    
    // Clean up animation frame on unmount
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [distance]);
  
  return (
    <div
      className={styles.animatedLine}
      style={{
        top: `${startY}px`,
        left: `${startX}px`,
        width: `${width}px`,
        height: `${thickness}px`,
        backgroundColor: color,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'left center',
        transition: `width ${duration}ms ease-out`,
      }}
    />
  );
};

export default AnimatedLine;