import React, { useRef, useEffect } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation } from '../hooks/useAnimation';
import AnimatedLine from './AnimatedLine';
import styles from './AnimationArea.module.css';

interface AnimationAreaProps {
  isAnimating?: boolean;
  bloomArrayRef?: React.RefObject<HTMLDivElement> | undefined;
}

const AnimationArea: React.FC<AnimationAreaProps> = ({ 
  isAnimating: externalIsAnimating,
  bloomArrayRef
}) => {
  const animationAreaRef = useRef<HTMLDivElement>(null);
  const { 
    currentAnimation, 
    isAnimating: contextIsAnimating, 
    animationSpeed, 
    setIsAnimating 
  } = useBloomFilter();
  
  // Use our React-friendly animation hook
  const { 
    lines, 
    labels, 
    highlightedBits, 
    animateAddWord, 
    clearAnimations 
  } = useAnimation();
  
  // Use either the prop or context value for animation state
  const isAnimating = externalIsAnimating !== undefined ? externalIsAnimating : contextIsAnimating;

  // Effect to handle animations when currentAnimation changes
  useEffect(() => {
    // Only proceed if there's an animation to show
    if (!currentAnimation || !bloomArrayRef?.current || !animationAreaRef.current) return;
    
    // Handle different animation types
    if (currentAnimation.type === 'add' || currentAnimation.type === 'check') {
      const { word, positions } = currentAnimation.data as { word: string; positions: number[] };
      if (!word || !positions.length) {
        setIsAnimating(false);
        return;
      }
      
      // Get bit elements
      const bitElements = bloomArrayRef.current.querySelectorAll('.bit') as NodeListOf<HTMLElement>;
      if (!bitElements.length) {
        setIsAnimating(false);
        return;
      }
      
      // Use the declarative animation function
      animateAddWord(
        word, 
        positions, 
        animationAreaRef.current, 
        bitElements, 
        () => setIsAnimating(false)
      );
    } else {
      setIsAnimating(false);
    }
    
    // Clean up animation on unmount or when animation changes
    return () => {
      clearAnimations();
    };
  }, [currentAnimation, bloomArrayRef, animationSpeed, setIsAnimating, animateAddWord, clearAnimations]);

  // Effect to highlight bits in the bloom array
  useEffect(() => {
    if (!bloomArrayRef?.current) return;
    
    // Clear all previous highlights
    const bitElements = bloomArrayRef.current.querySelectorAll('.bit');
    bitElements.forEach(el => el.classList.remove('highlight'));
    
    // Apply highlights to specified bits
    highlightedBits.forEach(bitIndex => {
      if (bitElements[bitIndex]) {
        bitElements[bitIndex].classList.add('highlight');
      }
    });
    
    // Clean up on unmount
    return () => {
      if (bloomArrayRef.current) {
        const elements = bloomArrayRef.current.querySelectorAll('.bit');
        elements.forEach(el => el.classList.remove('highlight'));
      }
    };
  }, [highlightedBits, bloomArrayRef]);

  return (
    <div className={styles.animationArea} ref={animationAreaRef}>
      {/* Render animated lines using our new component */}
      {lines.map(line => (
        <AnimatedLine
          key={line.id}
          startX={line.startX}
          startY={line.startY}
          angle={line.angle}
          distance={line.distance}
          duration={300 / animationSpeed}
          color="#4285f4"
          thickness={2}
        />
      ))}
      
      {/* Render text labels */}
      {labels.map(label => (
        <div
          key={label.id}
          id={label.id}
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

export default AnimationArea;