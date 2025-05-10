// filepath: /workspaces/BloomFilterVisualizer/src/components/CheckWordSection.tsx
import { useState, useRef, useEffect, memo, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation, FocusTarget } from '../contexts/AnimationContext';
import AnimationArea from './AnimationArea';

// Use memo to prevent unnecessary re-renders
const CheckWordSection: React.FC = memo(() => {
  const { 
    checkWord
  } = useBloomFilter();
  
  const {
    isAnimating,
    focusTarget,
    setFocusTarget
  } = useAnimation();
  
  const [wordToCheck, setWordToCheck] = useState('');
  const [result, setResult] = useState<{
    word: string;
    mightContain: boolean;
    definitelyContains: boolean;
  } | null>(null);
  const bloomArrayRef = useRef<HTMLDivElement>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  // Track previous animation state to detect when animation completes
  const prevAnimatingRef = useRef(isAnimating);
  
  // Use useEffect to handle post-animation focus
  useEffect(() => {
    // If animation was running but now stopped and the target is CHECK
    if (prevAnimatingRef.current && !isAnimating && focusTarget === FocusTarget.CHECK) {
      // Reset focus target
      setFocusTarget(FocusTarget.NONE);
      
      // Wait for next render cycle to ensure state has updated
      setTimeout(() => {
        setShouldFocusInput(true);
      }, 0);
    }
    
    // Update the ref value for next check
    prevAnimatingRef.current = isAnimating;
  }, [isAnimating, focusTarget, setFocusTarget]);

  // Use useCallback for stable function references
  const handleCheckWord = useCallback(() => {
    const word = wordToCheck.trim();
    if (!word) return;
    
    // Prevent checking if currently animating
    if (isAnimating) return;
    
    const { mightContain, definitelyContains } = checkWord(word);
    
    setResult({
      word,
      mightContain,
      definitelyContains
    });
  }, [wordToCheck, isAnimating, checkWord, setResult]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAnimating) {
      e.preventDefault();
      handleCheckWord();
    }
  }, [isAnimating, handleCheckWord]);
  
  const getResultClass = () => {
    if (!result) return '';
    
    if (result.definitelyContains) {
      return 'bg-green-100 border-green-500 text-green-800';
    } else if (result.mightContain) {
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    } else {
      return 'bg-red-100 border-red-500 text-red-800';
    }
  };
  
  const getResultMessage = () => {
    if (!result) return '';
    
    if (result.definitelyContains) {
      return `"${result.word}" is DEFINITELY in the Bloom filter.`;
    } else if (result.mightContain) {
      return `"${result.word}" MIGHT be in the Bloom filter (possible false positive).`;
    } else {
      return `"${result.word}" is DEFINITELY NOT in the Bloom filter.`;
    }
  };

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => 
    setWordToCheck(e.target.value), []);

  const handleInputFocus = useCallback(() => {
    if (!isAnimating) {
      setFocusTarget(FocusTarget.CHECK);
      if (shouldFocusInput) {
        setShouldFocusInput(false);
      }
    }
  }, [isAnimating, setFocusTarget, shouldFocusInput, setShouldFocusInput]);

  return (
    <div className="flex-1 bg-slate-50 p-5 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Check Word</h2>
      <div className="flex gap-3 mb-5">
        <input 
          type="text" 
          value={wordToCheck}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a word to check..."
          disabled={isAnimating} 
          autoFocus={shouldFocusInput}
          onFocus={handleInputFocus}
          className="flex-1 p-2.5 border border-slate-300 rounded-md text-base"
        />
        <button 
          onClick={handleCheckWord} 
          className="px-5 py-2.5 border-none rounded-md cursor-pointer font-semibold transition-all duration-300 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isAnimating}
        >
          Check Word
        </button>
      </div>
      
      <div className="relative mb-5" ref={bloomArrayRef}>
        <AnimationArea bloomArrayRef={bloomArrayRef} />
      </div>
      
      <div className="mt-4">
        {result && (
          <div className={`p-4 rounded-md border ${getResultClass()}`}>
            {getResultMessage()}
          </div>
        )}
      </div>
    </div>
  );
});

export default CheckWordSection;
