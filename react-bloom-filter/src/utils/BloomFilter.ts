export interface BloomFilterState {
  bitArray: boolean[];
  words: string[];
  size: number;
  numHashFunctions: number;
}

export class BloomFilter {
  size: number;
  numHashFunctions: number;
  bitArray: boolean[];
  words: Set<string>;

  constructor(size: number, numHashFunctions: number) {
    this.size = size;
    this.numHashFunctions = numHashFunctions;
    this.bitArray = new Array(size).fill(false);
    this.words = new Set<string>(); // Keep track of added words
  }

  // Reset the filter
  reset(): void {
    this.bitArray = new Array(this.size).fill(false);
    this.words.clear();
  }

  // Update filter parameters
  updateParams(size: number, numHashFunctions: number): string[] {
    const oldWords = [...this.words];
    this.size = size;
    this.numHashFunctions = numHashFunctions;
    this.reset();
    
    // Re-add all words with new parameters
    oldWords.forEach(word => this.add(word));
    return oldWords;
  }

  // Simple hash functions for demonstration
  hash(word: string, seed: number): number {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i) * seed) | 0;
    }
    return Math.abs(hash) % this.size;
  }

  // Get all hash positions for a word
  getHashPositions(word: string): number[] {
    const positions: number[] = [];
    for (let i = 0; i < this.numHashFunctions; i++) {
      positions.push(this.hash(word, i + 1));
    }
    return positions;
  }

  // Add a word to the filter
  add(word: string): boolean {
    if (this.words.has(word)) return false; // Word already added
    
    const positions = this.getHashPositions(word);
    positions.forEach(pos => {
      this.bitArray[pos] = true;
    });
    
    this.words.add(word);
    return true;
  }

  // Remove a word from the filter (Note: this is not a standard operation in bloom filters)
  remove(word: string): boolean {
    if (!this.words.has(word)) return false;
    
    this.words.delete(word);
    this.reset();
    
    // Re-add all remaining words
    [...this.words].forEach(w => {
      const positions = this.getHashPositions(w);
      positions.forEach(pos => {
        this.bitArray[pos] = true;
      });
    });
    
    return true;
  }

  // Check if a word might be in the filter
  mightContain(word: string): boolean {
    const positions = this.getHashPositions(word);
    return positions.every(pos => this.bitArray[pos]);
  }

  // Check if a word is definitely in the filter
  definitelyContains(word: string): boolean {
    return this.words.has(word);
  }

  // Get the current state of the filter
  getState(): BloomFilterState {
    return {
      bitArray: [...this.bitArray],
      words: [...this.words],
      size: this.size,
      numHashFunctions: this.numHashFunctions
    };
  }
}