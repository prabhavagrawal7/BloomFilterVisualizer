export interface HistoryEntry {
    id: string;
    timestamp: string;
    type: 'add' | 'check' | 'remove' | 'reset' | 'update';
    data: unknown;
    description: string;
}

export class HistoryManager {
    history: HistoryEntry[];
    maxHistorySize: number;

    constructor() {
        this.history = [];
        this.maxHistorySize = 50; // Limit history size
    }

    // Add entry to history
    addEntry(type: HistoryEntry['type'], data: unknown, description: string): HistoryEntry {
        const entry = {
            id: Date.now() + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            type,
            data,
            description
        };
        
        this.history.unshift(entry); // Add to beginning of array
        
        // Trim history if it gets too large
        if (this.history.length > this.maxHistorySize) {
            this.history.pop();
        }
        
        return entry;
    }
    
    // Get entire history
    getHistory(): HistoryEntry[] {
        return [...this.history];
    }
    
    // Get a specific entry by ID
    getEntry(id: string): HistoryEntry | undefined {
        return this.history.find(entry => entry.id === id);
    }
    
    // Clear all history
    clearHistory(): void {
        this.history = [];
    }
}