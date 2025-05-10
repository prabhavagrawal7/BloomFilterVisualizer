import { useRef, useEffect, memo } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation } from '../contexts/AnimationContext';
import { useAnimationEffects } from '../hooks/useAnimationEffects';
import AnimatedLine from './AnimatedLine';

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

  // We don't need to track processed animations anymore as we want to be able to replay
  
  // Effect to handle animations when currentAnimation changes
  useEffect(() => {
    // Only proceed if there's a new animation to show and we're in animating state
    if (!isAnimating || 
        !currentAnimation || 
        !bloomArrayRef?.current || 
        !animationAreaRef.current) {
      return;
    }
    
    // Clear any previous animations first
    clearAnimations();
    
    // Handle different animation types
    if (currentAnimation.type === 'add' || currentAnimation.type === 'check') {
      const { word, positions } = currentAnimation.data as { word: string; positions: number[] };
      
      // Get bit elements
      const bitElements = Array.from(
        bloomArrayRef.current.querySelectorAll('.bit')
      ) as HTMLElement[];
      
      // Run the animation
      animateAddWord(
        word,
        positions,
        bitElements,
        animationAreaRef.current
      );
    }
    
    // We removed the processedAnimationRef check to allow replaying the same animation
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating, currentAnimation, bloomArrayRef]); // Removed clearAnimations from deps

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      clearAnimations();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-32 mb-5 relative bg-slate-50 rounded-lg overflow-visible" ref={animationAreaRef}>
      {/* Animated lines */}
      {lines.map((line) => (
        <AnimatedLine
          key={line.id}
          startX={line.startX}
          startY={line.startY}
          angle={line.angle}
          distance={line.distance}
          duration={600}
          color="#4285f4"
          thickness={2}
        />
      ))}
      
      {/* Text labels */}
      {labels.map((label) => (
        <div
          key={label.id}
          className="absolute bg-white px-2 py-1 rounded shadow-sm text-sm z-10 min-w-20 text-center mt-1 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{
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
});

export default AnimationArea;
