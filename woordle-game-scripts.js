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
        
        // Performance optimizations
        this.audioContext = null;
        this.isVisible = true;
        this.animationFrameId = null;
        
        // Word lists - will be loaded from file
        this.commonWords = [];
        this.validWords = [];
        
        // Initialize the game after loading words
        this.initializeGame();
        this.setupVisibilityHandling();
    }

    async initializeGame() {
        try {
            // Load words from file
            await this.loadWordsFromFile();
            
            // Initialize elements and setup (existing code)
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            
            // Create game board and keyboard (existing code)
            this.createGameBoard();
            this.createKeyboard();
            
            // Start the first game
            this.startNewGame();
            
        } catch (error) {
            console.error('Failed to load words:', error);
            // Fallback to a basic word list if file loading fails
            this.commonWords = [
                'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
                'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
                'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE'
            ];
            this.validWords = [...this.commonWords];
            
            // Continue with initialization
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            this.createGameBoard();
            this.createKeyboard();
            this.startNewGame();
        }
    }

    async loadWordsFromFile() {
        const response = await fetch('valid-wordle-words.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Split by lines and filter out empty lines, then convert to uppercase
        this.commonWords = text
            .split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === this.wordLength);
        
        // Create a copy for valid words
        this.validWords = [...this.commonWords];
        
        if (this.commonWords.length === 0) {
            throw new Error('No valid 5-letter words found in file');
        }
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) {
                this.audioContext.suspend();
            }
        });
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
    }

    setupEventListeners() {
        this.dailyMode.addEventListener('click', () => this.setGameMode('daily'), { passive: true });
        this.infiniteMode.addEventListener('click', () => this.setGameMode('infinite'), { passive: true });
        this.newGameButton.addEventListener('click', () => this.startNewGame(), { passive: true });
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.dailyMode.classList.toggle('active', mode === 'daily');
        this.infiniteMode.classList.toggle('active', mode === 'infinite');
        this.startNewGame();
    }

    createGameBoard() {
        const fragment = document.createDocumentFragment();
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
            
            fragment.appendChild(guessRow);
        }
        
        this.gameBoard.appendChild(fragment);
    }

    createKeyboard() {
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        const fragment = document.createDocumentFragment();
        this.keyboard.innerHTML = '';
        
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = key.length > 1 ? 'key wide' : 'key';
                keyButton.textContent = key === 'BACKSPACE' ? '⌫' : key;
                keyButton.dataset.key = key;
                keyButton.addEventListener('click', () => this.handleKeyClick(key), { passive: true });
                keyboardRow.appendChild(keyButton);
            });
            
            fragment.appendChild(keyboardRow);
        });
        
        this.keyboard.appendChild(fragment);
    }

    startNewGame() {
        if (this.commonWords.length === 0) {
            console.error('Cannot start game: word list not loaded');
            return;
        }

        this.currentRow = 0;
        this.currentCol = 0;
        this.currentWord = '';
        this.gameActive = true;
        this.keyboardState = {};
        
        // Clear the board efficiently
        const tiles = this.gameBoard.querySelectorAll('.letter-tile');
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.className = 'letter-tile';
        });
        
        // Reset keyboard efficiently
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = key.classList.contains('wide') ? 'key wide' : 'key';
            key.style.visibility = 'visible';
            key.disabled = false;
        });

        // Hide share button and new game button
        const shareButton = document.getElementById('shareButton');
        if (shareButton) {
            shareButton.style.display = 'none';
        }
        this.newGameButton.style.display = 'none';
        
        // Select target word
        if (this.gameMode === 'daily') {
            this.targetWord = this.getDailyWord();
            this.updateMessage("Solve today's daily Woordle!", "info");
        } else {
            this.targetWord = this.getRandomWord();
            this.updateMessage("Guess the 5-letter word!", "info");
        }
        
        this.updateAttemptsDisplay();
    }

    getDailyWord() {
        const today = new Date();
        const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const seed = this.hashCode(dateString);
        const index = Math.abs(seed) % this.commonWords.length;
        return this.commonWords[index];
    }

    getRandomWord() {
        return this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    handleKeyPress(e) {
        if (!this.gameActive || !this.isVisible) return;
        
        const key = e.key.toUpperCase();

        if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
            e.preventDefault();
        } else {
            return;
        }
        
        if (key.match(/[A-Z]/) && key.length === 1) {
            const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
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
        if (!this.gameActive || !this.isVisible) return;
        
        const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
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
        if (this.currentCol < this.wordLength) {
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentWord += letter;
            this.currentCol++;
        }
    }

    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            this.currentWord = this.currentWord.slice(0, -1);
        }
    }

    submitGuess() {
        if (this.currentWord.length !== this.wordLength) {
            this.updateMessage("Not enough letters!", "error");
            this.playSound('error');
            return;
        }
        
        if (!this.isValidWord(this.currentWord)) {
            this.updateMessage("Not a valid word!", "error");
            this.playSound('error');
            this.shakeRow(this.currentRow);
            
            setTimeout(() => {
                this.clearCurrentRow();
                this.currentCol = 0;
                this.currentWord = '';
                this.updateMessage("Guess the 5-letter word!", "info");
            }, 1000);
            
            return;
        }
        
        this.checkGuess();
        
        if (this.currentWord === this.targetWord) {
            setTimeout(() => {
                this.handleWin();
            }, this.wordLength * 50 + 100); // Reduced timing
        } else if (this.currentRow >= this.maxAttempts - 1) {
            setTimeout(() => {
                this.handleLoss();
            }, this.wordLength * 50 + 100); // Reduced timing
        } else {
            setTimeout(() => {
                this.currentRow++;
                this.currentCol = 0;
                this.currentWord = '';
                this.updateAttemptsDisplay();
            }, this.wordLength * 50 + 50); // Reduced timing
        }
    }

    isValidWord(word) {
        return this.validWords.includes(word);
    }

    checkGuess() {
        const targetLetters = [...this.targetWord];
        const guessLetters = [...this.currentWord];
        const results = new Array(this.wordLength).fill('absent');
        
        // First pass: mark correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                results[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
                results[i] = 'present';
                targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
            }
        }
        
        // Reduced animation timing
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.currentWord[i];
            const result = results[i];
            
            setTimeout(() => {
                const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
                tile.classList.add(result);
                
                if (!this.keyboardState[letter] || 
                    (this.keyboardState[letter] !== 'correct' && result === 'correct') ||
                    (this.keyboardState[letter] === 'absent' && result === 'present')) {
                    this.keyboardState[letter] = result;
                }
            }, i * 50); // Reduced from 100ms
        }
        
        setTimeout(() => {
            this.updateKeyboard();
        }, this.wordLength * 50);
        
        this.playSound('flip');
    }

    updateKeyboard() {
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
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
        this.createSimpleConfetti();
        
        const stats = this.getStats();
        stats.gamesWon++;
        stats.gamesPlayed++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
            if (this.gameMode === 'daily') {
                this.showShareButton();
            }
        }, 1000); // Reduced timing
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The word was "${this.targetWord}".`, "error");
        this.playSound('lose');
        
        const stats = this.getStats();
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
        }, 1000);
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
        rowElement.style.animation = 'shake 0.3s ease-in-out'; // Reduced duration
        setTimeout(() => {
            rowElement.style.animation = '';
        }, 300);
    }

    clearCurrentRow() {
        for (let col = 0; col < this.wordLength; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            tile.textContent = '';
            tile.classList.remove('filled');
        }
    }

    createSimpleConfetti() {
        if (!this.isVisible) return;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f'];
        
        for (let i = 0; i < 8; i++) { // Reduced from 50
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: simpleFall 1.5s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 1500);
            }, i * 100);
        }
    }

    playSound(type) {
        if (!this.isVisible) return;
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'win':
                frequency = 523.25;
                duration = 0.3;
                break;
            case 'lose':
                frequency = 220;
                duration = 0.4;
                break;
            case 'flip':
                frequency = 330;
                duration = 0.1;
                break;
            case 'error':
                frequency = 200;
                duration = 0.2;
                break;
            default:
                frequency = 440;
                duration = 0.1;
        }
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    getStats() {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        try {
            const saved = localStorage.getItem('woordle-stats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch (error) {
            return defaultStats;
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem('woordle-stats', JSON.stringify(stats));
        } catch (error) {
            console.warn('Could not save stats:', error);
        }
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

    showShareButton() {
        let shareButton = document.getElementById('shareButton');
        if (!shareButton) {
            shareButton = document.createElement('button');
            shareButton.id = 'shareButton';
            shareButton.className = 'share-button';
            shareButton.innerHTML = '💬 Share';
            shareButton.addEventListener('click', () => this.shareResults(), { passive: true });
            
            const newGameButton = document.getElementById('newGameButton');
            newGameButton.parentNode.insertBefore(shareButton, newGameButton);
        }
        shareButton.style.display = 'inline-block';
    }

    shareResults() {
        const shareText = this.generateShareText();
        
        if (navigator.share) {
            navigator.share({
                text: shareText
            }).catch(err => {
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
                    this.updateMessage(`🎉 Excellent! You got it in ${this.currentRow + 1} attempt${this.currentRow + 1 === 1 ? '' : 's'}!`, "success");
                }, 1500);
            }).catch(err => {
                console.log('Failed to copy:', err);
                this.showShareText(text);
            });
        } else {
            this.showShareText(text);
        }
    }

    showShareText(text) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 15px;
            max-width: 90%;
            text-align: center;
            color: #333;
        `;
        
        modal.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #333;">Share Your Results</h3>
            <pre style="background: #f0f0f0; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; color: #333;">${text}</pre>
            <p style="margin: 15px 0; color: #666;">Copy the text above to share your results!</p>
            <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    generateShareText() {
        const epoch = new Date('2025-07-22T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysSinceEpoch = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const attempts = this.currentRow + 1;
        const puzzleNumber = Math.max(1, daysSinceEpoch);
        
        let shareText = `Woordle ${puzzleNumber} ${attempts}/6\n\n`;
        
        for (let row = 0; row <= this.currentRow; row++) {
            let rowText = '';
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                if (tile.classList.contains('correct')) {
                    rowText += '🟩';
                } else if (tile.classList.contains('present')) {
                    rowText += '🟨';
                } else if (tile.classList.contains('absent')) {
                    rowText += '⬛';
                }
            }
            shareText += rowText + '\n';
        }
        
        shareText += '\nPlay at: ' + window.location.href;
        
        return shareText;
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// Add simple CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes simpleFall {
        to {
            transform: translateY(100vh);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.woordleGame) {
        window.woordleGame.cleanup();
    }
});

