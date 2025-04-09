import React, { useState, useRef } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import AnimationArea from './AnimationArea';
import styles from './CheckWordSection.module.css';

interface AnimationState {
  word: string;
  positions: number[];
  mightContain: boolean;
  definitelyContains: boolean;
}

const CheckWordSection: React.FC = () => {
  const { checkWord, bloomFilter } = useBloomFilter();
  const [wordToCheck, setWordToCheck] = useState('');
  const [animation, setAnimation] = useState<AnimationState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const bloomArrayRef = useRef<HTMLDivElement>(null);

  const handleCheckWord = () => {
    const word = wordToCheck.trim();
    if (!word) return;

    setIsAnimating(true);
    
    // Get positions for animation
    const positions = bloomFilter.getHashPositions(word);
    
    // Check the word
    const { mightContain, definitelyContains } = checkWord(word);
    
    // Set up animation state
    setAnimation({
      word,
      positions,
      mightContain,
      definitelyContains
    });
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheckWord();
    }
  };

  const getResultClass = () => {
    if (!animation) return '';
    if (animation.definitelyContains) return styles.positive;
    if (animation.mightContain) return styles.warning;
    return styles.negative;
  };

  const getResultMessage = () => {
    if (!animation) return '';
    if (animation.definitelyContains) {
      return `"${animation.word}" is in the filter.`;
    }
    if (animation.mightContain) {
      return `"${animation.word}" might be in the filter (false positive).`;
    }
    return `"${animation.word}" is definitely NOT in the filter.`;
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
      
      {animation && (
        <div className={styles.animationContainer} ref={bloomArrayRef}>
          <AnimationArea 
            word={animation.word}
            positions={animation.positions}
            isAnimating={isAnimating}
            type="check"
            bloomArrayRef={bloomArrayRef}
            onAnimationEnd={handleAnimationEnd}
          />
        </div>
      )}
      
      <div className={styles.resultDisplay}>
        {animation && (
          <div className={`${styles.resultMessage} ${getResultClass()}`}>
            {getResultMessage()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckWordSection;