class WoordleGame {
    constructor() {
        this.wordLength = 5;
        this.maxAttempts = 6;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameActive = true;
        this.currentWord = '';
        this.targetWord = '';
        this.gameMode = 'daily';
        this.keyboardState = {};
        this.isSubmitting = false; // Prevent multiple rapid submissions
        this.lastKeyTime = 0; // For debouncing
        this.endGameTimeoutId = null;

        
        // Word lists - will be loaded from files
        this.answerWords = []; // Words that can be answers (from wordle-answers-alphabetical.txt)
        this.validWords = []; // All valid guesses (from valid-wordle-words.txt)
        
        this.gameAnalytics = new GameAnalytics('alpha_bit');

        // Initialize the game after loading words
        this.initializeGame();

    }

    async initializeGame() {
        try {
            // Load both word lists
            await this.loadWordsFromFiles();
            
            // Initialize elements and setup (existing code)
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            
            // Create game board and keyboard (existing code)
            this.createGameBoard();
            this.createKeyboard();
            
            // Determine game mode from localStorage or default to 'daily'
            const savedMode = localStorage.getItem('woordle-gameMode');
            this.gameMode = savedMode || 'daily';
            this.dailyMode.classList.toggle('active', this.gameMode === 'daily');
            this.infiniteMode.classList.toggle('active', this.gameMode === 'infinite');

            // Start the first game
            this.startNewGame();

            // Track page view
            if (window.analytics) {
                window.analytics.trackPageView('Alpha-Bit Game', window.location.href);
            }
            
        } catch (error) {
            console.error('Failed to load words:', error);
            // Fallback to a basic word list if file loading fails
            this.answerWords = [
                'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
                'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
                'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
                'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT', 'AVOID',
                'AWAKE', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN', 'BEING',
                'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLAST', 'BLIND', 'BLOCK',
                'BLOOD', 'BOARD', 'BOAST', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRAVE', 'BREAD',
                'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BURST'
            ];
            this.validWords = [...this.answerWords];
            
            // Continue with initialization
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            this.createGameBoard();
            this.createKeyboard();
            this.startNewGame();


            // Track page view even with fallback
            if (window.analytics) {
                window.analytics.trackPageView('Alpha-Bit Game', window.location.href);
            }
        }
    }

    async loadWordsFromFiles() {
        // Load answer words from wordle-answers-alphabetical.txt
        const answerResponse = await fetch('data/wordle-answers-alphabetical.txt');
        if (!answerResponse.ok) {
            throw new Error(`HTTP error loading answers! status: ${answerResponse.status}`);
        }
        
        const answerText = await answerResponse.text();
        
        // Split by lines and filter out empty lines, then convert to uppercase
        this.answerWords = answerText
            .split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === this.wordLength);
        
        // Load valid guess words from valid-wordle-words.txt
        const validResponse = await fetch('data/valid-wordle-words.txt');
        if (!validResponse.ok) {
            throw new Error(`HTTP error loading valid words! status: ${validResponse.status}`);
        }
        
        const validText = await validResponse.text();
        