// Initialize game when page loads
window.addEventListener('load', () => {
    window.woordleGame = new WoordleGame();
});class WoordleGame {
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
        
        // Performance optimizations
        this.audioContext = null;
        this.isVisible = true;
        this.animationFrameId = null;
        
        // Word lists - will be loaded from file
        this.commonWords = [];
        this.validWords = [];
        
        // Initialize the game after loading words
        this.initializeGame();
        this.setupVisibilityHandling();
    }

    async initializeGame() {
        try {
            // Load words from file
            await this.loadWordsFromFile();
            
            // Initialize elements and setup (existing code)
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            
            // Create game board and keyboard (existing code)
            this.createGameBoard();
            this.createKeyboard();
            
            // Start the first game
            this.startNewGame();
            
        } catch (error) {
            console.error('Failed to load words:', error);
            // Fallback to a basic word list if file loading fails
            this.commonWords = [
                'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
                'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
                'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE'
            ];
            this.validWords = [...this.commonWords];
            
            // Continue with initialization
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            this.createGameBoard();
            this.createKeyboard();
            this.startNewGame();
        }
    }

    async loadWordsFromFile() {
        const response = await fetch('valid-wordle-words.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Split by lines and filter out empty lines, then convert to uppercase
        this.commonWords = text
            .split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === this.wordLength);
        
        // Create a copy for valid words
        this.validWords = [...this.commonWords];
        
        if (this.commonWords.length === 0) {
            throw new Error('No valid 5-letter words found in file');
        }
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) {
                this.audioContext.suspend();
            }
        });
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
    }

    setupEventListeners() {
        this.dailyMode.addEventListener('click', () => this.setGameMode('daily'), { passive: true });
        this.infiniteMode.addEventListener('click', () => this.setGameMode('infinite'), { passive: true });
        this.newGameButton.addEventListener('click', () => this.startNewGame(), { passive: true });
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.dailyMode.classList.toggle('active', mode === 'daily');
        this.infiniteMode.classList.toggle('active', mode === 'infinite');
        this.startNewGame();
    }

    createGameBoard() {
        const fragment = document.createDocumentFragment();
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
            
            fragment.appendChild(guessRow);
        }
        
        this.gameBoard.appendChild(fragment);
    }

    createKeyboard() {
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        const fragment = document.createDocumentFragment();
        this.keyboard.innerHTML = '';
        
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = key.length > 1 ? 'key wide' : 'key';
                keyButton.textContent = key === 'BACKSPACE' ? '⌫' : key;
                keyButton.dataset.key = key;
                keyButton.addEventListener('click', () => this.handleKeyClick(key), { passive: true });
                keyboardRow.appendChild(keyButton);
            });
            
            fragment.appendChild(keyboardRow);
        });
        
        this.keyboard.appendChild(fragment);
    }

    startNewGame() {
        if (this.commonWords.length === 0) {
            console.error('Cannot start game: word list not loaded');
            return;
        }

        this.currentRow = 0;
        this.currentCol = 0;
        this.currentWord = '';
        this.gameActive = true;
        this.keyboardState = {};
        
        // Clear the board efficiently
        const tiles = this.gameBoard.querySelectorAll('.letter-tile');
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.className = 'letter-tile';
        });
        
        // Reset keyboard efficiently
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = key.classList.contains('wide') ? 'key wide' : 'key';
            key.style.visibility = 'visible';
            key.disabled = false;
        });

        // Hide share button and new game button
        const shareButton = document.getElementById('shareButton');
        if (shareButton) {
            shareButton.style.display = 'none';
        }
        this.newGameButton.style.display = 'none';
        
        // Select target word
        if (this.gameMode === 'daily') {
            this.targetWord = this.getDailyWord();
            this.updateMessage("Solve today's daily Woordle!", "info");
        } else {
            this.targetWord = this.getRandomWord();
            this.updateMessage("Guess the 5-letter word!", "info");
        }
        
        this.updateAttemptsDisplay();
    }

    getDailyWord() {
        const today = new Date();
        const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const seed = this.hashCode(dateString);
        const index = Math.abs(seed) % this.commonWords.length;
        return this.commonWords[index];
    }

    getRandomWord() {
        return this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    handleKeyPress(e) {
        if (!this.gameActive || !this.isVisible) return;
        
        const key = e.key.toUpperCase();

        if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
            e.preventDefault();
        } else {
            return;
        }
        
        if (key.match(/[A-Z]/) && key.length === 1) {
            const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
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
        if (!this.gameActive || !this.isVisible) return;
        
        const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
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
        if (this.currentCol < this.wordLength) {
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentWord += letter;
            this.currentCol++;
        }
    }

    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            this.currentWord = this.currentWord.slice(0, -1);
        }
    }

    submitGuess() {
        if (this.currentWord.length !== this.wordLength) {
            this.updateMessage("Not enough letters!", "error");
            this.playSound('error');
            return;
        }
        
        if (!this.isValidWord(this.currentWord)) {
            this.updateMessage("Not a valid word!", "error");
            this.playSound('error');
            this.shakeRow(this.currentRow);
            
            setTimeout(() => {
                this.clearCurrentRow();
                this.currentCol = 0;
                this.currentWord = '';
                this.updateMessage("Guess the 5-letter word!", "info");
            }, 1000);
            
            return;
        }
        
        this.checkGuess();
        
        if (this.currentWord === this.targetWord) {
            setTimeout(() => {
                this.handleWin();
            }, this.wordLength * 50 + 100); // Reduced timing
        } else if (this.currentRow >= this.maxAttempts - 1) {
            setTimeout(() => {
                this.handleLoss();
            }, this.wordLength * 50 + 100); // Reduced timing
        } else {
            setTimeout(() => {
                this.currentRow++;
                this.currentCol = 0;
                this.currentWord = '';
                this.updateAttemptsDisplay();
            }, this.wordLength * 50 + 50); // Reduced timing
        }
    }

    isValidWord(word) {
        return this.validWords.includes(word);
    }

    checkGuess() {
        const targetLetters = [...this.targetWord];
        const guessLetters = [...this.currentWord];
        const results = new Array(this.wordLength).fill('absent');
        
        // First pass: mark correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                results[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
                results[i] = 'present';
                targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
            }
        }
        
        // Reduced animation timing
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.currentWord[i];
            const result = results[i];
            
            setTimeout(() => {
                const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
                tile.classList.add(result);
                
                if (!this.keyboardState[letter] || 
                    (this.keyboardState[letter] !== 'correct' && result === 'correct') ||
                    (this.keyboardState[letter] === 'absent' && result === 'present')) {
                    this.keyboardState[letter] = result;
                }
            }, i * 50); // Reduced from 100ms
        }
        
        setTimeout(() => {
            this.updateKeyboard();
        }, this.wordLength * 50);
        
        this.playSound('flip');
    }

    updateKeyboard() {
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
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
        this.createSimpleConfetti();
        
        const stats = this.getStats();
        stats.gamesWon++;
        stats.gamesPlayed++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
            if (this.gameMode === 'daily') {
                this.showShareButton();
            }
        }, 1000); // Reduced timing
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The word was "${this.targetWord}".`, "error");
        this.playSound('lose');
        
        const stats = this.getStats();
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
        }, 1000);
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
        rowElement.style.animation = 'shake 0.3s ease-in-out'; // Reduced duration
        setTimeout(() => {
            rowElement.style.animation = '';
        }, 300);
    }

    clearCurrentRow() {
        for (let col = 0; col < this.wordLength; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            tile.textContent = '';
            tile.classList.remove('filled');
        }
    }

    createSimpleConfetti() {
        if (!this.isVisible) return;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f'];
        
        for (let i = 0; i < 8; i++) { // Reduced from 50
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: simpleFall 1.5s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 1500);
            }, i * 100);
        }
    }

    playSound(type) {
        if (!this.isVisible) return;
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'win':
                frequency = 523.25;
                duration = 0.3;
                break;
            case 'lose':
                frequency = 220;
                duration = 0.4;
                break;
            case 'flip':
                frequency = 330;
                duration = 0.1;
                break;
            case 'error':
                frequency = 200;
                duration = 0.2;
                break;
            default:
                frequency = 440;
                duration = 0.1;
        }
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    getStats() {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        try {
            const saved = localStorage.getItem('woordle-stats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch (error) {
            return defaultStats;
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem('woordle-stats', JSON.stringify(stats));
        } catch (error) {
            console.warn('Could not save stats:', error);
        }
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

    showShareButton() {
        let shareButton = document.getElementById('shareButton');
        if (!shareButton) {
            shareButton = document.createElement('button');
            shareButton.id = 'shareButton';
            shareButton.className = 'share-button';
            shareButton.innerHTML = '💬 Share';
            shareButton.addEventListener('click', () => this.shareResults(), { passive: true });
            
            const newGameButton = document.getElementById('newGameButton');
            newGameButton.parentNode.insertBefore(shareButton, newGameButton);
        }
        shareButton.style.display = 'inline-block';
    }

    shareResults() {
        const shareText = this.generateShareText();
        
        if (navigator.share) {
            navigator.share({
                text: shareText
            }).catch(err => {
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
                    this.updateMessage(`🎉 Excellent! You got it in ${this.currentRow + 1} attempt${this.currentRow + 1 === 1 ? '' : 's'}!`, "success");
                }, 1500);
            }).catch(err => {
                console.log('Failed to copy:', err);
                this.showShareText(text);
            });
        } else {
            this.showShareText(text);
        }
    }

    showShareText(text) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 15px;
            max-width: 90%;
            text-align: center;
            color: #333;
        `;
        
        modal.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #333;">Share Your Results</h3>
            <pre style="background: #f0f0f0; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; color: #333;">${text}</pre>
            <p style="margin: 15px 0; color: #666;">Copy the text above to share your results!</p>
            <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    generateShareText() {
        const epoch = new Date('2025-07-22T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysSinceEpoch = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const attempts = this.currentRow + 1;
        const puzzleNumber = Math.max(1, daysSinceEpoch);
        
        let shareText = `Woordle ${puzzleNumber} ${attempts}/6\n\n`;
        
        for (let row = 0; row <= this.currentRow; row++) {
            let rowText = '';
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                if (tile.classList.contains('correct')) {
                    rowText += '🟩';
                } else if (tile.classList.contains('present')) {
                    rowText += '🟨';
                } else if (tile.classList.contains('absent')) {
                    rowText += '⬛';
                }
            }
            shareText += rowText + '\n';
        }
        
        shareText += '\nPlay at: ' + window.location.href;
        
        return shareText;
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// Add simple CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes simpleFall {
        to {
            transform: translateY(100vh);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.woordleGame) {
        window.woordleGame.cleanup();
    }
});

