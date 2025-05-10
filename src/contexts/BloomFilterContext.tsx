import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import { BloomFilter, BloomFilterState } from '../utils/BloomFilter';
import { HistoryManager, HistoryEntry } from '../utils/HistoryManager';
import { useAnimation, FocusTarget } from './AnimationContext';

interface BloomFilterContextType {
  bloomFilter: BloomFilter;
  historyManager: HistoryManager;
  currentAnimation: HistoryEntry | null;
  setCurrentAnimation: (animation: HistoryEntry | null) => void;
  filterState: BloomFilterState;
  updateFilterState: () => void;
  resetFilter: () => void;
  updateFilterParams: (size: number, numHashFunctions: number) => void;
  addWord: (word: string) => boolean;
  checkWord: (word: string) => { mightContain: boolean; definitelyContains: boolean };
  removeWord: (word: string) => boolean;
  clearAnimations: () => void;
  replayLastAnimation: () => void;
}

const BloomFilterContext = createContext<BloomFilterContextType | undefined>(undefined);

export const useBloomFilter = () => {
  const context = useContext(BloomFilterContext);
  if (!context) {
    throw new Error('useBloomFilter must be used within a BloomFilterProvider');
  }
  return context;
};

interface BloomFilterProviderProps {
  children: ReactNode;
  initialSize?: number;
  initialHashFunctions?: number;
}

export const BloomFilterProvider: React.FC<BloomFilterProviderProps> = ({ 
  children, 
  initialSize = 32, 
  initialHashFunctions = 3 
}) => {
  // Use the animation context for animation-related state
  const { 
    setIsAnimating,
    setFocusTarget
  } = useAnimation();
  
  const bloomFilterRef = useRef(new BloomFilter(initialSize, initialHashFunctions));
  const historyManagerRef = useRef(new HistoryManager());
  const [currentAnimation, setCurrentAnimation] = useState<HistoryEntry | null>(null);
  const [filterState, setFilterState] = useState<BloomFilterState>(bloomFilterRef.current.getState());

  const updateFilterState = () => {
    setFilterState(bloomFilterRef.current.getState());
  };

  const resetFilter = () => {
    bloomFilterRef.current.reset();
    updateFilterState();

    // Add to history
    historyManagerRef.current.addEntry(
      'reset',
      { filterState: bloomFilterRef.current.getState() },
      'Reset Bloom Filter'
    );
  };

  const updateFilterParams = (size: number, numHashFunctions: number) => {
    // Validate input values
    const validatedSize = Math.max(8, Math.min(128, size));
    const validatedHashFunctions = Math.max(1, Math.min(5, numHashFunctions));
    
    // Update filter with validated values
    bloomFilterRef.current.updateParams(validatedSize, validatedHashFunctions);
    updateFilterState();

    // Add to history
    historyManagerRef.current.addEntry(
      'update',
      { 
        filterState: bloomFilterRef.current.getState(),
        oldSize: size !== validatedSize ? size : null,
        oldHashFunctions: numHashFunctions !== validatedHashFunctions ? numHashFunctions : null
      },
      `Updated filter parameters to size=${validatedSize}, hash functions=${validatedHashFunctions}`
    );
  };

  const addWord = (word: string) => {
    if (bloomFilterRef.current.add(word)) {
      updateFilterState();
      
      // Get hash positions for animation
      const positions = bloomFilterRef.current.getHashPositions(word);
      
      // Create animation entry
      const animationEntry = historyManagerRef.current.addEntry(
        'add',
        { 
          word,
          positions,
          filterState: bloomFilterRef.current.getState()
        },
        `Added word "${word}" to the filter`
      );
      
      // Set current animation and mark ADD as the focus target when animation ends
      setCurrentAnimation(animationEntry);
      setIsAnimating(true);
      setFocusTarget(FocusTarget.ADD);
      
      return true;
    }
    return false;
  };

  const checkWord = (word: string) => {
    const mightContain = bloomFilterRef.current.mightContain(word);
    const definitelyContains = bloomFilterRef.current.definitelyContains(word);
    
    // Get positions for animation
    const positions = bloomFilterRef.current.getHashPositions(word);
    
    // Create animation entry
    const animationEntry = historyManagerRef.current.addEntry(
      'check',
      { 
        word,
        positions,
        mightContain,
        definitelyContains,
        filterState: bloomFilterRef.current.getState()
      },
      `Checked if word "${word}" exists in the filter`
    );
    
    // Set current animation and mark CHECK as the focus target when animation ends
    setCurrentAnimation(animationEntry);
    setIsAnimating(true);
    setFocusTarget(FocusTarget.CHECK);
    
    return { mightContain, definitelyContains };
  };

  const removeWord = (word: string) => {
    if (bloomFilterRef.current.remove(word)) {
      updateFilterState();
      
      // Add to history
      historyManagerRef.current.addEntry(
        'remove',
        { 
          word,
          filterState: bloomFilterRef.current.getState()
        },
        `Removed word "${word}" from the filter`
      );
      
      return true;
    }
    return false;
  };

  const clearAnimations = () => {
    // This will be implemented in components as it deals with DOM elements
  };

  // Function to replay the last animation
  const replayLastAnimation = () => {
    const history = historyManagerRef.current.getHistory();
    if (history.length > 0) {
      // Get the most recent animation from history
      const lastAnimation = history[0]; // History is stored in reverse (newest first)
      
      // Set it as the current animation
      setCurrentAnimation(lastAnimation);
      
      // Start animating
      setIsAnimating(true);
      
      // Set focus target based on animation type
      if (lastAnimation.type === 'add') {
        setFocusTarget(FocusTarget.ADD);
      } else if (lastAnimation.type === 'check') {
        setFocusTarget(FocusTarget.CHECK);
      } else {
        setFocusTarget(FocusTarget.NONE);
      }
    }
  };

  const value = {
    bloomFilter: bloomFilterRef.current,
    historyManager: historyManagerRef.current,
    currentAnimation,
    setCurrentAnimation,
    filterState,
    updateFilterState,
    resetFilter,
    updateFilterParams,
    addWord,
    checkWord,
    removeWord,
    clearAnimations,
    replayLastAnimation,
  };

  return (
    <BloomFilterContext.Provider value={value}>
      {children}
    </BloomFilterContext.Provider>
  );
};