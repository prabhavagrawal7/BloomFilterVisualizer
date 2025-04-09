import React, { useState, useRef, useEffect } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import styles from './WordsSection.module.css';

interface AnimationState {
  word: string;
  positions: number[];
  isAnimating: boolean;
}

const WordsSection: React.FC = () => {
  const { addWord, removeWord, filterState, bloomFilter, isAnimating, setIsAnimating } = useBloomFilter();
  const [newWord, setNewWord] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [animation, setAnimation] = useState<AnimationState | null>(null);
  const bloomArrayRef = useRef<HTMLDivElement>(null);

  const handleAddWord = () => {
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

    // Set global animation state
    setIsAnimating(true);

    // Add word to the filter
    const success = addWord(word);
    if (success) {
      setNewWord('');
      setErrorMessage('');
    } else {
      setErrorMessage(`Word "${word}" is already in the filter.`);
      setAnimation(null);
      setIsAnimating(false);
    }
  };

  // Clear animation state after global animation state changes
  useEffect(() => {
    if (!isAnimating && animation?.isAnimating) {
      // Reset animation state when animation completes
      setAnimation(null);
    }
  }, [isAnimating, animation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  return (
    <div className={styles.column}>
      <h2>Add Words to Filter</h2>
      <div className={styles.inputGroup}>
        <input 
          type="text" 
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a word to add..."
          disabled={isAnimating}
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
};

export default WordsSection;