// Initialize game when page loads
window.addEventListener('load', () => {
    window.woordleGame = new WoordleGame();
});class WoordleGame {
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
        
        // Performance optimizations
        this.audioContext = null;
        this.isVisible = true;
        this.animationFrameId = null;
        
        // Word lists - will be loaded from file
        this.commonWords = [];
        this.validWords = [];
        
        // Initialize the game after loading words
        this.initializeGame();
        this.setupVisibilityHandling();
    }

    async initializeGame() {
        try {
            // Load words from file
            await this.loadWordsFromFile();
            
            // Initialize elements and setup (existing code)
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            
            // Create game board and keyboard (existing code)
            this.createGameBoard();
            this.createKeyboard();
            
            // Start the first game
            this.startNewGame();
            
        } catch (error) {
            console.error('Failed to load words:', error);
            // Fallback to a basic word list if file loading fails
            this.commonWords = [
                'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
                'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
                'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE'
            ];
            this.validWords = [...this.commonWords];
            
            // Continue with initialization
            this.initializeElements();
            this.setupEventListeners();
            this.loadStats();
            this.createGameBoard();
            this.createKeyboard();
            this.startNewGame();
        }
    }

    async loadWordsFromFile() {
        const response = await fetch('valid-wordle-words.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Split by lines and filter out empty lines, then convert to uppercase
        this.commonWords = text
            .split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === this.wordLength);
        
        // Create a copy for valid words
        this.validWords = [...this.commonWords];
        
        if (this.commonWords.length === 0) {
            throw new Error('No valid 5-letter words found in file');
        }
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) {
                this.audioContext.suspend();
            }
        });
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
    }

    setupEventListeners() {
        this.dailyMode.addEventListener('click', () => this.setGameMode('daily'), { passive: true });
        this.infiniteMode.addEventListener('click', () => this.setGameMode('infinite'), { passive: true });
        this.newGameButton.addEventListener('click', () => this.startNewGame(), { passive: true });
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.dailyMode.classList.toggle('active', mode === 'daily');
        this.infiniteMode.classList.toggle('active', mode === 'infinite');
        this.startNewGame();
    }

    createGameBoard() {
        const fragment = document.createDocumentFragment();
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
            
            fragment.appendChild(guessRow);
        }
        
        this.gameBoard.appendChild(fragment);
    }

    createKeyboard() {
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        const fragment = document.createDocumentFragment();
        this.keyboard.innerHTML = '';
        
        keyboardLayout.forEach(row => {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyButton = document.createElement('button');
                keyButton.className = key.length > 1 ? 'key wide' : 'key';
                keyButton.textContent = key === 'BACKSPACE' ? '⌫' : key;
                keyButton.dataset.key = key;
                keyButton.addEventListener('click', () => this.handleKeyClick(key), { passive: true });
                keyboardRow.appendChild(keyButton);
            });
            
            fragment.appendChild(keyboardRow);
        });
        
        this.keyboard.appendChild(fragment);
    }

    startNewGame() {
        if (this.commonWords.length === 0) {
            console.error('Cannot start game: word list not loaded');
            return;
        }

        this.currentRow = 0;
        this.currentCol = 0;
        this.currentWord = '';
        this.gameActive = true;
        this.keyboardState = {};
        
        // Clear the board efficiently
        const tiles = this.gameBoard.querySelectorAll('.letter-tile');
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.className = 'letter-tile';
        });
        
        // Reset keyboard efficiently
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            key.className = key.classList.contains('wide') ? 'key wide' : 'key';
            key.style.visibility = 'visible';
            key.disabled = false;
        });

        // Hide share button and new game button
        const shareButton = document.getElementById('shareButton');
        if (shareButton) {
            shareButton.style.display = 'none';
        }
        this.newGameButton.style.display = 'none';
        
        // Select target word
        if (this.gameMode === 'daily') {
            this.targetWord = this.getDailyWord();
            this.updateMessage("Solve today's daily Woordle!", "info");
        } else {
            this.targetWord = this.getRandomWord();
            this.updateMessage("Guess the 5-letter word!", "info");
        }
        
        this.updateAttemptsDisplay();
    }

    getDailyWord() {
        const today = new Date();
        const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const seed = this.hashCode(dateString);
        const index = Math.abs(seed) % this.commonWords.length;
        return this.commonWords[index];
    }

    getRandomWord() {
        return this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    handleKeyPress(e) {
        if (!this.gameActive || !this.isVisible) return;
        
        const key = e.key.toUpperCase();

        if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
            e.preventDefault();
        } else {
            return;
        }
        
        if (key.match(/[A-Z]/) && key.length === 1) {
            const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
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
        if (!this.gameActive || !this.isVisible) return;
        
        const keyElement = this.keyboard.querySelector(`[data-key="${key}"]`);
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
        if (this.currentCol < this.wordLength) {
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentWord += letter;
            this.currentCol++;
        }
    }

    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.classList.remove('filled');
            this.currentWord = this.currentWord.slice(0, -1);
        }
    }

    submitGuess() {
        if (this.currentWord.length !== this.wordLength) {
            this.updateMessage("Not enough letters!", "error");
            this.playSound('error');
            return;
        }
        
        if (!this.isValidWord(this.currentWord)) {
            this.updateMessage("Not a valid word!", "error");
            this.playSound('error');
            this.shakeRow(this.currentRow);
            
            setTimeout(() => {
                this.clearCurrentRow();
                this.currentCol = 0;
                this.currentWord = '';
                this.updateMessage("Guess the 5-letter word!", "info");
            }, 1000);
            
            return;
        }
        
        this.checkGuess();
        
        if (this.currentWord === this.targetWord) {
            setTimeout(() => {
                this.handleWin();
            }, this.wordLength * 50 + 100); // Reduced timing
        } else if (this.currentRow >= this.maxAttempts - 1) {
            setTimeout(() => {
                this.handleLoss();
            }, this.wordLength * 50 + 100); // Reduced timing
        } else {
            setTimeout(() => {
                this.currentRow++;
                this.currentCol = 0;
                this.currentWord = '';
                this.updateAttemptsDisplay();
            }, this.wordLength * 50 + 50); // Reduced timing
        }
    }

    isValidWord(word) {
        return this.validWords.includes(word);
    }

    checkGuess() {
        const targetLetters = [...this.targetWord];
        const guessLetters = [...this.currentWord];
        const results = new Array(this.wordLength).fill('absent');
        
        // First pass: mark correct positions
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                results[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
                results[i] = 'present';
                targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
            }
        }
        
        // Reduced animation timing
        for (let i = 0; i < this.wordLength; i++) {
            const letter = this.currentWord[i];
            const result = results[i];
            
            setTimeout(() => {
                const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
                tile.classList.add(result);
                
                if (!this.keyboardState[letter] || 
                    (this.keyboardState[letter] !== 'correct' && result === 'correct') ||
                    (this.keyboardState[letter] === 'absent' && result === 'present')) {
                    this.keyboardState[letter] = result;
                }
            }, i * 50); // Reduced from 100ms
        }
        
        setTimeout(() => {
            this.updateKeyboard();
        }, this.wordLength * 50);
        
        this.playSound('flip');
    }

    updateKeyboard() {
        const keys = this.keyboard.querySelectorAll('.key');
        keys.forEach(key => {
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
        this.createSimpleConfetti();
        
        const stats = this.getStats();
        stats.gamesWon++;
        stats.gamesPlayed++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
            if (this.gameMode === 'daily') {
                this.showShareButton();
            }
        }, 1000); // Reduced timing
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The word was "${this.targetWord}".`, "error");
        this.playSound('lose');
        
        const stats = this.getStats();
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.newGameButton.style.display = 'inline-block';
        }, 1000);
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
        rowElement.style.animation = 'shake 0.3s ease-in-out'; // Reduced duration
        setTimeout(() => {
            rowElement.style.animation = '';
        }, 300);
    }

    clearCurrentRow() {
        for (let col = 0; col < this.wordLength; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            tile.textContent = '';
            tile.classList.remove('filled');
        }
    }

    createSimpleConfetti() {
        if (!this.isVisible) return;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f'];
        
        for (let i = 0; i < 8; i++) { // Reduced from 50
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: simpleFall 1.5s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 1500);
            }, i * 100);
        }
    }

    playSound(type) {
        if (!this.isVisible) return;
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'win':
                frequency = 523.25;
                duration = 0.3;
                break;
            case 'lose':
                frequency = 220;
                duration = 0.4;
                break;
            case 'flip':
                frequency = 330;
                duration = 0.1;
                break;
            case 'error':
                frequency = 200;
                duration = 0.2;
                break;
            default:
                frequency = 440;
                duration = 0.1;
        }
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    getStats() {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        try {
            const saved = localStorage.getItem('woordle-stats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch (error) {
            return defaultStats;
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem('woordle-stats', JSON.stringify(stats));
        } catch (error) {
            console.warn('Could not save stats:', error);
        }
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

    showShareButton() {
        let shareButton = document.getElementById('shareButton');
        if (!shareButton) {
            shareButton = document.createElement('button');
            shareButton.id = 'shareButton';
            shareButton.className = 'share-button';
            shareButton.innerHTML = '💬 Share';
            shareButton.addEventListener('click', () => this.shareResults(), { passive: true });
            
            const newGameButton = document.getElementById('newGameButton');
            newGameButton.parentNode.insertBefore(shareButton, newGameButton);
        }
        shareButton.style.display = 'inline-block';
    }

    shareResults() {
        const shareText = this.generateShareText();
        
        if (navigator.share) {
            navigator.share({
                text: shareText
            }).catch(err => {
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
                    this.updateMessage(`🎉 Excellent! You got it in ${this.currentRow + 1} attempt${this.currentRow + 1 === 1 ? '' : 's'}!`, "success");
                }, 1500);
            }).catch(err => {
                console.log('Failed to copy:', err);
                this.showShareText(text);
            });
        } else {
            this.showShareText(text);
        }
    }

    showShareText(text) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 15px;
            max-width: 90%;
            text-align: center;
            color: #333;
        `;
        
        modal.innerHTML = `
            <h3 style="margin-bottom: 15px; color: #333;">Share Your Results</h3>
            <pre style="background: #f0f0f0; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; color: #333;">${text}</pre>
            <p style="margin: 15px 0; color: #666;">Copy the text above to share your results!</p>
            <button onclick="this.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    generateShareText() {
        const epoch = new Date('2025-07-22T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysSinceEpoch = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const attempts = this.currentRow + 1;
        const puzzleNumber = Math.max(1, daysSinceEpoch);
        
        let shareText = `Woordle ${puzzleNumber} ${attempts}/6\n\n`;
        
        for (let row = 0; row <= this.currentRow; row++) {
            let rowText = '';
            for (let col = 0; col < this.wordLength; col++) {
                const tile = document.getElementById(`tile-${row}-${col}`);
                if (tile.classList.contains('correct')) {
                    rowText += '🟩';
                } else if (tile.classList.contains('present')) {
                    rowText += '🟨';
                } else if (tile.classList.contains('absent')) {
                    rowText += '⬛';
                }
            }
            shareText += rowText + '\n';
        }
        
        shareText += '\nPlay at: ' + window.location.href;
        
        return shareText;
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// Add simple CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes simpleFall {
        to {
            transform: translateY(100vh);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.woordleGame) {
        window.woordleGame.cleanup();
    }
});

// Initialize game when page loads
window.addEventListener('load', () => {
    window.woordleGame = new WoordleGame();
});