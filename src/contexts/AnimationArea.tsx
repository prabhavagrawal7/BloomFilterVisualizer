import React, { useRef, useEffect, memo } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation } from '../contexts/AnimationContext';
import { useAnimationEffects } from '../hooks/useAnimationEffects';
import AnimatedLine from './AnimatedLine';
import styles from './AnimationArea.module.css';

interface AnimationAreaProps {
  bloomArrayRef?: React.RefObject<HTMLDivElement> | undefined;
}

const AnimationArea: React.FC<AnimationAreaProps> = memo(({ 
  bloomArrayRef
}) => {
  const animationAreaRef = useRef<HTMLDivElement>(null);
  const { currentAnimation } = useBloomFilter();
  const { isAnimating } = useAnimation();
  
  // Use our React-friendly animation hook
  const { 
    lines, 
    labels, 
    animateAddWord, 
    clearAnimations 
  } = useAnimationEffects();

  // Use a ref to track the animation that's currently being processed
  const processedAnimationRef = useRef<string | null>(null);
  
  // Effect to handle animations when currentAnimation changes
  useEffect(() => {
    // Only proceed if there's a new animation to show and we're in animating state
    if (!isAnimating || 
        !currentAnimation || 
        !bloomArrayRef?.current || 
        !animationAreaRef.current ||
        // Skip if we already processed this animation (prevents infinite loops)
        processedAnimationRef.current === currentAnimation.id) {
      return;
    }
    
    // Mark this animation as being processed
    processedAnimationRef.current = currentAnimation.id;
    
    // Handle different animation types
    if (currentAnimation.type === 'add' || currentAnimation.type === 'check') {
      const { word, positions } = currentAnimation.data as { word: string; positions: number[] };
      
      // Get bit elements
      const bitElements = Array.from(
        bloomArrayRef.current.querySelectorAll('.bit-element')
      ) as HTMLElement[];
      
      // Run the animation
      animateAddWord(
        word,
        positions,
        bitElements,
        animationAreaRef.current
      );
    }
    
    // Clean up when unmounting or when animation changes
    return () => {
      // Reset the processed animation ref if this effect is cleaning up
      if (processedAnimationRef.current === currentAnimation?.id) {
        processedAnimationRef.current = null;
      }
    };
  }, [isAnimating, currentAnimation, bloomArrayRef, animateAddWord]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      clearAnimations();
    };
  }, [clearAnimations]);

  return (
    <div className={styles.animationArea} ref={animationAreaRef}>
      {/* Animated lines */}
      {lines.map((line) => (
        <AnimatedLine
          key={line.id}
          startX={line.startX}
          startY={line.startY}
          angle={line.angle}
          distance={line.distance}
          duration={300}
          color="#4285f4"
          thickness={2}
        />
      ))}
      
      {/* Text labels */}
      {labels.map((label) => (
        <div
          key={label.id}
          className={styles.hashLabel}
          style={{
            position: 'absolute',
            top: `${label.top}px`,
            left: label.left,
            transform: 'translateX(-50%)'
          }}
        >
          {label.text}
        </div>
      ))}
    </div>
  );
};

});

export default AnimationArea;
