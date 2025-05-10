// filepath: /workspaces/BloomFilterVisualizer/src/components/WordsSection.tsx
import React, { useState, useEffect, memo } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation } from '../contexts/AnimationContext';
import { FocusTarget } from '../contexts/AnimationContext';
import styles from './WordsSection.module.css';

interface AnimationState {
  word: string;
  positions: number[];
  isAnimating: boolean;
}

// Use memo to prevent unnecessary re-renders
const WordsSection: React.FC = memo(() => {
  const { 
    addWord, 
    removeWord, 
    filterState, 
    bloomFilter 
  } = useBloomFilter();
  
  const {
    isAnimating,
    focusTarget,
    setFocusTarget
  } = useAnimation();
  
  const [newWord, setNewWord] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [animation, setAnimation] = useState<AnimationState | null>(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  // Use useCallback for stable function references
  const handleAddWord = React.useCallback(() => {
    const word = newWord.trim();
    if (!word) {
      setErrorMessage('Please enter a word');
      return;
    }

    if (filterState.words.includes(word)) {
      setErrorMessage(`Word "${word}" is already in the filter.`);
      return;
    }

    // Get positions for animation before adding the word
    const positions = bloomFilter.getHashPositions(word);
    
    // Set up animation state
    setAnimation({
      word,
      positions,
      isAnimating: true
    });

    // Add word to the filter - the animation will be handled by BloomFilterContext
    const success = addWord(word);
    if (success) {
      setNewWord('');
      setErrorMessage('');
    } else {
      setErrorMessage(`Word "${word}" is already in the filter.`);
      setAnimation(null);
    }
  }, [newWord, filterState.words, bloomFilter, addWord, setNewWord, setErrorMessage, setAnimation]);

  // Clear animation state after global animation state changes
  useEffect(() => {
    // Track the previous animation state
    const prevIsAnimating = animation?.isAnimating;
    
    // When animation finishes (was animating but now isn't)
    if (!isAnimating && prevIsAnimating) {
      // Reset animation state when animation completes
      setAnimation(null);

      // Set focus flag if the last action was from this component
      if (focusTarget === FocusTarget.ADD) {
        // Reset focus target first
        setFocusTarget(FocusTarget.NONE);
        
        // Then set focus flag - use setTimeout to ensure state updates have been processed
        setTimeout(() => {
          setShouldFocusInput(true);
        }, 0);
      }
    }
  }, [isAnimating, animation, focusTarget, setFocusTarget]);

  // Use useCallback for stable function reference to prevent unnecessary re-renders
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    // Only handle Enter key press and ignore if animation is in progress
    if (e.key === 'Enter' && !isAnimating) {
      e.preventDefault(); // Prevent default behavior
      handleAddWord();
    }
  }, [isAnimating, handleAddWord]);

  return (
    <div className={styles.column}>
      <h2>Add Words to Filter</h2>
      <div className={styles.inputGroup}>
        <input 
          type="text" 
          value={newWord}
          onChange={React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
            setNewWord(e.target.value), [setNewWord])}
          onKeyDown={handleKeyDown}
          placeholder="Enter a word to add..."
          disabled={isAnimating}
          autoFocus={shouldFocusInput}
          onFocus={React.useCallback(() => {
            if (!isAnimating) {
              setFocusTarget(FocusTarget.ADD);
              if (shouldFocusInput) {
                setShouldFocusInput(false);
              }
            }
          }, [isAnimating, setFocusTarget, shouldFocusInput, setShouldFocusInput])}
        />
        <button 
          onClick={handleAddWord} 
          className={styles.primaryBtn}
          disabled={isAnimating}
        >
          Add Word
        </button>
      </div>
      
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      
      <div className={styles.wordsContainer}>
        <h3>Words in Filter</h3>
        <div className={styles.wordsList}>
          {filterState.words.length === 0 ? (
            <div className={styles.emptyMessage}>No words added yet</div>
          ) : (
            filterState.words.map((word) => (
              <div key={word} className={styles.wordItem}>
                <span>{word}</span>
                <span 
                  className={styles.removeWord}
                  onClick={() => removeWord(word)}
                >
                  ×
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

export default WordsSection;
