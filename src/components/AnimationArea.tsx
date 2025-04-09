import React, { useRef, useEffect, useState } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation } from '../hooks/useAnimation';
import styles from './AnimationArea.module.css';

interface AnimationAreaProps {
  isAnimating?: boolean;
  word?: string;
  positions?: number[];
  onAnimationEnd?: () => void;
  type?: 'add' | 'check' | 'remove';
  bloomArrayRef?: React.RefObject<HTMLDivElement>;
}

const AnimationArea: React.FC<AnimationAreaProps> = ({ 
  isAnimating: externalIsAnimating, 
  word, 
  positions = [],
  onAnimationEnd,
  type,
  bloomArrayRef
}) => {
  const animationAreaRef = useRef<HTMLDivElement>(null);
  const hashVisualizationRef = useRef<HTMLDivElement>(null);
  const { clearAnimations } = useAnimation();
  const { setIsAnimating, animationSpeed } = useBloomFilter();
  const [activeAnimation, setActiveAnimation] = useState(false);

  const isAnimating = externalIsAnimating !== undefined ? externalIsAnimating : activeAnimation;

  useEffect(() => {
    // Clear previous animations when component updates
    if (animationAreaRef.current) {
      clearAnimations(animationAreaRef.current);
    }
    return () => {
      if (animationAreaRef.current) {
        clearAnimations(animationAreaRef.current);
      }
    };
  }, [word, positions, clearAnimations]);

  // Animate adding a word
  const animateAddWord = (wordToAdd: string, positionsToHighlight: number[]) => {
    if (!animationAreaRef.current) return;
    
    setActiveAnimation(true);
    setIsAnimating(true);
    
    // Clear any existing animations
    clearAnimations(animationAreaRef.current);
    
    // Create a word element at the top
    const wordElement = document.createElement('div');
    wordElement.className = 'hash-label';
    wordElement.textContent = `"${wordToAdd}"`;
    wordElement.style.position = 'absolute';
    wordElement.style.top = '10px';
    wordElement.style.left = '50%';
    wordElement.style.transform = 'translateX(-50%)';
    animationAreaRef.current.appendChild(wordElement);
    
    // Get bit elements if bloomArrayRef is provided
    const bitElements = bloomArrayRef?.current?.querySelectorAll('.bit');
    
    // Animate each hash function
    positionsToHighlight.forEach((pos, idx) => {
      setTimeout(() => {
        if (!animationAreaRef.current) return;
        
        // Create hash function label
        const hashLabel = document.createElement('div');
        hashLabel.className = 'hash-label';
        hashLabel.textContent = `Hash ${idx + 1} → ${pos}`;
        hashLabel.style.position = 'absolute';
        hashLabel.style.top = '40px';
        hashLabel.style.left = '50%';
        hashLabel.style.transform = 'translateX(-50%)';
        animationAreaRef.current.appendChild(hashLabel);
        
        // Highlight bit if bit elements are available
        if (bitElements && bitElements[pos]) {
          const bitElement = bitElements[pos] as HTMLElement;
          
          // Create an animated path (simplified for now)
          const path = document.createElement('div');
          path.className = 'hash-path';
          path.style.position = 'absolute';
          path.style.height = '2px';
          path.style.backgroundColor = '#e74c3c';
          path.style.top = '60px'; // Position below hash label
          path.style.left = '50%';
          path.style.transform = 'translateX(-50%)';
          path.style.width = '0';
          animationAreaRef.current.appendChild(path);
          
          // Animate path
          setTimeout(() => {
            path.style.width = '100px'; // Simple animation
            bitElement.classList.add('highlight');
          }, 50);
        }
        
        // Show the result after all hash functions are done
        if (idx === positionsToHighlight.length - 1) {
          setTimeout(() => {
            setActiveAnimation(false);
            setIsAnimating(false);
            if (onAnimationEnd) onAnimationEnd();
          }, (600 / animationSpeed));
        }
      }, (idx * 600) / animationSpeed);
    });
  };

  // Run animation based on props
  useEffect(() => {
    if (word && positions.length > 0 && type === 'add') {
      animateAddWord(word, positions);
    }
    // Add more animation types as needed
  }, [word, positions, type]);

  return (
    <div className={styles.animationArea} ref={animationAreaRef}>
      <div className={styles.hashVisualization} ref={hashVisualizationRef}>
        {isAnimating && word && !document.querySelector('.hash-label') && (
          <div className="hash-label" style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)' }}>
            "{word}"
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationArea;