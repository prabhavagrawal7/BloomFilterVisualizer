import React, { useState } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';

const ControlPanel: React.FC = () => {
  const { 
    updateFilterParams, 
    resetFilter,
    filterState,
    replayLastAnimation
  } = useBloomFilter();
  
  const [filterSize, setFilterSize] = useState(filterState.size);
  const [hashFunctions, setHashFunctions] = useState(filterState.numHashFunctions);

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    setFilterSize(size);
  };

  const handleHashFunctionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numHashFunctions = parseInt(e.target.value);
    setHashFunctions(numHashFunctions);
  };

  const handleUpdateParams = () => {
    updateFilterParams(filterSize, hashFunctions);
  };

  return (
    <div className="mb-8 bg-slate-50 p-5 rounded-lg">
      <div className="flex flex-wrap gap-5 items-center mb-5">
        <div className="flex items-center gap-3">
          <label htmlFor="filterSize" className="font-semibold">Filter Size:</label>
          <input 
            type="number" 
            id="filterSize" 
            min="8"
            max="128" 
            step="8" 
            className="border border-slate-300 rounded p-2 w-20"
            value={filterSize} 
            onChange={handleSizeChange}
            onBlur={handleUpdateParams}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label htmlFor="hashFunctions" className="font-semibold">Hash Functions:</label>
          <input 
            type="number" 
            id="hashFunctions" 
            min="1" 
            max="5"
            className="border border-slate-300 rounded p-2 w-20"
            value={hashFunctions} 
            onChange={handleHashFunctionsChange}
            onBlur={handleUpdateParams}
          />
        </div>

        <button 
          className="px-5 py-2.5 border-none rounded-md cursor-pointer font-semibold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600"
          onClick={resetFilter}
        >
          Reset Filter
        </button>
      </div>
      
      <div className="mt-5">
        <button 
          className="px-5 py-2.5 border-none rounded-md cursor-pointer font-semibold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600"
          onClick={replayLastAnimation}
        >
          Replay Last Animation
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;