import React, { useState } from 'react';
import { useBloomFilter } from '../contexts/BloomFilterContext';
import { HistoryEntry } from '../utils/HistoryManager';
import styles from './HistoryLog.module.css';

const HistoryLog: React.FC = () => {
  const { 
    historyManager, 
    currentAnimation, 
    setCurrentAnimation,
    animationSpeed,
    setAnimationSpeed 
  } = useBloomFilter();
  
  const handleClearHistory = () => {
    historyManager.clearHistory();
    setCurrentAnimation(null);
    // Force re-render
    setHistoryEntries([]);
  };

  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(
    historyManager.getHistory()
  );

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setAnimationSpeed(speed);
  };

  const handleReplayAnimation = (entry: HistoryEntry) => {
    setCurrentAnimation(entry);
  };

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyControls}>
        <button 
          onClick={handleClearHistory}
          className={styles.secondaryBtn}
        >
          Clear History
        </button>
        <div className={styles.animationSpeed}>
          <label htmlFor="animationSpeed">Animation Speed:</label>
          <input 
            type="range" 
            id="animationSpeed" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={animationSpeed}
            onChange={handleSpeedChange}
          />
          <span>{animationSpeed}x</span>
        </div>
      </div>
      
      <div className={styles.historyLog}>
        {historyEntries.length === 0 ? (
          <div className={styles.emptyMessage}>No history entries yet</div>
        ) : (
          historyEntries.map(entry => (
            <div 
              key={entry.id} 
              className={`${styles.historyEntry} ${styles[entry.type]}`}
              onClick={() => handleReplayAnimation(entry)}
              data-id={entry.id}
              style={{
                backgroundColor: currentAnimation?.id === entry.id ? '#e8f4fd' : ''
              }}
            >
              <div className={styles.timestamp}>{entry.timestamp}</div>
              <div className={styles.description}>{entry.description}</div>
            </div>
          ))
        )}
      </div>

      {currentAnimation && (
        <div className={`${styles.historyAnimation} ${styles.active}`}>
          <h3>Replay Animation</h3>
          <div className={styles.replayContent}>
            <p>Animation replay would be shown here with details of: 
              {currentAnimation.type === 'add' && `Adding "${currentAnimation.data.word}" to the filter`}
              {currentAnimation.type === 'check' && `Checking if "${currentAnimation.data.word}" exists in the filter`}
              {currentAnimation.type === 'remove' && `Removing "${currentAnimation.data.word}" from the filter`}
              {currentAnimation.type === 'reset' && 'Resetting the filter'}
              {currentAnimation.type === 'update' && 'Updating filter parameters'}
            </p>
            {/* Animation components would be rendered here based on the entry type */}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryLog;