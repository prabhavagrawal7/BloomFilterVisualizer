import { useEffect, useRef, useState } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation } from '../contexts/AnimationContext';

// Define types for animation elements
export interface LineConfig {
  id: string;
  startX: number;
  startY: number;
  angle: number;
  distance: number;
}

export interface LabelConfig {
  id: string;
  text: string;
  top: number;
  left: string;
}

export function useAnimationEffects() {
  const { currentAnimation } = useBloomFilter();
  const { animationSpeed, setIsAnimating } = useAnimation();
  
  // Use React state instead of DOM manipulation
  const [lines, setLines] = useState<LineConfig[]>([]);
  const [labels, setLabels] = useState<LabelConfig[]>([]);
  const [highlightedBits, setHighlightedBits] = useState<number[]>([]);

  // Refs for animation timers
  const timeoutRef = useRef<number | null>(null);

  // Clear all animations
  const clearAnimations = () => {
    // Clear timing callbacks first
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Then clear visual elements
    setLines([]);
    setLabels([]);
    setHighlightedBits([]);
  };

  // Use ref to prevent duplicate animations
  const isAnimatingRef = useRef(false);

  // Function to animate adding a word
  const animateAddWord = (
    word: string,
    hashPositions: number[],
    bitElements: HTMLElement[],
    animationAreaElement: HTMLDivElement
  ) => {
    // Prevent multiple animations from running simultaneously
    if (isAnimatingRef.current) {
      return;
    }
    
    // Mark as animating
    isAnimatingRef.current = true;
    
    // Clear any existing animations
    clearAnimations();

    // Calculate animation delay based on animation speed
    const baseDelay = 800 / animationSpeed;
    const sequenceDelay = 500 / animationSpeed;

    // Set animation state to true
    setIsAnimating(true);

    // Positions array for animations 
    const animationPositions: { x: number, y: number }[] = [];

    // Get positions for bit elements 
    hashPositions.forEach((position) => {
      const bitElement = bitElements[position];
      if (bitElement) {
        const bitRect = bitElement.getBoundingClientRect();
        const areaRect = animationAreaElement.getBoundingClientRect();
        
        // Calculate position relative to animation area
        animationPositions.push({
          x: (bitRect.left + bitRect.width / 2) - areaRect.left,
          y: (bitRect.top + bitRect.height / 2) - areaRect.top,
        });
      }
    });

    // Create initial labels array for the word only
    const initialLabels: LabelConfig[] = [];
    
    // Calculate starting position based on word length
    const startX = animationAreaElement.offsetWidth / 2;
    const startY = 20;

    // Create label for the word
    initialLabels.push({
      id: `label-word`,
      text: word,
      top: startY - 35, // Position higher above the hash function labels
      left: `${startX}px`,
    });

    // Update labels with just the word initially
    setLabels(initialLabels);
    
    // Staggered animation for lines and hash labels
    let lineIndex = 0;
    const addNextLine = () => {
      if (lineIndex >= animationPositions.length) return;
      
      const pos = animationPositions[lineIndex];
      
      // Calculate angle for the line
      const dx = pos.x - startX;
      const dy = pos.y - startY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Create new line
      const newLine = {
        id: `line-${lineIndex}`,
        startX,
        startY,
        angle,
        distance,
      };
      
      // Create hash function label (only one at a time)
      const newLabel = {
        id: `label-hash-${lineIndex}`,
        text: `h${lineIndex + 1}(${word})`,
        top: startY + 10,
        left: `${startX}px`,
      };
      
      // Add this line to existing lines
      setLines(prevLines => [...prevLines, newLine]);
      
      // Show only the word label and the current hash label
      setLabels(prevLabels => {
        // Always keep the word label (id: label-word) and add the current hash label
        const wordLabel = prevLabels.find(l => l.id === 'label-word');
        return wordLabel ? [wordLabel, newLabel] : [newLabel];
      });
      
      // Remove the hash label after the line animation duration, then show the next
      setTimeout(() => {
        setLabels(prevLabels => prevLabels.filter(l => l.id !== newLabel.id));
        lineIndex++;
        addNextLine();
      }, 600); // Match the line animation duration
    };
    
    // Start line animation after a short delay
    setTimeout(addNextLine, 200);

    // Animate highlighting bits
    const highlightBits = () => {
      hashPositions.forEach((pos, index) => {
        setTimeout(() => {
          setHighlightedBits(prev => [...prev, pos]);
        }, baseDelay + (index * sequenceDelay));
      });

      // End animation after all bits are highlighted with a more consistent timing
      timeoutRef.current = window.setTimeout(() => {
        // Use a stable reference to the current animation state to avoid race conditions
        const animationComplete = () => {
          // First clear animations to avoid DOM update conflicts
          setTimeout(() => {
            setLines([]);
            setLabels([]);
            setHighlightedBits([]);
            
            // Clear the timeout ref to avoid double-clearing
            timeoutRef.current = null;
            
            // Mark as no longer animating
            isAnimatingRef.current = false;
            
            // Then we can safely set animation state to false
            setIsAnimating(false);
          }, 1000); // Keep animations visible for a second before clearing them
        };
        
        // Wrap in requestAnimationFrame to ensure DOM updates are batched correctly
        requestAnimationFrame(animationComplete);
      }, baseDelay + (hashPositions.length * sequenceDelay) + 600) as unknown as number;
    };

    // Start highlighting after a short delay
    setTimeout(highlightBits, 200);
  };

  // We don't need an effect to clear animations when isAnimating changes
  // This would cause an infinite update cycle
  
  // Handle clean-up of animations when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    lines,
    labels,
    highlightedBits,
    animateAddWord,
    clearAnimations,
  };
}
