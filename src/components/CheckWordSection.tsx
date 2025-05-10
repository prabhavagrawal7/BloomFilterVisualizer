import React, { useState, useRef, useEffect, memo } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation } from '../contexts/AnimationContext';
import { FocusTarget } from '../contexts/AnimationContext';
import AnimationArea from './AnimationArea';
import styles from './CheckWordSection.module.css';

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

  useEffect(() => {
    // Detect when animation finishes (transition from animating to not animating)
    if (prevAnimatingRef.current && !isAnimating) {
      // Animation just finished - set focus flag if this section was active 
      if (focusTarget === FocusTarget.CHECK) {
        // First reset the focus target
        setFocusTarget(FocusTarget.NONE);
        
        // Use setTimeout to ensure state updates have been processed
        setTimeout(() => {
          setShouldFocusInput(true);
        }, 0);
      }
    }
    
    // Update ref to current state
    prevAnimatingRef.current = isAnimating;
  }, [isAnimating, focusTarget, setFocusTarget]);
  
  const handleCheckWord = React.useCallback(() => {
    const word = wordToCheck.trim();
    if (!word || isAnimating) return;
    
    // Check the word - animation is handled by context
    const { mightContain, definitelyContains } = checkWord(word);
    
    // Store result for display
    setResult({
      word,
      mightContain,
      definitelyContains
    });
    
    // Clear input for next word
    setWordToCheck('');
  }, [wordToCheck, isAnimating, checkWord, setResult, setWordToCheck]);

  // Use useCallback for stable function reference to prevent unnecessary re-renders
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnimating) {
      e.preventDefault(); // Prevent default behavior
      handleCheckWord();
    }
  }, [isAnimating, handleCheckWord]);

  const getResultClass = () => {
    if (!result) return '';
    if (result.definitelyContains) return styles.positive;
    if (result.mightContain) return styles.warning;
    return styles.negative;
  };

  const getResultMessage = () => {
    if (!result) return '';
    if (result.definitelyContains) {
      return `"${result.word}" is in the filter.`;
    }
    if (result.mightContain) {
      return `"${result.word}" might be in the filter (false positive).`;
    }
    return `"${result.word}" is definitely NOT in the filter.`;
  };

  return (
    <div className={styles.column}>
      <h2>Check if Word Exists</h2>
      <div className={styles.inputGroup}>
        <input 
          type="text" 
          value={wordToCheck}
          onChange={React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
            setWordToCheck(e.target.value), [setWordToCheck])}
          onKeyDown={handleKeyDown}
          placeholder="Enter a word to check..."
          disabled={isAnimating} 
          autoFocus={shouldFocusInput}
          onFocus={React.useCallback(() => {
            if (!isAnimating) {
              setFocusTarget(FocusTarget.CHECK);
              if (shouldFocusInput) {
                setShouldFocusInput(false);
              }
            }
          }, [isAnimating, setFocusTarget, shouldFocusInput, setShouldFocusInput])}
        />
        <button 
          onClick={handleCheckWord} 
          className={styles.secondaryBtn}
          disabled={isAnimating}
        >
          Check Word
        </button>
      </div>
      
      <div className={styles.animationContainer} ref={bloomArrayRef}>
        <AnimationArea bloomArrayRef={bloomArrayRef} />
      </div>
      
      <div className={styles.resultDisplay}>
        {result && (
          <div className={`${styles.resultMessage} ${getResultClass()}`}>
            {getResultMessage()}
          </div>
        )}
      </div>
    </div>
  );
});

export default CheckWordSection;