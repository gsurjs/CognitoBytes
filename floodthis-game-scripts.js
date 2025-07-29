class FloodThisGame {
    constructor() {
        this.boardSize = 14;
        this.maxMoves = 25;
        this.numColors = 4;
        this.currentMoves = 0;
        this.gameActive = true;
        this.board = [];
        this.difficulty = 'easy';

        // Performance optimizations
        this.audioContext = null;
        this.isVisible = true;
        this.animationFrameId = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.setupVisibilityHandling();

        this.initializeGame();
    }

    initializeGame() {
        // Load saved difficulty setting
        const savedDifficulty = localStorage.getItem('flood-this-difficulty');
        if (savedDifficulty) {
            this.setDifficulty(savedDifficulty, false); // false = don't start new game yet
        }
        
        // Try to load saved game state first, otherwise start new game
        if (!this.loadGameState()) {
            this.startNewGame();
        }
    }


    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.colorPalette = document.getElementById('colorPalette');
        this.message = document.getElementById('message');
        this.movesLeft = document.getElementById('movesLeft');
        this.gamesWon = document.getElementById('gamesWon');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.bestScore = document.getElementById('bestScore');
        this.easyMode = document.getElementById('easyMode');
        this.mediumMode = document.getElementById('mediumMode');
        this.hardMode = document.getElementById('hardMode');
        this.newGameButton = document.getElementById('newGameButton');
    }

    setupEventListeners() {
        this.easyMode.addEventListener('click', () => this.setDifficulty('easy'));
        this.mediumMode.addEventListener('click', () => this.setDifficulty('medium'));
        this.hardMode.addEventListener('click', () => this.setDifficulty('hard'));
        this.newGameButton.addEventListener('click', () => this.startNewGame(true)); //force new game
    }

    setupVisibilityHandling() {
        // Pause/resume when tab visibility changes
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) {
                this.audioContext.suspend();
            }
        });
    }

    setDifficulty(difficulty, startNew = true) {
        // If difficulty hasn't changed, don't do anything
        if (this.difficulty === difficulty && startNew) return;
        
        this.difficulty = difficulty;
        localStorage.setItem('flood-this-difficulty', difficulty); // Save difficulty preference
        
        this.easyMode.classList.toggle('active', difficulty === 'easy');
        this.mediumMode.classList.toggle('active', difficulty === 'medium');
        this.hardMode.classList.toggle('active', difficulty === 'hard');        
        // Set difficulty parameters
        switch(difficulty) {
            case 'easy':
                this.boardSize = 14;
                this.maxMoves = 25;
                this.numColors = 4;
                break;
            case 'medium':
                this.boardSize = 14;
                this.maxMoves = 25;
                this.numColors = 5;
                break;
            case 'hard':
                this.boardSize = 14;
                this.maxMoves = 23;
                this.numColors = 6;
                break;
        }
        
        if (startNew) {
            this.startNewGame();
        }
    }

    startNewGame(forceNew = false) {
        // Try to load state unless a new game is forced
        if (!forceNew && this.loadGameState()) {
            console.log("Loaded saved game state.");
            return;
        }

        // If no saved state or new game is forced, reset everything
        this.clearGameState();
        this.currentMoves = 0;
        this.gameActive = true;
        
        this.generateBoard();
        this.createGameBoard();
        this.createColorPalette();
        this.updateMovesDisplay();
        this.updateMessage("Flood the board from top left to bottom right!", "info");
        
        // Update difficulty display
        const difficultyEl = document.querySelector('.difficulty');
        difficultyEl.textContent = `${this.boardSize}x${this.boardSize} Grid`;

        // Save the initial state of the new game
        this.saveGameState();
    }

    generateBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = Math.floor(Math.random() * this.numColors);
            }
        }
    }

    createGameBoard() {
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = `cell color-${this.board[row][col]}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                fragment.appendChild(cell);
            }
        }
        
        this.gameBoard.appendChild(fragment);
    }

    createColorPalette() {
        const fragment = document.createDocumentFragment();
        this.colorPalette.innerHTML = '';
        
        for (let i = 0; i < this.numColors; i++) {
            const button = document.createElement('div');
            button.className = `color-button color-${i}`;
            button.dataset.color = i;
            button.addEventListener('click', () => this.floodFill(i), { passive: true });
            fragment.appendChild(button);
        }
        
        this.colorPalette.appendChild(fragment);
    }

    floodFill(newColor) {
        if (!this.gameActive || !this.isVisible) return;
        
        const startColor = this.board[0][0];
        if (startColor === newColor) return;
        
        this.currentMoves++;
        this.updateMovesDisplay();
        
        // Perform flood fill without animations for better performance
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        this.floodFillRecursive(0, 0, startColor, newColor, visited);
        
        // Single DOM update instead of individual cell updates
        this.updateVisualBoard();

        // Save state after each move
        this.saveGameState();
        
        // Check win condition
        if (this.checkWin()) {
            this.handleWin();
        } else if (this.currentMoves >= this.maxMoves) {
            this.handleLoss();
        }
    }

    floodFillRecursive(row, col, oldColor, newColor, visited) {
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) return;
        if (visited[row][col] || this.board[row][col] !== oldColor) return;
        
        visited[row][col] = true;
        this.board[row][col] = newColor;
        
        // Recursively flood neighboring cells
        this.floodFillRecursive(row + 1, col, oldColor, newColor, visited);
        this.floodFillRecursive(row - 1, col, oldColor, newColor, visited);
        this.floodFillRecursive(row, col + 1, oldColor, newColor, visited);
        this.floodFillRecursive(row, col - 1, oldColor, newColor, visited);
    }

    updateVisualBoard() {
        // Batch DOM updates for better performance
        const cells = this.gameBoard.children;
        let index = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = cells[index];
                if (cell) {
                    cell.className = `cell color-${this.board[row][col]}`;
                }
                index++;
            }
        }
    }

    checkWin() {
        const firstColor = this.board[0][0];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== firstColor) {
                    return false;
                }
            }
        }
        return true;
    }

    handleWin() {
        this.gameActive = false;
        this.saveGameState(); // Save final game state
        this.updateMessage(`🎉 Excellent! You flooded the board in ${this.currentMoves} moves!`, "success");
        this.playSound('win');

        // Simplified confetti - less intensive
        this.createSimpleConfetti();
        
        // Update stats
        const stats = this.getStats();
        // Check if stats for this game have already been recorded
        const gameStateKey = this.getGameStateKey();
        if (stats.lastGameCompleted !== gameStateKey) {
            stats.gamesWon++;
            stats.gamesPlayed++;
            if (stats.bestScore === null || this.currentMoves < stats.bestScore) {
                stats.bestScore = this.currentMoves;
            }
            stats.lastGameCompleted = gameStateKey;
            this.saveStats(stats);
        }
        this.updateStatsDisplay();
    }

    handleLoss() {
        this.gameActive = false;
        this.saveGameState(); // Save final game state
        this.updateMessage(`💀 Game Over! You ran out of moves. Try again!`, "error");
        this.playSound('lose');
        
        // Update stats
        const stats = this.getStats();
        // Check if stats for this game have already been recorded
        const gameStateKey = this.getGameStateKey();
        if (stats.lastGameCompleted !== gameStateKey) {
            stats.gamesPlayed++;
            stats.lastGameCompleted = gameStateKey;
            this.saveStats(stats);
        }
        this.updateStatsDisplay();
    }

    saveGameState() {
        const state = {
            board: this.board,
            currentMoves: this.currentMoves,
            gameActive: this.gameActive,
            difficulty: this.difficulty,
            boardSize: this.boardSize,
            maxMoves: this.maxMoves,
            numColors: this.numColors
        };
        localStorage.setItem(`flood-this-gameState-${this.difficulty}-v1`, JSON.stringify(state));
    }

    loadGameState() {
        const savedStateJSON = localStorage.getItem(`flood-this-gameState-${this.difficulty}-v1`);
        if (!savedStateJSON) return false;

        try {
            const savedState = JSON.parse(savedStateJSON);
            
            // Restore game parameters
            this.board = savedState.board;
            this.currentMoves = savedState.currentMoves;
            this.gameActive = savedState.gameActive;
            this.boardSize = savedState.boardSize;
            this.maxMoves = savedState.maxMoves;
            this.numColors = savedState.numColors;
            
            // Rebuild the visual board
            this.createGameBoard();
            this.createColorPalette();
            this.updateMovesDisplay();
            
            // Update difficulty display
            const difficultyEl = document.querySelector('.difficulty');
            difficultyEl.textContent = `${this.boardSize}x${this.boardSize} Grid`;
            
            if (!this.gameActive) {
                // Game was completed, show final message
                if (this.checkWin()) {
                    this.updateMessage(`🎉 Excellent! You flooded the board in ${this.currentMoves} moves!`, "success");
                } else {
                    this.updateMessage(`💀 Game Over! You ran out of moves. Try again!`, "error");
                }
            } else {
                this.updateMessage("Welcome back! Continue flooding the board!", "info");
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            this.clearGameState();
            return false;
        }
    }

    clearGameState() {
        localStorage.removeItem(`flood-this-gameState-${this.difficulty}-v1`);
    }

    getGameStateKey() {
        // Create a unique key for this game based on initial board state
        return `${this.difficulty}-${this.boardSize}-${this.maxMoves}-${this.numColors}`;
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    updateMovesDisplay() {
        const remaining = this.maxMoves - this.currentMoves;
        this.movesLeft.textContent = `${remaining} moves left`;
        
        if (remaining <= 3) {
            this.movesLeft.style.color = '#ff4444';
        } else if (remaining <= 6) {
            this.movesLeft.style.color = '#ff8800';
        } else {
            this.movesLeft.style.color = '#ffeb3b';
        }
    }

    createSimpleConfetti() {
        // Much simpler confetti that won't overheat
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
        
        for (let i = 0; i < 10; i++) { // Reduced from 50 to 10
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: simpleFall 2s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 2000);
            }, i * 100);
        }
    }

    playSound(type) {
        if (!this.isVisible) return;
        
        // Reuse AudioContext instead of creating new ones
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
                duration = 0.3; // Shortened
                break;
            case 'lose':
                frequency = 220;
                duration = 0.5; // Shortened
                break;
            default:
                frequency = 440;
                duration = 0.1;
        }
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime); // Reduced volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    getStats() {
        const key = `flood-this-stats-v1-${this.difficulty}`;
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            bestScore: null,
            lastGameCompleted: null
        };
        
        try {
            const saved = localStorage.getItem(key);
            const stats = saved ? JSON.parse(saved) : defaultStats;
            
            // Ensure lastGameCompleted exists
            if (!stats.hasOwnProperty('lastGameCompleted')) {
                stats.lastGameCompleted = null;
            }
            
            return stats;
        } catch (error) {
            return defaultStats;
        }
    }

    saveStats(stats) {
        const key = `flood-this-stats-v1-${this.difficulty}`;
        try {
            localStorage.setItem(key, JSON.stringify(stats));
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
        this.bestScore.textContent = stats.bestScore !== null ? stats.bestScore : '∞';
    }

    // Cleanup method for when page unloads
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
    if (window.floodItGame) {
        window.floodItGame.cleanup();
    }
});

// Initialize game when page loads
window.addEventListener('load', () => {
    window.floodItGame = new FloodThisGame();
});