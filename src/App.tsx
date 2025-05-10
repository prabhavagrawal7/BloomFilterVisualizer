import { useRef } from 'react'
import './App.css'
import { BloomFilterProvider } from './contexts/BloomFilterContext'
import { AnimationProvider } from './contexts/AnimationContext'
import ControlPanel from './components/ControlPanel'
import BloomArray from './components/BloomArray'
import AnimationArea from './components/AnimationArea'
import WordsSection from './components/WordsSection'
import CheckWordSection from './components/CheckWordSection'
import { useBloomFilter } from './contexts/BloomFilterContext'
import type { BloomArrayHandle } from './components/BloomArray'

// Component that uses the BloomFilter context
function BloomFilterVisualizer() {
  const { filterState } = useBloomFilter();
  const bloomArrayRef = useRef<BloomArrayHandle>(null);

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 text-gray-800">
      <h1 className="text-4xl font-bold text-center mb-8 text-slate-700">Bloom Filter Visualizer</h1>
      
      {/* Controls */}
      <ControlPanel />

      {/* Main View */}
      <div className="mt-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-700 sticky top-0 bg-white z-10 py-2">Bloom Filter Array</h2>
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

        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <WordsSection />
          <CheckWordSection />
        </div>

        <div className="bg-slate-50 p-6 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-700">About Bloom Filters</h2>
          <p className="mb-4 text-slate-600 leading-relaxed">
            A Bloom filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set.
            False positive matches are possible, but false negatives are not – when a Bloom filter reports that an element is not in the set, 
            it definitely is not.
          </p>
          <p className="text-slate-600 leading-relaxed">
            <span className="font-semibold">How it works:</span> The filter uses multiple hash functions to map each element to several positions in a bit array. 
            When checking if an element exists, if any of the mapped bits are 0, the element is definitely not in the set. 
            If all are 1, the element might be in the set.
          </p>
        </div>
      </div>

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
