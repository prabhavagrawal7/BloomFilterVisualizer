import React, { useState } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  onTabChange: (tab: 'main' | 'history') => void;
  activeTab: 'main' | 'history';
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onTabChange, activeTab }) => {
  const { 
    updateFilterParams, 
    resetFilter,
    filterState
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
    <div className={styles.controlsSection}>
      <div className={styles.filterParams}>
        <div className={styles.paramGroup}>
          <label htmlFor="filterSize">Filter Size:</label>
          <input 
            type="number" 
            id="filterSize" 
            min="8"
            max="128" 
            step="8" 
            value={filterSize} 
            onChange={handleSizeChange}
            onBlur={handleUpdateParams}
          />
        </div>
        
        <div className={styles.paramGroup}>
          <label htmlFor="hashFunctions">Hash Functions:</label>
          <input 
            type="number" 
            id="hashFunctions" 
            min="1" 
            max="5" 
            value={hashFunctions} 
            onChange={handleHashFunctionsChange}
            onBlur={handleUpdateParams}
          />
        </div>

        <button 
          className={styles.primaryBtn} 
          onClick={resetFilter}
        >
          Reset Filter
        </button>
      </div>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'main' ? styles.active : ''}`}
          onClick={() => onTabChange('main')}
        >
          Main View
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => onTabChange('history')}
        >
          History Log
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;