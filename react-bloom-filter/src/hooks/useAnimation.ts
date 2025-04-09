import { useEffect, useRef } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';

export function useAnimation() {
  const { 
    animationSpeed, 
    isAnimating, 
    setIsAnimating 
  } = useBloomFilter();
  
  /**
   * Create an animated path between a source and target element
   */
  const createAnimatedPath = (
    sourceElement: HTMLElement, 
    targetElement: HTMLElement, 
    container: HTMLElement
  ) => {
    // Get positions relative to the container
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
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
    path.style.transform = `rotate(${angle}deg)`;
    container.appendChild(path);
    
    // Animate path drawing and highlight bit
    requestAnimationFrame(() => {
      path.style.width = `${distance}px`;
      targetElement.classList.add('highlight');
    });
    
    return path;
  };

  /**
   * Clear animations from a specified element
   */
  const clearAnimations = (targetArea: HTMLElement) => {
    // Remove existing hash paths and labels
    const existingPaths = targetArea.querySelectorAll('.hash-path, .hash-label');
    existingPaths.forEach(path => path.remove());
    
    // Find the bloom array associated with this target
    const rootElement = targetArea.closest('.main-view, .history-animation');
    if (rootElement) {
      const bloomArray = rootElement.querySelector('.bloom-array');
      if (bloomArray) {
        const highlightedBits = bloomArray.querySelectorAll('.bit.highlight');
        highlightedBits.forEach(bit => bit.classList.remove('highlight'));
      }
    }
  };

  /**
   * Animate adding a word to the filter
   */
  const animateAddWord = (
    word: string, 
    positions: number[], 
    animationArea: HTMLElement,
    bitElements: NodeListOf<HTMLElement>,
    onComplete?: () => void
  ) => {
    setIsAnimating(true);
    
    // Clear any existing animations
    clearAnimations(animationArea);
    
    // Create a word element at the top
    const wordElement = document.createElement('div');
    wordElement.className = 'hash-label';
    wordElement.textContent = `"${word}"`;
    wordElement.style.position = 'absolute';
    wordElement.style.top = '10px';
    wordElement.style.left = '50%';
    wordElement.style.transform = 'translateX(-50%)';
    animationArea.appendChild(wordElement);
    
    // Animate each hash function
    positions.forEach((pos, idx) => {
      setTimeout(() => {
        // Create hash function label
        const hashLabel = document.createElement('div');
        hashLabel.className = 'hash-label';
        hashLabel.textContent = `Hash ${idx + 1} → ${pos}`;
        hashLabel.style.position = 'absolute';
        hashLabel.style.top = '40px';
        hashLabel.style.left = '50%';
        hashLabel.style.transform = 'translateX(-50%)';
        animationArea.appendChild(hashLabel);
        
        // Create and animate path
        if (bitElements[pos]) {
          createAnimatedPath(hashLabel, bitElements[pos], animationArea);
        }
        
        // Show the result after all hash functions are done
        if (idx === positions.length - 1) {
          setTimeout(() => {
            setIsAnimating(false);
            if (onComplete) onComplete();
          }, (600 / animationSpeed));
        }
        
        // Clean up after a delay
        setTimeout(() => {
          if (bitElements[pos]) {
            bitElements[pos].classList.remove('highlight');
          }
        }, (800 / animationSpeed));
      }, (idx * 600) / animationSpeed);
    });
  };

  return {
    createAnimatedPath,
    clearAnimations,
    animateAddWord
  };
}