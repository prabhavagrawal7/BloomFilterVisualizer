import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import styles from './BloomArray.module.css';

interface BloomArrayProps {
  bitArray: boolean[];
  highlightPositions?: number[];
}

export interface BloomArrayHandle {
  getBitElements: () => HTMLDivElement[];
  highlightBit: (index: number) => void;
  unhighlightBit: (index: number) => void;
  unhighlightAll: () => void;
}

const BloomArray = forwardRef<BloomArrayHandle, BloomArrayProps>(
  ({ bitArray, highlightPositions = [] }, ref) => {
    const arrayRef = useRef<HTMLDivElement>(null);
    const bitElementsRef = useRef<HTMLDivElement[]>([]);

    // Provide methods to parent components
    useImperativeHandle(ref, () => ({
      getBitElements: () => bitElementsRef.current,
      highlightBit: (index: number) => {
        if (bitElementsRef.current[index]) {
          bitElementsRef.current[index].classList.add('highlight');
        }
      },
      unhighlightBit: (index: number) => {
        if (bitElementsRef.current[index]) {
          bitElementsRef.current[index].classList.remove('highlight');
        }
      },
      unhighlightAll: () => {
        bitElementsRef.current.forEach(bit => bit.classList.remove('highlight'));
      }
    }));

    // Update bit elements reference when they change
    useEffect(() => {
      if (arrayRef.current) {
        bitElementsRef.current = Array.from(
          arrayRef.current.querySelectorAll('.bit')
        ) as HTMLDivElement[];
      }
    }, [bitArray]);

    // Apply highlights when highlightPositions changes
    useEffect(() => {
      // Remove all highlights first
      bitElementsRef.current.forEach(bit => bit.classList.remove('highlight'));
      
      // Apply new highlights
      highlightPositions.forEach(index => {
        if (bitElementsRef.current[index]) {
          bitElementsRef.current[index].classList.add('highlight');
        }
      });
    }, [highlightPositions]);

    return (
      <div className={styles.bloomArray} ref={arrayRef}>
        {bitArray.map((bit, index) => (
          <div 
            key={index}
            className={`bit ${bit ? 'active' : ''}`}
            data-index={index}
          >
            {bit ? '1' : '0'}
            {index % 4 === 0 && (
              <span className={styles.bitIndex}>{index}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
);

export default BloomArray;