        // Split by lines and filter out empty lines, then convert to uppercase
        this.validWords = validText
            .split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === this.wordLength);
        
        console.log(`Loaded ${this.answerWords.length} answer words and ${this.validWords.length} valid guess words`);
        
        if (this.answerWords.length === 0) {
            throw new Error('No valid 5-letter answer words found in file');
        }
        
        if (this.validWords.length === 0) {
            throw new Error('No valid 5-letter guess words found in file');
        }
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.keyboard = document.getElementById('keyboard');
        this.message = document.getElementById('message');
        this.attemptsLeft = document.getElementById('attemptsLeft');
        this.gamesWon = document.getElementById('gamesWon');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.winStreak = document.getElementById('winStreak');
        this.dailyMode = document.getElementById('dailyMode');
        this.infiniteMode = document.getElementById('infiniteMode');
        this.newGameButton = document.getElementById('newGameButton');
        this.shareButton = document.getElementById('shareButton');
        this.definitionButton = document.getElementById('definitionButton');
        this.statsButton = document.getElementById('statsButton');
    }

    setupEventListeners() {
        this.dailyMode.addEventListener('click', () => this.setGameMode('daily'));
        this.infiniteMode.addEventListener('click', () => this.setGameMode('infinite'));
        this.newGameButton.addEventListener('click', () => this.startNewGame(true)); // Pass true to force new game

    if (this.shareButton) {
        this.shareButton.addEventListener('click', () => this.shareResults());
    }
    
    if (this.definitionButton) {
        this.definitionButton.addEventListener('click', () => this.searchDefinition());
    }

    if (this.statsButton) {
        this.statsButton.addEventListener('click', () => this.showStatsModal());
    }

    const statsModal = document.getElementById('statsModal');
    if (statsModal) {
        const closeModalButton = statsModal.querySelector('.modal-close-button');
        const closeModal = () => statsModal.style.display = 'none';

        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }
        statsModal.addEventListener('click', (e) => {
            if (e.target === statsModal) {
                closeModal();
            }
        });
    }
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setGameMode(mode) {
        if (this.gameMode === mode) return; // Do nothing if mode is already active
        this.gameMode = mode;
        localStorage.setItem('woordle-gameMode', mode); // Save selected mode
        this.dailyMode.classList.toggle('active', mode === 'daily');
        this.infiniteMode.classList.toggle('active', mode === 'infinite');

        this.updateStatsDisplay();

        // Explicitly reset the keyboard's visual state before loading/starting the new game
        this.resetKeyboard();

        this.startNewGame(); // Allows loading a saved game instead of forcing a new one

        this.gameAnalytics.trackGameAction('game_mode_change', { mode: mode });
    }

    createGameBoard() {
        this.gameBoard.innerHTML = '';
        for (let row = 0; row < this.maxAttempts; row++) {
            const guessRow = document.createElement('div');
            guessRow.className = 'guess-row';
            guessRow.id = `row-${row}`;
            
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.createElement('div');
                tile.className = 'letter-tile';
                tile.id = `tile-${row}-${col}`;
                guessRow.appendChild(tile);
            }
            
            this.gameBoard.appendChild(guessRow);
        }
    }

    createKeyboard() {
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        this.keyboard.innerHTML = '';
        
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = key.length > 1 ? 'key wide' : 'key';
                keyButton.textContent = key === 'BACKSPACE' ? '⌫' : key;
                keyButton.dataset.key = key;
                keyButton.addEventListener('click', () => this.handleKeyClick(key));
                keyboardRow.appendChild(keyButton);
            });
            
            this.keyboard.appendChild(keyboardRow);
        });
    }

    hideAllButtons() {
        if (this.statsButton) { 
            this.statsButton.style.display = 'none';
        }

        if (this.shareButton) {
            this.shareButton.style.display = 'none';
        }
        if (this.definitionButton) {
            this.definitionButton.style.display = 'none';
        }
        if (this.newGameButton) {
            this.newGameButton.style.display = 'none';
        }
    }
    
    startNewGame(forceNew = false) {

        if (this.endGameTimeoutId) {
            clearTimeout(this.endGameTimeoutId);
            this.endGameTimeoutId = null;
        }

        this.hideAllButtons();

        // Make sure words are loaded before starting
        if (this.answerWords.length === 0) {
            console.error('Cannot start game: answer word list not loaded');
            return;
        }

        // Try to load state unless a new game is forced
        if (!forceNew && this.loadGameState()) {
            console.log("Loaded saved game state.");
            return;
        }

        // If no saved state or new game is forced, reset everything
        this.clearGameState();
        this.currentRow = 0;
        this.currentCol = 0;
        this.currentWord = '';
        this.gameActive = true;
        this.keyboardState = {};
        this.isSubmitting = false; // Reset submission flag
        this.lastKeyTime = 0; // Reset debounce timer
        
        // Clear the board
        this.createGameBoard();
        
        // Reset keyboard visuals
        this.resetKeyboard();

        // Select target word from answer words only
        if (this.gameMode === 'daily') {
            this.targetWord = this.getDailyWord();
            this.updateMessage("Solve today's daily word!", "info");
        } else {
            this.targetWord = this.getRandomWord();
            this.updateMessage("Guess the 5-letter word!", "info");
        }
        
        this.updateAttemptsDisplay();
        this.saveGameState(); // Save the initial state of the new game
        
        console.log('Target word:', this.targetWord); // For debugging

        this.gameAnalytics.trackGameStart(this.gameMode);
    }

    resetKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.className = key.classList.contains('wide') ? 'key wide' : 'key';
            key.style.visibility = 'visible';
            key.disabled = false;
        });
    }

    getDailyWord() {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const seed = this.hashCode(dateString);
        const pseudoRandomValue = this.seededRandom(seed);
        const index = Math.floor(pseudoRandomValue * this.answerWords.length);
        return this.answerWords[index];
    }

    getRandomWord() {
        return this.answerWords[Math.floor(Math.random() * this.answerWords.length)];
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    seededRandom(seed) {
        // A simple but effective pseudo-random number generator (mulberry32)
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    handleKeyPress(e) {
        if (!this.gameActive || this.isSubmitting) return;
        
        const key = e.key.toUpperCase();
        const currentTime = Date.now();
        
        if (currentTime - this.lastKeyTime < 50) {
            return;
        }
        this.lastKeyTime = currentTime;

        if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
            e.preventDefault();
        } else {
            return;
        }
        
        if (key.match(/[A-Z]/) && key.length === 1) {
            const keyElement = document.querySelector(`[data-key="${key}"]`);
            if (keyElement && keyElement.disabled) return;
        }
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (key.match(/[A-Z]/) && key.length === 1) {
            this.addLetter(key);
        }
    }

    handleKeyClick(key) {
        if (!this.gameActive || this.isSubmitting) return;
        
        const currentTime = Date.now();
        
        if (currentTime - this.lastKeyTime < 50) {
            return;
        }
        this.lastKeyTime = currentTime;
        
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        if (keyElement && keyElement.disabled) return;
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else {
            this.addLetter(key);
        }
    }

    addLetter(letter) {
        if (this.isSubmitting || this.currentCol >= this.wordLength) return;
        
        const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
        tile.textContent = letter;
        tile.classList.add('filled');
        this.currentWord += letter;
        this.currentCol++;
    }

    deleteLetter() {
        if (this.isSubmitting) return;
        
        if (this.currentCol > 0) {
            this.currentCol--;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            this.currentWord = this.currentWord.slice(0, -1);
        }
    }

    async submitGuess() {
        if (this.isSubmitting) return;
        
        if (this.currentWord.length !== this.wordLength) {
            this.updateMessage("Not enough letters!", "error");
            this.playSound('error');
            return;
        }
        
        if (!this.isValidWord(this.currentWord)) {
            this.updateMessage("Not in word list!", "error");
            this.playSound('error');
            this.shakeRow(this.currentRow);
            
            return;
        }
        
        this.isSubmitting = true;
        
        await this.checkGuess();
        
        if (this.currentWord === this.targetWord) {
            this.gameActive = false; // Set game inactive before saving state
            this.saveGameState(); 
            setTimeout(() => {
                this.handleWin();
            }, this.wordLength * 100 + 200);
        } else if (this.currentRow >= this.maxAttempts - 1) {
            this.gameActive = false; // Set game inactive before saving state
            this.saveGameState(); 
            setTimeout(() => {
                this.handleLoss();
            }, this.wordLength * 100 + 200);
        } else {
            this.currentRow++;
            this.currentCol = 0;
            this.currentWord = '';
            this.updateAttemptsDisplay();
            this.isSubmitting = false;
            this.saveGameState(); 
        }
    }

    isValidWord(word) {
        return this.validWords.includes(word);
    }

    checkGuess() {
        return new Promise(resolve => {
            const targetLetters = [...this.targetWord];
            const guessLetters = [...this.currentWord];
            const results = new Array(this.wordLength).fill('absent');
            const row = this.currentRow; 
            const word = this.currentWord;
            
            for (let i = 0; i < this.wordLength; i++) {
                if (guessLetters[i] === targetLetters[i]) {
                    results[i] = 'correct';
                    targetLetters[i] = null; 
                    guessLetters[i] = null;
                }
            }
            
            for (let i = 0; i < this.wordLength; i++) {
                if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
                    results[i] = 'present';
                    targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
                }
            }
            
            results.forEach((result, i) => {
                setTimeout(() => {
                    const tile = document.getElementById(`tile-${row}-${i}`);
                    if (tile) tile.classList.add(result);
                    
                    const letter = word[i];
                    if (!this.keyboardState[letter] || 
                        (this.keyboardState[letter] !== 'correct' && result === 'correct') ||
                        (this.keyboardState[letter] === 'absent' && result === 'present')) {
                        this.keyboardState[letter] = result;
                    }

                    if (i === results.length - 1) {
                         setTimeout(() => {
                            this.updateKeyboard();
                            this.playSound('flip');
                            resolve(); 
                        }, 100);
                    }
                }, i * 100);
            });
        });
    }

    updateKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            const letter = key.dataset.key;
            if (this.keyboardState[letter]) {
                key.classList.remove('correct', 'present', 'absent');
                
                if (this.keyboardState[letter] === 'absent') {
                    key.style.visibility = 'hidden';
                    key.disabled = true;
                } else {
                    key.classList.add(this.keyboardState[letter]);
                    key.style.visibility = 'visible';
                    key.disabled = false;
                }
            }
        });
    }

    handleWin() {
        this.gameActive = false;
        const attempts = this.currentRow + 1;
        this.updateMessage(`🎉 Excellent! You got it in ${attempts} attempt${attempts === 1 ? '' : 's'}!`, "success");
        this.playSound('win');

        this.gameAnalytics.trackGameEnd(true, attempts);

        this.createConfetti();
        
        const stats = this.getStats();
        // Check if stats for this game have already been recorded
        if (stats.lastGamePlayed !== this.targetWord) {
            stats.gamesWon++;
            stats.gamesPlayed++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            stats.guessDistribution[this.currentRow]++ // record winning guess
            stats.lastGamePlayed = this.targetWord; // Mark this game as recorded
            this.saveStats(stats);
        }
        this.updateStatsDisplay();


        
        // Store the timer ID when it's created
        this.endGameTimeoutId = setTimeout(() => {
            if (this.statsButton) this.statsButton.style.display = 'inline-block';
            if (this.gameMode === 'daily' && this.shareButton) {
                this.shareButton.style.display = 'inline-block';
            }
            if (this.definitionButton) this.definitionButton.style.display = 'inline-block';
            if (this.gameMode !== 'daily' && this.newGameButton) {
                this.newGameButton.style.display = 'inline-block';
            }
        }, 500);
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The word was "${this.targetWord}".`, "error");
        this.playSound('lose');

        this.gameAnalytics.trackGameEnd(false, this.currentRow + 1);
        
        const stats = this.getStats();
         // Check if stats for this game have already been recorded
        if (stats.lastGamePlayed !== this.targetWord) {
            stats.gamesPlayed++;
            stats.currentStreak = 0;
            stats.lastGamePlayed = this.targetWord; // Mark this game as recorded
            this.saveStats(stats);
        }
        this.updateStatsDisplay();
        
        // Store the timer ID when it's created
        this.endGameTimeoutId = setTimeout(() => {
            if (this.statsButton) this.statsButton.style.display = 'inline-block';
            if (this.definitionButton) this.definitionButton.style.display = 'inline-block';
            if (this.gameMode !== 'daily' && this.newGameButton) {
                this.newGameButton.style.display = 'inline-block';
            }
        }, 500);
    }
    
    saveGameState() {
        const boardState = [];
        // Determine the correct number of rows to save.
        // If the game is over, we need to include the last row (currentRow + 1).
        // If it's active, we only save the completed rows (up to currentRow).
        const loopEnd = this.gameActive ? this.currentRow : this.currentRow + 1;

        for (let row = 0; row < loopEnd; row++) {
            // Check if the row exists to prevent errors
            if (document.getElementById(`row-${row}`)) {
                let guess = '';
                for (let col = 0; col < this.wordLength; col++) {
                    const tile = document.getElementById(`tile-${row}-${col}`);
                    if (tile && tile.textContent) {
                        guess += tile.textContent;
                    }
                }
                if (guess.length === this.wordLength) {
                    boardState.push(guess);
                }
            }
        }

        const state = {
            targetWord: this.targetWord,
            boardState: boardState,
            currentRow: this.currentRow,
            gameActive: this.gameActive,
            keyboardState: this.keyboardState
        };
        localStorage.setItem(`woordle-gameState-${this.gameMode}-v2`, JSON.stringify(state));
    }


    loadGameState() {
        const savedStateJSON = localStorage.getItem(`woordle-gameState-${this.gameMode}-v2`);
        if (!savedStateJSON) return false;

        const savedState = JSON.parse(savedStateJSON);

        // Daily word validation: if the saved word is not today's word, invalidate state
        if (this.gameMode === 'daily') {
            const dailyWord = this.getDailyWord();
            if (savedState.targetWord !== dailyWord) {
                this.clearGameState();
                return false;
            }
        }

        this.targetWord = savedState.targetWord;
        this.currentRow = savedState.currentRow;
        this.gameActive = savedState.gameActive;
        this.keyboardState = savedState.keyboardState;
        this.currentWord = '';
        this.currentCol = 0;
        
        this.rebuildBoard(savedState.boardState);
        this.updateKeyboard();
        this.updateAttemptsDisplay();

        if (!this.gameActive) {
            if (savedState.boardState.includes(this.targetWord)) {
                this.handleWin();
            } else {
                this.handleLoss();
            }
        } else {
             this.updateMessage("Welcome back!", "info");
             this.hideAllButtons(); // This is the fix
        }

        return true;
    }
    
    rebuildBoard(boardState) {
        this.createGameBoard(); // Clear existing board first
        boardState.forEach((guess, row) => {
            const targetLetters = [...this.targetWord];
            const guessLetters = [...guess];
            
            for (let i = 0; i < this.wordLength; i++) {
                if (guessLetters[i] === targetLetters[i]) {
                    targetLetters[i] = null;
                    guessLetters[i] = null;
                }
            }

            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                const letter = guess[col];
                tile.textContent = letter;
                
                let tileClass = 'absent';
                if (guess[col] === this.targetWord[col]) {
                    tileClass = 'correct';
                } else if (targetLetters.includes(guess[col])) {
                    tileClass = 'present';
                    targetLetters[targetLetters.indexOf(guess[col])] = null;
                }
                tile.classList.add(tileClass, 'filled');
            }
        });
    }

    clearGameState() {
        localStorage.removeItem(`woordle-gameState-${this.gameMode}-v2`);
    }


    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    updateAttemptsDisplay() {
        const remaining = this.maxAttempts - this.currentRow;
        this.attemptsLeft.textContent = `${remaining} attempt${remaining === 1 ? '' : 's'} left`;
        
        if (remaining <= 2) {
            this.attemptsLeft.style.color = '#ff4444';
        } else {
            this.attemptsLeft.style.color = '#ffeb3b';
        }
    }

    shakeRow(row) {
        const rowElement = document.getElementById(`row-${row}`);
        rowElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            rowElement.style.animation = '';
        }, 500);
    }

    clearCurrentRow() {
        for (let col = 0; col < this.wordLength; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            tile.textContent = '';
            tile.classList.remove('filled');
        }
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = 'confettiFall 3s linear forwards';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }

    playSound(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (!audioContext) return; // AudioContext not supported
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'win': frequency = 523.25; duration = 0.5; break;
            case 'lose': frequency = 220; duration = 0.8; break;
            case 'flip': frequency = 330; duration = 0.2; break;
            case 'error': frequency = 200; duration = 0.3; break;
            default: frequency = 440; duration = 0.2;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    getStats() {
        const key = `woordle-stats-v2-${this.gameMode}`; // Create a dynamic key
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0,
            lastGamePlayed: null,
            guessDistribution: [0, 0, 0, 0, 0, 0]
        };

        const saved = localStorage.getItem(key); 
        const stats = saved ? JSON.parse(saved) : defaultStats;

        if (!stats.guessDistribution) {
            stats.guessDistribution = defaultStats.guessDistribution;
        }

        return stats;
    }

    saveStats(stats) {
        const key = `woordle-stats-v2-${this.gameMode}`; // Create the same dynamic key
        localStorage.setItem(key, JSON.stringify(stats));
    }

    loadStats() {
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.winStreak.textContent = stats.currentStreak;
    }

     showStatsModal(winningRow = -1) { // winningRow is 1-based index
        const stats = this.getStats();
        const modal = document.getElementById('statsModal');

        this.gameAnalytics.trackButtonClick('show_stats');


        if (!modal) return;

        // Populate Stats
        document.getElementById('statsPlayed').textContent = stats.gamesPlayed;
        const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
        document.getElementById('statsWinRate').textContent = winRate;
        document.getElementById('statsCurrentStreak').textContent = stats.currentStreak;
        document.getElementById('statsMaxStreak').textContent = stats.maxStreak;

        // Populate Guess Distribution
        const distributionContainer = document.getElementById('guessDistribution');
        distributionContainer.innerHTML = ''; // Clear previous bars
        const totalWins = stats.guessDistribution.reduce((a, b) => a + b, 0);

        stats.guessDistribution.forEach((count, index) => {
            const row = document.createElement('div');
            row.className = 'dist-item';

            const bar = document.createElement('div');
            bar.className = 'dist-bar';
            bar.textContent = count;

            if ((index + 1) === winningRow) {
                bar.classList.add('highlight');
            }

            const width = totalWins > 0 ? (count / Math.max(...stats.guessDistribution)) * 100 : 0;
            bar.style.width = `${Math.max(width, 5)}%`; // Use a minimum width for visibility

            const label = document.createElement('span');
            label.textContent = index + 1;

            row.appendChild(label);
            row.appendChild(bar);
            distributionContainer.appendChild(row);
        });

        modal.style.display = 'flex';
    }   

    searchDefinition() {
        const searchQuery = `${this.targetWord.toLowerCase()} definition meaning`;

        this.gameAnalytics.trackButtonClick('search_definition');


        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        window.open(googleSearchUrl, '_blank');
    }

    shareResults() {
        const shareText = this.generateShareText();

        this.gameAnalytics.trackButtonClick('share_results');

        if (navigator.share) {
            navigator.share({ text: shareText }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.updateMessage('📋 Results copied to clipboard!', 'success');
                setTimeout(() => {
                    const attempts = this.currentRow + 1;
                    this.updateMessage(`🎉 Excellent! You got it in ${attempts} attempt${attempts === 1 ? '' : 's'}!`, "success");
                }, 2000);
            }).catch(err => {
                console.log('Failed to copy:', err);
                this.showShareText(text);
            });
        } else {
            this.showShareText(text);
        }
    }

    showShareText(text) {
        //prevent main page from scrolling while the modal is open
        document.body.style.overflow = 'hidden';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex;
            align-items: center; justify-content: center; z-index: 1000;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #2c2c2c; padding: 20px; border-radius: 8px;
            width: 90%; max-width: 400px; text-align: center;
            color: #fff;
        `;

        // Function to close the modal and restore page styles
        const closeModal = () => {
            document.body.removeChild(overlay);
            // This is the critical step that fixes the bug
            document.body.style.overflow = '';
        };

        modal.innerHTML = `
            <h3 style="margin-top:0;">Copy to Clipboard</h3>
            <textarea readonly style="width: 100%; height: 120px; background: #1e1e1e; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 10px; box-sizing: border-box; resize: none;">${text}</textarea>
            <button class="modal-close-button" style="width: 100%; padding: 10px; margin-top: 15px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">Close</button>
        `;

        // Add event listener to the new close button
        modal.querySelector('.modal-close-button').addEventListener('click', closeModal);

        // Allow closing by clicking the dark background
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
                
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
    }

    generateShareText() {
        const epoch = new Date('2025-07-22T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysSinceEpoch = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const attempts = this.gameActive ? this.currentRow : this.currentRow + 1;
        const puzzleNumber = Math.max(1, daysSinceEpoch);
        
        let shareText = `Alpha-bit ${puzzleNumber} ${attempts}/6\n\n`;
        
        for (let row = 0; row < attempts; row++) {
            let rowText = '';
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                if (tile.classList.contains('correct')) rowText += '🟩';
                else if (tile.classList.contains('present')) rowText += '🟨';
                else rowText += '⬛';
            }
            shareText += rowText + '\n';
        }
        
        shareText += '\nPlay at: ' + window.location.href;
        
        return shareText;
    }
}

// CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

class GameAnalytics {
    constructor(gameName) {
        this.gameName = gameName;
        this.gameStartTime = null;
    }

    trackGameStart(difficulty = null) {
        this.gameStartTime = Date.now();
        if (window.analytics) {
            window.analytics.trackGameStart(this.gameName, difficulty);
        }
    }

    trackGameEnd(success, score = null) {
        const timePlayed = this.gameStartTime ? Math.round((Date.now() - this.gameStartTime) / 1000) : null;
        if (window.analytics) {
            window.analytics.trackGameComplete(this.gameName, success, score, timePlayed);
        }
    }

    trackGameAction(action, additionalParams = {}) {
        if (window.analytics) {
            window.analytics.trackGameEvent(action, this.gameName, additionalParams);
        }
    }

    trackButtonClick(buttonName) {
        if (window.analytics) {
            window.analytics.trackButtonClick(buttonName, this.gameName);
        }
    }
}


// Initialize game when page loads
window.addEventListener('load', () => {
    new WoordleGame();
});