document.addEventListener('DOMContentLoaded', () => {
    // Bloom Filter Implementation
    class BloomFilter {
        constructor(size, numHashFunctions) {
            this.size = size;
            this.numHashFunctions = numHashFunctions;
            this.bitArray = new Array(size).fill(false);
            this.words = new Set(); // Keep track of added words
        }

        // Reset the filter
        reset() {
            this.bitArray = new Array(this.size).fill(false);
            this.words.clear();
        }

        // Update filter parameters
        updateParams(size, numHashFunctions) {
            const oldWords = [...this.words];
            this.size = size;
            this.numHashFunctions = numHashFunctions;
            this.reset();
            
            // Re-add all words with new parameters
            oldWords.forEach(word => this.add(word));
            return oldWords;
        }

        // Simple hash functions for demonstration
        hash(word, seed) {
            let hash = 0;
            for (let i = 0; i < word.length; i++) {
                hash = ((hash << 5) - hash + word.charCodeAt(i) * seed) | 0;
            }
            return Math.abs(hash) % this.size;
        }

        // Get all hash positions for a word
        getHashPositions(word) {
            const positions = [];
            for (let i = 0; i < this.numHashFunctions; i++) {
                positions.push(this.hash(word, i + 1));
            }
            return positions;
        }

        // Add a word to the filter
        add(word) {
            if (this.words.has(word)) return false; // Word already added
            
            const positions = this.getHashPositions(word);
            positions.forEach(pos => {
                this.bitArray[pos] = true;
            });
            
            this.words.add(word);
            return true;
        }

        // Remove a word from the filter (Note: this is not a standard operation in bloom filters)
        remove(word) {
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
        mightContain(word) {
            const positions = this.getHashPositions(word);
            return positions.every(pos => this.bitArray[pos]);
        }

        // Check if a word is definitely in the filter
        definitelyContains(word) {
            return this.words.has(word);
        }

        // Get the current state of the filter
        getState() {
            return {
                bitArray: [...this.bitArray],
                words: [...this.words],
                size: this.size,
                numHashFunctions: this.numHashFunctions
            };
        }
    }

    // History manager to record and replay animations
    class HistoryManager {
        constructor() {
            this.history = [];
            this.maxHistorySize = 50; // Limit history size
        }

        // Add entry to history
        addEntry(type, data, description) {
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
        getHistory() {
            return [...this.history];
        }
        
        // Get a specific entry by ID
        getEntry(id) {
            return this.history.find(entry => entry.id === id);
        }
        
        // Clear all history
        clearHistory() {
            this.history = [];
        }
    }

    // UI Controller
    class BloomFilterVisualizer {
        constructor() {
            this.historyManager = new HistoryManager();
            this.currentAnimation = null;
            this.initializeElements();
            this.initializeEventListeners();
            this.initializeBloomFilter();
            this.animationSpeed = 1;
            this.isAnimating = false;
            this.updateRealtimeView = true;
        }

        initializeElements() {
            // Tab elements
            this.mainTabBtn = document.getElementById('mainTabBtn');
            this.historyTabBtn = document.getElementById('historyTabBtn');
            this.mainView = document.getElementById('mainView');
            this.historyView = document.getElementById('historyView');

            // Control elements
            this.filterSizeInput = document.getElementById('filterSize');
            this.hashFunctionsInput = document.getElementById('hashFunctions');
            this.resetBtn = document.getElementById('resetBtn');
            
            // Add word elements
            this.addWordInput = document.getElementById('addWordInput');
            this.addWordBtn = document.getElementById('addWordBtn');
            this.wordsList = document.getElementById('wordsList');
            
            // Check word elements
            this.checkWordInput = document.getElementById('checkWordInput');
            this.checkWordBtn = document.getElementById('checkWordBtn');
            this.resultDisplay = document.getElementById('resultDisplay');
            
            // Visualization elements
            this.bloomArray = document.getElementById('bloomArray');
            this.hashVisualization = document.getElementById('hashVisualization');
            this.animationArea = document.getElementById('animationArea');

            // History tab elements
            this.historyLog = document.getElementById('historyLog');
            this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
            this.animationSpeedInput = document.getElementById('animationSpeed');
            this.speedValue = document.getElementById('speedValue');
        }

        initializeEventListeners() {
            // Tab events
            this.mainTabBtn.addEventListener('click', () => this.switchTab('main'));
            this.historyTabBtn.addEventListener('click', () => this.switchTab('history'));
            
            // Control events
            this.resetBtn.addEventListener('click', () => this.resetFilter());
            this.filterSizeInput.addEventListener('change', () => this.updateFilterParams());
            this.hashFunctionsInput.addEventListener('change', () => this.updateFilterParams());
            
            // Add word event
            this.addWordBtn.addEventListener('click', () => this.addWord());
            this.addWordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addWord();
            });
            
            // Check word event
            this.checkWordBtn.addEventListener('click', () => this.checkWord());
            this.checkWordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.checkWord();
            });

            // History tab events
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
            this.animationSpeedInput.addEventListener('input', () => this.updateAnimationSpeed());

            // Handle window resize for responsive animations
            window.addEventListener('resize', () => this.handleResize());
        }

        initializeBloomFilter() {
            const size = parseInt(this.filterSizeInput.value);
            const numHashFunctions = parseInt(this.hashFunctionsInput.value);
            this.bloomFilter = new BloomFilter(size, numHashFunctions);
            this.renderBloomArray();
        }

        // Switch between main and history tabs
        switchTab(tab) {
            if (tab === 'main') {
                this.mainTabBtn.classList.add('active');
                this.historyTabBtn.classList.remove('active');
                this.mainView.classList.add('active');
                this.historyView.classList.remove('active');
                // Stop any animations in history tab
                if (this.currentAnimation) {
                    this.clearAnimations();
                    this.currentAnimation = null;
                }
                // Update the bloom array when returning to main view
                this.renderBloomArray();
            } else {
                this.mainTabBtn.classList.remove('active');
                this.historyTabBtn.classList.add('active');
                this.mainView.classList.remove('active');
                this.historyView.classList.add('active');
                this.renderHistoryLog();
            }
        }

        // Update animation speed
        updateAnimationSpeed() {
            this.animationSpeed = parseFloat(this.animationSpeedInput.value);
            this.speedValue.textContent = `${this.animationSpeed}x`;
        }

        // Handle window resize to update visualizations
        handleResize() {
            // Only re-render if currently animating
            if (this.isAnimating) {
                this.clearAnimations();
                // Reestablish animation with proper positions after resize
                requestAnimationFrame(() => {
                    if (this.currentAnimation) {
                        this.replayAnimation(this.currentAnimation.id);
                    }
                });
            }
        }

        // Reset the filter and update UI
        resetFilter() {
            this.bloomFilter.reset();
            this.renderBloomArray();
            this.renderWordsList();
            this.clearResults();
            
            // Animation for reset
            this.animateReset();

            // Add to history
            const entry = this.historyManager.addEntry(
                'reset', 
                { filterState: this.bloomFilter.getState() },
                'Reset Bloom Filter'
            );

            // Update history log if on history tab
            if (this.historyView.classList.contains('active')) {
                this.renderHistoryLog();
            }
        }

        // Update filter parameters
        updateFilterParams() {
            const size = parseInt(this.filterSizeInput.value);
            const numHashFunctions = parseInt(this.hashFunctionsInput.value);
            
            // Validate input values
            const validatedSize = Math.max(8, Math.min(128, size));
            const validatedHashFunctions = Math.max(1, Math.min(5, numHashFunctions));
            
            // Update input values if they were changed
            if (size !== validatedSize) this.filterSizeInput.value = validatedSize;
            if (numHashFunctions !== validatedHashFunctions) this.hashFunctionsInput.value = validatedHashFunctions;
            
            // Update filter with validated values
            const updatedWords = this.bloomFilter.updateParams(validatedSize, validatedHashFunctions);
            
            this.renderBloomArray();
            this.renderWordsList();
            this.clearResults();

            // Add to history
            const entry = this.historyManager.addEntry(
                'update', 
                { 
                    filterState: this.bloomFilter.getState(),
                    oldSize: size !== validatedSize ? size : null,
                    oldHashFunctions: numHashFunctions !== validatedHashFunctions ? numHashFunctions : null
                },
                `Updated filter parameters to size=${validatedSize}, hash functions=${validatedHashFunctions}`
            );

            // Update history log if on history tab
            if (this.historyView.classList.contains('active')) {
                this.renderHistoryLog();
            }
        }

        // Add a word to the filter
        addWord() {
            const word = this.addWordInput.value.trim();
            if (!word) return;
            
            if (this.bloomFilter.add(word)) {
                this.addWordInput.value = '';
                this.renderWordsList();
                this.renderBloomArray(); // Ensure bit array is updated
                
                // Animate the process of adding a word
                this.animateAddWord(word);

                // Add to history
                const entry = this.historyManager.addEntry(
                    'add', 
                    { 
                        word,
                        positions: this.bloomFilter.getHashPositions(word),
                        filterState: this.bloomFilter.getState()
                    },
                    `Added word "${word}" to the filter`
                );

                // Update history log if on history tab
                if (this.historyView.classList.contains('active')) {
                    this.renderHistoryLog();
                }
            } else {
                // Word already exists
                this.showMessage(`Word "${word}" is already in the filter.`, 'warning');
            }
        }

        // Check if a word exists in the filter
        checkWord() {
            const word = this.checkWordInput.value.trim();
            if (!word) return;
            
            const mightContain = this.bloomFilter.mightContain(word);
            const definitelyContains = this.bloomFilter.definitelyContains(word);
            
            // Animate the checking process
            this.animateCheckWord(word, mightContain, definitelyContains);

            // Add to history
            const entry = this.historyManager.addEntry(
                'check', 
                { 
                    word,
                    positions: this.bloomFilter.getHashPositions(word),
                    mightContain,
                    definitelyContains,
                    filterState: this.bloomFilter.getState()
                },
                `Checked if word "${word}" exists in the filter`
            );

            // Update history log if on history tab
            if (this.historyView.classList.contains('active')) {
                this.renderHistoryLog();
            }
        }

        // Remove a word from the filter
        removeWord(word) {
            if (this.bloomFilter.remove(word)) {
                this.renderBloomArray();
                this.renderWordsList();
                this.clearResults();
                
                // Animation for remove
                this.animateRemoveWord(word);

                // Add to history
                const entry = this.historyManager.addEntry(
                    'remove', 
                    { 
                        word,
                        filterState: this.bloomFilter.getState()
                    },
                    `Removed word "${word}" from the filter`
                );

                // Update history log if on history tab
                if (this.historyView.classList.contains('active')) {
                    this.renderHistoryLog();
                }
            }
        }

        // Render the bit array visualization
        renderBloomArray() {
            const { bitArray } = this.bloomFilter.getState();
            this.bloomArray.innerHTML = '';
            
            bitArray.forEach((bit, index) => {
                const bitElement = document.createElement('div');
                bitElement.className = `bit ${bit ? 'active' : ''}`;
                bitElement.textContent = bit ? '1' : '0';
                bitElement.dataset.index = index;
                
                // Add index label for every 4th bit
                if (index % 4 === 0) {
                    const indexLabel = document.createElement('span');
                    indexLabel.className = 'bit-index';
                    indexLabel.textContent = index;
                    bitElement.appendChild(indexLabel);
                }
                
                this.bloomArray.appendChild(bitElement);
            });
        }

        // Render the list of words
        renderWordsList() {
            const { words } = this.bloomFilter.getState();
            this.wordsList.innerHTML = '';
            
            if (words.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.textContent = 'No words added yet';
                emptyMessage.style.color = '#777';
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.padding = '10px';
                this.wordsList.appendChild(emptyMessage);
                return;
            }
            
            words.forEach(word => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item fade-in';
                
                const wordText = document.createElement('span');
                wordText.textContent = word;
                
                const removeBtn = document.createElement('span');
                removeBtn.className = 'remove-word';
                removeBtn.textContent = '×';
                removeBtn.addEventListener('click', () => this.removeWord(word));
                
                wordItem.appendChild(wordText);
                wordItem.appendChild(removeBtn);
                this.wordsList.appendChild(wordItem);
            });
        }

        // Render the history log
        renderHistoryLog() {
            const history = this.historyManager.getHistory();
            this.historyLog.innerHTML = '';
            
            if (history.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.textContent = 'No history entries yet';
                emptyMessage.style.color = '#777';
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.padding = '20px';
                this.historyLog.appendChild(emptyMessage);
                return;
            }
            
            history.forEach(entry => {
                const historyEntry = document.createElement('div');
                historyEntry.className = `history-entry ${entry.type}`;
                historyEntry.dataset.id = entry.id;
                
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.textContent = entry.timestamp;
                
                const description = document.createElement('div');
                description.className = 'description';
                description.textContent = entry.description;
                
                historyEntry.appendChild(timestamp);
                historyEntry.appendChild(description);
                
                // Add click event to replay animation
                historyEntry.addEventListener('click', () => this.replayAnimation(entry.id));
                
                this.historyLog.appendChild(historyEntry);
            });
        }

        // Replay an animation from history
        replayAnimation(entryId) {
            const entry = this.historyManager.getEntry(entryId);
            if (!entry) return;
            
            // Set current animation
            this.currentAnimation = entry;
            
            // Highlight the selected history entry
            const historyEntries = this.historyLog.querySelectorAll('.history-entry');
            historyEntries.forEach(el => {
                if (el.dataset.id === entryId) {
                    el.style.backgroundColor = '#e8f4fd';
                } else {
                    el.style.backgroundColor = '';
                }
            });

            // Remove any existing animation container
            let existingAnimationContainer = document.querySelector('.history-animation');
            if (existingAnimationContainer) {
                existingAnimationContainer.remove();
            }

            // Create a new animation container
            const historyAnimationContainer = document.createElement('div');
            historyAnimationContainer.className = 'history-animation';
            this.historyLog.parentNode.insertBefore(historyAnimationContainer, this.historyLog.nextSibling);

            // Create bloom array and animation area
            historyAnimationContainer.innerHTML = `
                <h3>Replay Animation</h3>
                <div class="bloom-array history-bloom-array"></div>
                <div class="animation-area history-animation-area">
                    <div class="hash-visualization"></div>
                </div>
            `;
            
            // Show animation container (with small delay to prevent transition)
            setTimeout(() => {
                historyAnimationContainer.classList.add('active');
            }, 10);
            
            const historyBloomArray = historyAnimationContainer.querySelector('.history-bloom-array');
            const historyAnimationArea = historyAnimationContainer.querySelector('.history-animation-area');
            
            // Render the bloom array based on the history state
            const { filterState } = entry.data;
            
            historyBloomArray.innerHTML = '';
            filterState.bitArray.forEach((bit, index) => {
                const bitElement = document.createElement('div');
                bitElement.className = `bit ${bit ? 'active' : ''}`;
                bitElement.textContent = bit ? '1' : '0';
                bitElement.dataset.index = index;
                
                if (index % 4 === 0) {
                    const indexLabel = document.createElement('span');
                    indexLabel.className = 'bit-index';
                    indexLabel.textContent = index;
                    bitElement.appendChild(indexLabel);
                }
                
                historyBloomArray.appendChild(bitElement);
            });
            
            // Play the animation based on the action type
            this.isAnimating = true;
            this.updateRealtimeView = false;
            
            switch (entry.type) {
                case 'add':
                    this.replayAddWordAnimation(entry.data.word, entry.data.positions, historyBloomArray, historyAnimationArea);
                    break;
                case 'check':
                    this.replayCheckWordAnimation(
                        entry.data.word, 
                        entry.data.positions, 
                        entry.data.mightContain, 
                        entry.data.definitelyContains, 
                        historyBloomArray, 
                        historyAnimationArea
                    );
                    break;
                case 'remove':
                    this.replayRemoveWordAnimation(entry.data.word, historyBloomArray, historyAnimationArea);
                    break;
                case 'reset':
                    this.replayResetAnimation(historyBloomArray, historyAnimationArea);
                    break;
            }
        }

        // Display a message in the result area
        showMessage(message, type = 'info', targetElement = null) {
            const messageElement = document.createElement('div');
            messageElement.className = `result-message result-${type} fade-in`;
            messageElement.textContent = message;
            
            const target = targetElement || this.resultDisplay;
            target.innerHTML = '';
            target.appendChild(messageElement);
        }

        // Clear the results display
        clearResults() {
            this.resultDisplay.innerHTML = '';
            this.clearAnimations();
        }

        // Clear history
        clearHistory() {
            this.historyManager.clearHistory();
            this.renderHistoryLog();
            // Remove animation container if exists
            const historyAnimationContainer = document.querySelector('.history-animation');
            if (historyAnimationContainer) {
                historyAnimationContainer.remove();
            }
            this.currentAnimation = null;
        }

        // Clear any active animations
        clearAnimations(targetArea = null) {
            const animArea = targetArea || this.animationArea;
            
            // Remove existing hash paths and labels
            const existingPaths = animArea.querySelectorAll('.hash-path, .hash-label');
            existingPaths.forEach(path => path.remove());
            
            // Remove highlights from bits - need to select from the correct parent
            const parent = targetArea ? 
                targetArea.closest('.history-animation').querySelector('.history-bloom-array') : 
                this.bloomArray;
            
            const highlightedBits = parent.querySelectorAll('.bit.highlight');
            highlightedBits.forEach(bit => bit.classList.remove('highlight'));
        }

        // Animation for resetting the filter
        animateReset() {
            const bits = this.bloomArray.querySelectorAll('.bit');
            this.isAnimating = true;
            
            bits.forEach((bit, index) => {
                setTimeout(() => {
                    bit.classList.add('highlight');
                    setTimeout(() => {
                        bit.classList.remove('highlight');
                        if (index === bits.length - 1) {
                            this.isAnimating = false;
                        }
                    }, 300 / this.animationSpeed);
                }, (index * 20) / this.animationSpeed);
            });
        }

        // Replay reset animation in history view
        replayResetAnimation(bloomArray, animationArea) {
            const bits = bloomArray.querySelectorAll('.bit');
            
            bits.forEach((bit, index) => {
                setTimeout(() => {
                    bit.classList.add('highlight');
                    setTimeout(() => {
                        bit.classList.remove('highlight');
                        if (index === bits.length - 1) {
                            this.isAnimating = false;
                        }
                    }, 300 / this.animationSpeed);
                }, (index * 20) / this.animationSpeed);
            });
        }

        // Animation for adding a word
        animateAddWord(word) {
            this.clearAnimations();
            const positions = this.bloomFilter.getHashPositions(word);
            const bits = this.bloomArray.querySelectorAll('.bit');
            this.isAnimating = true;
            
            // Create a word element at the top
            const wordElement = document.createElement('div');
            wordElement.className = 'hash-label';
            wordElement.textContent = `"${word}"`;
            wordElement.style.position = 'absolute';
            wordElement.style.top = '10px';
            wordElement.style.left = '50%';
            wordElement.style.transform = 'translateX(-50%)';
            this.animationArea.appendChild(wordElement);
            
            // Animate each hash function
            positions.forEach((pos, idx) => {
                setTimeout(() => {
                    // Create hash function label
                    const hashLabel = document.createElement('div');
                    hashLabel.className = 'hash-label';
                    hashLabel.textContent = `Hash ${idx + 1} → ${pos}`;
                    hashLabel.style.position = 'absolute';
                    hashLabel.style.top = '40px';
                    hashLabel.style.left = '50%';
                    hashLabel.style.transform = 'translateX(-50%)';
                    this.animationArea.appendChild(hashLabel);
                    
                    // Create and animate path to the bit
                    this.createAnimatedPathToBit(hashLabel, bits[pos], this.animationArea);
                    
                    // Show the result after all hash functions are done
                    if (idx === positions.length - 1) {
                        setTimeout(() => {
                            this.showMessage(`Word "${word}" added to the filter successfully.`, 'positive');
                            this.isAnimating = false;
                        }, (600 / this.animationSpeed));
                    }
                    
                    // Clean up after a delay
                    setTimeout(() => {
                        bits[pos].classList.remove('highlight');
                    }, (800 / this.animationSpeed));
                }, (idx * 600) / this.animationSpeed);
            });
        }

        // Replay add word animation in history view
        replayAddWordAnimation(word, positions, bloomArray, animationArea) {
            const bits = bloomArray.querySelectorAll('.bit');
            
            // Create a word element at the top
            const wordElement = document.createElement('div');
            wordElement.className = 'hash-label';
            wordElement.textContent = `"${word}"`;
            wordElement.style.position = 'absolute';
            wordElement.style.top = '10px';
            wordElement.style.left = '50%';
            wordElement.style.transform = 'translateX(-50%)';
            animationArea.appendChild(wordElement);
            
            // Animate each hash function
            positions.forEach((pos, idx) => {
                setTimeout(() => {
                    // Create hash function label
                    const hashLabel = document.createElement('div');
                    hashLabel.className = 'hash-label';
                    hashLabel.textContent = `Hash ${idx + 1} → ${pos}`;
                    hashLabel.style.position = 'absolute';
                    hashLabel.style.top = '40px';
                    hashLabel.style.left = '50%';
                    hashLabel.style.transform = 'translateX(-50%)';
                    animationArea.appendChild(hashLabel);
                    
                    // Create and animate path
                    this.createAnimatedPathToBit(hashLabel, bits[pos], animationArea);
                    
                    // Show result if it's the last hash function
                    if (idx === positions.length - 1) {
                        setTimeout(() => {
                            const resultArea = animationArea.parentNode.querySelector('.result-display') || 
                                              document.createElement('div');
                            if (!resultArea.parentNode) {
                                resultArea.className = 'result-display';
                                animationArea.parentNode.appendChild(resultArea);
                            }
                            this.showMessage(`Word "${word}" added to the filter.`, 'positive', resultArea);
                            this.isAnimating = false;
                        }, (600 / this.animationSpeed));
                    }
                }, (idx * 600) / this.animationSpeed);
            });
        }

        // Animation for checking a word
        animateCheckWord(word, mightContain, definitelyContains) {
            this.clearAnimations();
            const positions = this.bloomFilter.getHashPositions(word);
            const bits = this.bloomArray.querySelectorAll('.bit');
            this.isAnimating = true;
            
            // Create a word element at the top
            const wordElement = document.createElement('div');
            wordElement.className = 'hash-label';
            wordElement.textContent = `"${word}"`;
            wordElement.style.position = 'absolute';
            wordElement.style.top = '10px';
            wordElement.style.left = '50%';
            wordElement.style.transform = 'translateX(-50%)';
            this.animationArea.appendChild(wordElement);
            
            // Track if we've determined the word is not in the filter
            let definitelyNotInFilter = false;
            
            // Animate each hash position check
            positions.forEach((pos, idx) => {
                setTimeout(() => {
                    // Skip if we've already determined the word is not in the filter
                    if (definitelyNotInFilter) return;
                
                    // Create hash function label
                    const hashLabel = document.createElement('div');
                    hashLabel.className = 'hash-label';
                    hashLabel.textContent = `Check Hash ${idx + 1} → ${pos}`;
                    hashLabel.style.position = 'absolute';
                    hashLabel.style.top = '40px';
                    hashLabel.style.left = '50%';
                    hashLabel.style.transform = 'translateX(-50%)';
                    this.animationArea.appendChild(hashLabel);
                    
                    // Create and animate path
                    this.createAnimatedPathToBit(hashLabel, bits[pos], this.animationArea);
                    
                    // Show bit check result
                    setTimeout(() => {
                        const bitValue = this.bloomFilter.bitArray[pos];
                        const resultLabel = document.createElement('div');
                        resultLabel.className = 'hash-label';
                        resultLabel.textContent = bitValue ? 'Bit is 1 ✓' : 'Bit is 0 ✗';
                        resultLabel.style.position = 'absolute';
                        
                        // Position below the bit
                        const bitRect = bits[pos].getBoundingClientRect();
                        const animRect = this.animationArea.getBoundingClientRect();
                        const top = bitRect.bottom - animRect.top + 10;
                        const left = bitRect.left - animRect.left + bitRect.width / 2;
                        
                        resultLabel.style.top = `${top}px`;
                        resultLabel.style.left = `${left}px`;
                        resultLabel.style.transform = 'translateX(-50%)';
                        resultLabel.style.backgroundColor = bitValue ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)';
                        this.animationArea.appendChild(resultLabel);
                        
                        // If any bit is 0, we can immediately determine the word is not in the filter
                        if (!bitValue) {
                            definitelyNotInFilter = true;
                            setTimeout(() => {
                                this.showMessage(`"${word}" is definitely NOT in the filter.`, 'negative');
                            }, (300 / this.animationSpeed));
                        }
                    }, (300 / this.animationSpeed));
                }, (idx * 1000) / this.animationSpeed);
            });
            
            // Show final result after all animations if word might be in the filter
            setTimeout(() => {
                if (!definitelyNotInFilter && mightContain) {
                    if (definitelyContains) {
                        this.showMessage(`"${word}" is in the filter.`, 'positive');
                    } else {
                        this.showMessage(`"${word}" might be in the filter (false positive).`, 'warning');
                    }
                }
                
                // End animation state
                setTimeout(() => {
                    this.isAnimating = false;
                }, (1000 / this.animationSpeed));
            }, ((positions.length + 0.5) * 1000) / this.animationSpeed);
        }

        // Replay check word animation in history view
        replayCheckWordAnimation(word, positions, mightContain, definitelyContains, bloomArray, animationArea) {
            const bits = bloomArray.querySelectorAll('.bit');
            
            // Create a word element at the top
            const wordElement = document.createElement('div');
            wordElement.className = 'hash-label';
            wordElement.textContent = `"${word}"`;
            wordElement.style.position = 'absolute';
            wordElement.style.top = '10px';
            wordElement.style.left = '50%';
            wordElement.style.transform = 'translateX(-50%)';
            animationArea.appendChild(wordElement);
            
            // Track if we've determined the word is not in the filter
            let definitelyNotInFilter = false;
            
            // Animate each hash position check
            positions.forEach((pos, idx) => {
                setTimeout(() => {
                    // Skip if we've already determined the word is not in the filter
                    if (definitelyNotInFilter) return;
                
                    // Create hash function label
                    const hashLabel = document.createElement('div');
                    hashLabel.className = 'hash-label';
                    hashLabel.textContent = `Check Hash ${idx + 1} → ${pos}`;
                    hashLabel.style.position = 'absolute';
                    hashLabel.style.top = '40px';
                    hashLabel.style.left = '50%';
                    hashLabel.style.transform = 'translateX(-50%)';
                    animationArea.appendChild(hashLabel);
                    
                    // Create and animate path
                    this.createAnimatedPathToBit(hashLabel, bits[pos], animationArea);
                    
                    // Show bit check result
                    setTimeout(() => {
                        // Check if the bit is set based on the recorded positions
                        const bitValue = bloomArray.querySelectorAll('.bit')[pos].classList.contains('active');
                        const resultLabel = document.createElement('div');
                        resultLabel.className = 'hash-label';
                        resultLabel.textContent = bitValue ? 'Bit is 1 ✓' : 'Bit is 0 ✗';
                        resultLabel.style.position = 'absolute';
                        
                        // Position below the bit
                        const bitRect = bits[pos].getBoundingClientRect();
                        const animRect = animationArea.getBoundingClientRect();
                        const top = bitRect.bottom - animRect.top + 10;
                        const left = bitRect.left - animRect.left + bitRect.width / 2;
                        
                        resultLabel.style.top = `${top}px`;
                        resultLabel.style.left = `${left}px`;
                        resultLabel.style.transform = 'translateX(-50%)';
                        resultLabel.style.backgroundColor = bitValue ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)';
                        animationArea.appendChild(resultLabel);
                        
                        // If any bit is 0, we can immediately determine the word is not in the filter
                        if (!bitValue) {
                            definitelyNotInFilter = true;
                            // Create result area for history animation if it doesn't exist
                            const resultArea = animationArea.parentNode.querySelector('.result-display') || 
                                              document.createElement('div');
                            if (!resultArea.parentNode) {
                                resultArea.className = 'result-display';
                                animationArea.parentNode.appendChild(resultArea);
                            }
                            setTimeout(() => {
                                this.showMessage(`"${word}" is definitely NOT in the filter.`, 'negative', resultArea);
                            }, (300 / this.animationSpeed));
                        }
                    }, (300 / this.animationSpeed));
                }, (idx * 1000) / this.animationSpeed);
            });
            
            // Show final result after all animations
            setTimeout(() => {
                // Create result area for history animation if it doesn't exist
                const resultArea = animationArea.parentNode.querySelector('.result-display') || 
                                   document.createElement('div');
                if (!resultArea.parentNode) {
                    resultArea.className = 'result-display';
                    animationArea.parentNode.appendChild(resultArea);
                }
                
                if (!definitelyNotInFilter && mightContain) {
                    if (definitelyContains) {
                        this.showMessage(`"${word}" is in the filter.`, 'positive', resultArea);
                    } else {
                        this.showMessage(`"${word}" might be in the filter (false positive).`, 'warning', resultArea);
                    }
                }
                
                // End animation state
                setTimeout(() => {
                    this.isAnimating = false;
                }, (1000 / this.animationSpeed));
            }, ((positions.length + 0.5) * 1000) / this.animationSpeed);
        }

        // Animation for removing a word
        animateRemoveWord(word) {
            const bits = this.bloomArray.querySelectorAll('.bit');
            this.isAnimating = true;
            
            bits.forEach((bit, index) => {
                if (bit.classList.contains('active')) {
                    setTimeout(() => {
                        bit.classList.add('highlight');
                        setTimeout(() => {
                            bit.classList.remove('highlight');
                            if (index === bits.length - 1) {
                                this.isAnimating = false;
                            }
                        }, (300 / this.animationSpeed));
                    }, (index * 20) / this.animationSpeed);
                }
            });
            
            setTimeout(() => {
                this.showMessage(`Word "${word}" removed from the filter.`, 'warning');
            }, 300);
        }

        // Replay remove word animation in history view
        replayRemoveWordAnimation(word, bloomArray, animationArea) {
            const bits = bloomArray.querySelectorAll('.bit');
            
            bits.forEach((bit, index) => {
                if (bit.classList.contains('active')) {
                    setTimeout(() => {
                        bit.classList.add('highlight');
                        setTimeout(() => {
                            bit.classList.remove('highlight');
                            if (index === bits.length - 1) {
                                this.isAnimating = false;
                            }
                        }, (300 / this.animationSpeed));
                    }, (index * 20) / this.animationSpeed);
                }
            });
            
            setTimeout(() => {
                // Create result area for history animation if it doesn't exist
                const resultArea = animationArea.parentNode.querySelector('.result-display') || 
                                  document.createElement('div');
                if (!resultArea.parentNode) {
                    resultArea.className = 'result-display';
                    animationArea.parentNode.appendChild(resultArea);
                }
                
                this.showMessage(`Word "${word}" removed from the filter.`, 'warning', resultArea);
            }, 300);
        }

        // Helper method to create animated path between two elements
        createAnimatedPathToBit(sourceElement, targetElement, container) {
            // Get positions relative to the container
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate start and end positions
            const startX = sourceRect.left + sourceRect.width / 2 - containerRect.left;
            const startY = sourceRect.bottom - containerRect.top;
            const endX = targetRect.left + targetRect.width / 2 - containerRect.left;
            const endY = targetRect.top - containerRect.top;
            
            // Calculate path properties
            const dx = endX - startX;
            const dy = endY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Create path element
            const path = document.createElement('div');
            path.className = 'hash-path';
            path.style.position = 'absolute';
            path.style.top = `${startY}px`;
            path.style.left = `${startX}px`;
            path.style.width = '0';
            path.style.transform = `rotate(${angle}deg)`;
            container.appendChild(path);
            
            // Animate path drawing and highlight bit
            requestAnimationFrame(() => {
                path.style.width = `${distance}px`;
                targetElement.classList.add('highlight');
            });
            
            return path;
        }
    }

    // Initialize the visualizer
    const visualizer = new BloomFilterVisualizer();
});