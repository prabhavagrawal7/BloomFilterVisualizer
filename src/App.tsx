import { useState, useRef } from 'react'
import './App.css'
import { BloomFilterProvider } from './contexts/BloomFilterContext'
import { AnimationProvider } from './contexts/AnimationContext'
import ControlPanel from './components/ControlPanel'
import BloomArray from './components/BloomArray'
import AnimationArea from './components/AnimationArea'
import WordsSection from './components/WordsSection'
import CheckWordSection from './components/CheckWordSection'
import HistoryLog from './components/HistoryLog'
import { useBloomFilter } from './contexts/BloomFilterContext'
import type { BloomArrayHandle } from './components/BloomArray'

// Component that uses the BloomFilter context
function BloomFilterVisualizer() {
  const [activeTab, setActiveTab] = useState<'main' | 'history'>('main');
  const { filterState } = useBloomFilter();
  const bloomArrayRef = useRef<BloomArrayHandle>(null);

  const handleTabChange = (tab: 'main' | 'history') => {
    setActiveTab(tab);
  };

  return (
    <div className="bloom-filter-container">
      <h1>Bloom Filter Visualizer</h1>
      
      {/* Controls & Tabs */}
      <ControlPanel 
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />

      {/* Main View */}
      {activeTab === 'main' && (
        <div className="main-view">
          <div className="visualization-section">
            <h2>Bloom Filter Array</h2>
            <BloomArray 
              bitArray={filterState.bitArray}
              ref={bloomArrayRef} 
            />
            <AnimationArea 
              bloomArrayRef={bloomArrayRef.current ? 
                { current: bloomArrayRef.current.getBitElements()[0]?.parentElement as HTMLDivElement } : 
                undefined} 
            />
          </div>

          <div className="interaction-section">
            <WordsSection />
            <CheckWordSection />
          </div>

          <div className="info-section">
            <h2>About Bloom Filters</h2>
            <p>
              A Bloom filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set.
              False positive matches are possible, but false negatives are not – when a Bloom filter reports that an element is not in the set, 
              it definitely is not.
            </p>
            <p>
              <strong>How it works:</strong> The filter uses multiple hash functions to map each element to several positions in a bit array. 
              When checking if an element exists, if any of the mapped bits are 0, the element is definitely not in the set. 
              If all are 1, the element might be in the set.
            </p>
          </div>
        </div>
      )}

      {/* History View */}
      {activeTab === 'history' && (
        <div className="history-view">
          <HistoryLog />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AnimationProvider>
      <BloomFilterProvider initialSize={32} initialHashFunctions={3}>
        <BloomFilterVisualizer />
      </BloomFilterProvider>
    </AnimationProvider>
  )
}

export default App
