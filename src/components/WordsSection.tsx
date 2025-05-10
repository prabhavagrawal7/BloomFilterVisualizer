// filepath: /workspaces/BloomFilterVisualizer/src/components/WordsSection.tsx
import { useState, useEffect, memo, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { useAnimation, FocusTarget } from '../contexts/AnimationContext';

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
  const handleAddWord = useCallback(() => {
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
  }, [newWord, filterState.words, bloomFilter, addWord]);

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
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // Only handle Enter key press and ignore if animation is in progress
    if (e.key === 'Enter' && !isAnimating) {
      e.preventDefault(); // Prevent default behavior
      handleAddWord();
    }
  }, [isAnimating, handleAddWord]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => 
    setNewWord(e.target.value), []);

  const handleInputFocus = useCallback(() => {
    if (!isAnimating) {
      setFocusTarget(FocusTarget.ADD);
      if (shouldFocusInput) {
        setShouldFocusInput(false);
      }
    }
  }, [isAnimating, setFocusTarget, shouldFocusInput, setShouldFocusInput]);

  return (
    <div className="flex-1 bg-slate-50 p-5 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Add Words to Filter</h2>
      <div className="flex gap-3 mb-5">
        <input 
          type="text" 
          value={newWord}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a word to add..."
          disabled={isAnimating}
          autoFocus={shouldFocusInput}
          onFocus={handleInputFocus}
          className="flex-1 p-2.5 border border-slate-300 rounded-md text-base"
        />
        <button 
          onClick={handleAddWord} 
          className="px-5 py-2.5 border-none rounded-md cursor-pointer font-semibold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isAnimating}
        >
          Add Word
        </button>
      </div>
      
      {errorMessage && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-md">{errorMessage}</div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3 text-slate-700">Words in Filter</h3>
        <div className="flex flex-wrap gap-2">
          {filterState.words.length === 0 ? (
            <div className="text-slate-500 italic w-full text-center py-4">No words added yet</div>
          ) : (
            filterState.words.map((word) => (
              <div key={word} className="inline-flex items-center bg-white border border-slate-200 rounded-md px-3 py-1 gap-2 shadow-sm">
                <span>{word}</span>
                <span 
                  className="ml-1 text-slate-500 hover:text-red-500 cursor-pointer font-bold text-xl"
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
