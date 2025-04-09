import React, { useRef, useEffect } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
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
  const { currentAnimation, isAnimating: contextIsAnimating, animationSpeed, setIsAnimating } = useBloomFilter();
  
  // Use either the prop or context value for animation state
  const isAnimating = externalIsAnimating !== undefined ? externalIsAnimating : contextIsAnimating;

  // Clear animation area
  const clearAnimations = () => {
    if (!animationAreaRef.current) return;
    
    // Remove existing hash paths and labels
    const existingElements = animationAreaRef.current.querySelectorAll('.hash-path, .hash-label');
    existingElements.forEach(el => el.remove());
  };

  // Create and animate a path between two elements
  const createAnimatedPath = (sourceElement: HTMLElement, targetElement: HTMLElement) => {
    if (!animationAreaRef.current) return;
    
    // Get positions
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = animationAreaRef.current.getBoundingClientRect();
    
    // Calculate start and end positions
    const startX = sourceRect.left + sourceRect.width / 2 - containerRect.left;
    const startY = sourceRect.bottom - containerRect.top;
    const endX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const endY = targetRect.top - containerRect.top;
    
    // Calculate path properties
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Create path element
    const path = document.createElement('div');
    path.className = 'hash-path';
    path.style.position = 'absolute';
    path.style.top = `${startY}px`;
    path.style.left = `${startX}px`;
    path.style.width = '0';
    path.style.height = '2px'; // Set a consistent height for the line
    path.style.backgroundColor = '#4285f4'; // Set a visible color
    path.style.transformOrigin = 'left center'; // Set transform origin to left side
    path.style.transform = `rotate(${angle}deg)`;
    path.style.transition = `width ${300 / animationSpeed}ms ease-out`; // Add smooth transition
    animationAreaRef.current.appendChild(path);
    
    // Animate path drawing - use setTimeout to ensure DOM updates first
    setTimeout(() => {
      path.style.width = `${distance}px`;
      targetElement.classList.add('highlight');
    }, 10);
    
    return path;
  };

  // Effect to handle animations when currentAnimation changes
  useEffect(() => {
    // Only proceed if there's an animation to show
    if (!currentAnimation || !isAnimating || !bloomArrayRef?.current) return;
    
    clearAnimations();
    
    // Handle different animation types
    if (currentAnimation.type === 'add' || currentAnimation.type === 'check') {
      const { word, positions } = currentAnimation.data as { word: string; positions: number[] };
      if (!word || !positions.length) return;
      
      // Get bit elements
      const bitElements = Array.from(bloomArrayRef.current.querySelectorAll('.bit')) as HTMLElement[];
      if (!bitElements.length) return;
      
      // Create word element
      const wordElement = document.createElement('div');
      wordElement.className = 'hash-label';
      wordElement.textContent = `"${word}"`;
      wordElement.style.position = 'absolute';
      wordElement.style.top = '10px';
      wordElement.style.left = '50%';
      wordElement.style.transform = 'translateX(-50%)';
      animationAreaRef.current?.appendChild(wordElement);
      
      // Animate each hash position
      positions.forEach((position, index) => {
        setTimeout(() => {
          if (!animationAreaRef.current || !bitElements[position]) return;
          
          // Create hash label
          const hashLabel = document.createElement('div');
          hashLabel.className = 'hash-label';
          hashLabel.textContent = `Hash ${index + 1} → ${position}`;
          hashLabel.style.position = 'absolute';
          hashLabel.style.top = '50px';
          hashLabel.style.left = '50%';
          hashLabel.style.transform = 'translateX(-50%)';
          animationAreaRef.current.appendChild(hashLabel);
          
          // Create animated path between label and bit
          if (bitElements[position]) {
            createAnimatedPath(hashLabel, bitElements[position]);
          }
          
          // Complete animation after all hash functions have been visualized
          if (index === positions.length - 1) {
            setTimeout(() => {
              setIsAnimating(false);
            }, 1000 / animationSpeed);
          }
        }, index * 800 / animationSpeed);
      });
    }
    
    // Clean up animation on unmount or when animation changes
    return () => {
      clearAnimations();
    };
  }, [currentAnimation, isAnimating, bloomArrayRef, animationSpeed, setIsAnimating]);

  return (
    <div className={styles.animationArea} ref={animationAreaRef}>
      {/* Animation elements will be added dynamically */}
    </div>
  );
};

export default AnimationArea;