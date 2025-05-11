import { useEffect, useRef, useState } from 'react';
import { useAnimation as useAnimationContext } from '../contexts/AnimationContext';

// Define types for animation elements
interface LineConfig {
  id: string;
  startX: number;
  startY: number;
  angle: number;
  distance: number;
}

interface LabelConfig {
  id: string;
  text: string;
  top: number;
  left: string;
}

export function useAnimation() {
  const { 
    animationSpeed,
    setIsAnimating
  } = useAnimationContext();
  
  // Use React state instead of DOM manipulation
  const [lines, setLines] = useState<LineConfig[]>([]);
  const [labels, setLabels] = useState<LabelConfig[]>([]);
  const [highlightedBits, setHighlightedBits] = useState<number[]>([]);
  
  // Store timeouts to clean them up later
  const timeoutsRef = useRef<number[]>([]);
  
  // Clean up timeouts
  const clearTimeouts = () => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id));
    timeoutsRef.current = [];
  };
  
  /**
   * Calculate a path between a source and target element
   */
  const calculatePath = (
    sourceElement: HTMLElement, 
    targetElement: HTMLElement, 
    container: HTMLElement
  ): LineConfig => {
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
    
    return {
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startX,
      startY,
      angle,
      distance,
    };
  };

  /**
   * Create an animated path between elements using React state
   */
  const createAnimatedPath = (
    sourceElement: HTMLElement, 
    targetElement: HTMLElement, 
    container: HTMLElement,
    bitPosition: number
  ) => {
    const lineConfig = calculatePath(sourceElement, targetElement, container);
    
    // Add line to state
    setLines(prev => [...prev, lineConfig]);
    
    // Highlight the target bit
    setHighlightedBits(prev => [...prev, bitPosition]);
    
    return lineConfig.id;
  };

  /**
   * Clear animations by resetting state
   */
  const clearAnimations = () => {
    clearTimeouts();
    setLines([]);
    setLabels([]);
    setHighlightedBits([]);
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
    clearAnimations();
    
    // Add word label at the top
    const wordLabel: LabelConfig = {
      id: `word-${Date.now()}`,
      text: `"${word}"`,
      top: 10,
      left: '50%',
    };
    
    setLabels(prev => [...prev, wordLabel]);
    
    // Animate each hash function
    positions.forEach((pos, idx) => {
      const timeoutId = window.setTimeout(() => {
        // Create hash function label
        const hashLabel: LabelConfig = {
          id: `hash-${Date.now()}-${idx}`,
          text: `Hash ${idx + 1} → ${pos}`,
          top: 40,
          left: '50%',
        };
        
        setLabels(prev => [...prev, hashLabel]);
        
        // Create and animate path after a small delay to ensure label is rendered
        const pathTimeout = window.setTimeout(() => {
          const hashElement = document.getElementById(hashLabel.id);
          if (hashElement && bitElements[pos]) {
            createAnimatedPath(hashElement, bitElements[pos], animationArea, pos);
          }
        }, 20);
        
        timeoutsRef.current.push(pathTimeout);
        
        // Show the result after all hash functions are done
        if (idx === positions.length - 1) {
          const completeTimeout = window.setTimeout(() => {
            setIsAnimating(false);
            if (onComplete) onComplete();
          }, (600 / animationSpeed));
          
          timeoutsRef.current.push(completeTimeout);
        }
        
        // Clean up bit highlights after a delay
        const cleanupTimeout = window.setTimeout(() => {
          setHighlightedBits(prev => prev.filter(bit => bit !== pos));
        }, (800 / animationSpeed));
        
        timeoutsRef.current.push(cleanupTimeout);
      }, (idx * 600) / animationSpeed);
      
      timeoutsRef.current.push(timeoutId);
    });
  };
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      clearTimeouts();
      setIsAnimating(false);
    };
  }, [setIsAnimating]);

  return {
    lines,
    labels,
    highlightedBits,
    clearAnimations,
    animateAddWord
  };
}