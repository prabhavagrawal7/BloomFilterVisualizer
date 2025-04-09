import React, { useState, useRef, useEffect } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import AnimationArea from './AnimationArea';
import styles from './CheckWordSection.module.css';

const CheckWordSection: React.FC = () => {
  const { checkWord, isAnimating } = useBloomFilter();
  const [wordToCheck, setWordToCheck] = useState('');
  const [result, setResult] = useState<{
    word: string;
    mightContain: boolean;
    definitelyContains: boolean;
  } | null>(null);
  const bloomArrayRef = useRef<HTMLDivElement>(null);

  // Track previous animation state to detect when animation completes
  const prevAnimatingRef = useRef(isAnimating);

  useEffect(() => {
    // Detect when animation finishes (transition from animating to not animating)
    if (prevAnimatingRef.current && !isAnimating) {
      // Animation just finished - input should now be enabled
    }
    
    // Update ref to current state
    prevAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const handleCheckWord = () => {
    const word = wordToCheck.trim();
    if (!word || isAnimating) return;
    
    // Check the word - this also triggers animation via context
    const { mightContain, definitelyContains } = checkWord(word);
    
    // Store result for display
    setResult({
      word,
      mightContain,
      definitelyContains
    });
    
    // Clear input for next word
    setWordToCheck('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnimating) {
      handleCheckWord();
    }
  };

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
          onChange={(e) => setWordToCheck(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a word to check..."
          disabled={isAnimating} 
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
};

export default CheckWordSection;