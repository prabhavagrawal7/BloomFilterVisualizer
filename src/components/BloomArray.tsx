import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

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
      <div className="flex flex-wrap gap-1 mb-5 justify-center sticky top-[50px] bg-white z-10 py-3" ref={arrayRef}>
        {bitArray.map((bit, index) => (
          <div 
            key={index}
            className={`bit w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-lg font-mono relative cursor-pointer transition-colors ${bit ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
            data-index={index}
          >
            {bit ? '1' : '0'}
            {index % 4 === 0 && (
              <span className="absolute -top-5 text-xs text-gray-500">{index}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
);

export default BloomArray;