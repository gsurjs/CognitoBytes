class FloodThisGame {
    constructor() {
        this.boardSize = 14;
        this.maxMoves = 25;
        this.numColors = 4;
        this.currentMoves = 0;
        this.gameActive = true;
        this.board = [];
        this.difficulty = 'easy';

        // --- NEW: Game Mode ---
        this.gameMode = 'classic'; // 'classic' or 'daily'

        this.audioContext = null;
        this.isVisible = true;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats(); // Loads classic stats on init
        this.startNewGame();
        this.setupVisibilityHandling();
    }

    // --- NEW: Seeded Random Functions (for Daily Puzzle) ---
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    seededRandom(seed) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
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
        this.difficultyDisplay = document.getElementById('difficultyDisplay');

        // --- NEW: Get all new elements for Daily Mode ---
        this.dailyModeButton = document.getElementById('dailyMode');
        this.classicModeButton = document.getElementById('classicMode');
        this.difficultySelector = document.getElementById('difficultySelector');
        this.endGameButtons = document.getElementById('endGameButtons');
        this.shareDailyButton = document.getElementById('shareDailyButton');
        this.statsDailyButton = document.getElementById('statsDailyButton');
        this.dailyStatsSection = document.getElementById('dailyStatsSection');
        this.dailyGamesWonEl = document.getElementById('dailyGamesWon');
        this.dailyGamesPlayedEl = document.getElementById('dailyGamesPlayed');
        this.dailyWinStreakEl = document.getElementById('dailyWinStreak');
    }

    setupEventListeners() {
        // --- NEW: Event listeners for new mode buttons ---
        this.dailyModeButton.addEventListener('click', () => this.setGameMode('daily'));
        this.classicModeButton.addEventListener('click', () => this.setGameMode('classic'));
        this.shareDailyButton.addEventListener('click', () => this.shareDailyResults());

        // Existing listeners
        this.easyMode.addEventListener('click', () => this.setDifficulty('easy'));
        this.mediumMode.addEventListener('click', () => this.setDifficulty('medium'));
        this.hardMode.addEventListener('click', () => this.setDifficulty('hard'));
        this.newGameButton.addEventListener('click', () => this.startNewGame());
    }

    // --- NEW: Function to handle switching game modes ---
    setGameMode(mode) {
        if (this.gameMode === mode) return;
        this.gameMode = mode;

        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.classicModeButton.classList.toggle('active', mode === 'classic');

        this.difficultySelector.style.display = mode === 'classic' ? 'flex' : 'none';
        this.dailyStatsSection.style.display = mode === 'daily' ? 'flex' : 'none';

        if (mode === 'daily') {
            this.updateDailyStatsDisplay();
        } else {
            this.updateStatsDisplay(); // Show classic stats
        }

        this.startNewGame();
    }
    
    setDifficulty(difficulty) {
        if (this.gameMode !== 'classic') return;
        
        this.difficulty = difficulty;
        this.easyMode.classList.toggle('active', difficulty === 'easy');
        this.mediumMode.classList.toggle('active', difficulty === 'medium');
        this.hardMode.classList.toggle('active', difficulty === 'hard');
        
        this.startNewGame();
    }

    startNewGame() {
        this.currentMoves = 0;
        this.gameActive = true;
        this.endGameButtons.style.display = 'none';

        if (this.gameMode === 'daily') {
            this.boardSize = 14;
            this.maxMoves = 25;
            this.numColors = 5;
            this.difficultyDisplay.textContent = 'Daily Puzzle';
        } else {
            switch(this.difficulty) {
                case 'easy':
                    this.boardSize = 14; this.maxMoves = 25; this.numColors = 4;
                    break;
                case 'medium':
                    this.boardSize = 14; this.maxMoves = 25; this.numColors = 5;
                    break;
                case 'hard':
                    this.boardSize = 14; this.maxMoves = 20; this.numColors = 6;
                    break;
            }
            this.difficultyDisplay.textContent = `${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}`;
        }
        
        this.generateBoard();
        this.createGameBoard();
        this.createColorPalette();
        this.updateMovesDisplay();
        this.updateMessage("Flood the board with one color!", "info");
    }

    generateBoard() {
        let randFunc = Math.random;

        if (this.gameMode === 'daily') {
            const today = new Date();
            const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            const seed = this.hashCode(dateString);
            randFunc = this.seededRandom(seed);
        }

        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = Math.floor(randFunc() * this.numColors);
            }
        }
    }

    floodFill(newColor) {
        if (!this.gameActive || !this.isVisible) return;
        
        const startColor = this.board[0][0];
        if (startColor === newColor) return;
        
        this.currentMoves++;
        this.updateMovesDisplay();
        
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        this.floodFillRecursive(0, 0, startColor, newColor, visited);
        
        this.updateVisualBoard();
        
        if (this.checkWin()) {
            this.handleWin();
        } else if (this.currentMoves >= this.maxMoves) {
            this.handleLoss();
        }
    }

    handleWin() {
        this.gameActive = false;
        this.updateMessage(`🎉 Solved in ${this.currentMoves} moves!`, "success");
        this.playSound('win');
        this.createSimpleConfetti();
        
        if (this.gameMode === 'daily') {
            this.handleDailyGameOver(true);
        } else {
            const stats = this.getStats();
            stats.gamesWon++;
            stats.gamesPlayed++;
            if (stats.bestScore === null || this.currentMoves < stats.bestScore) {
                stats.bestScore = this.currentMoves;
            }
            this.saveStats(stats);
            this.updateStatsDisplay();
        }
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Out of moves!`, "error");
        this.playSound('lose');
        
        if (this.gameMode === 'daily') {
            this.handleDailyGameOver(false);
        } else {
            const stats = this.getStats();
            stats.gamesPlayed++;
            this.saveStats(stats);
            this.updateStatsDisplay();
        }
    }

    // --- NEW: Stats and Sharing Logic for Daily Mode ---
    getDailyStats() {
        const defaultStats = { gamesWon: 0, gamesPlayed: 0, currentStreak: 0, maxStreak: 0, lastGamePlayed: null };
        const saved = localStorage.getItem('flood-it-daily-stats');
        return saved ? JSON.parse(saved) : defaultStats;
    }

    saveDailyStats(stats) {
        localStorage.setItem('flood-it-daily-stats', JSON.stringify(stats));
    }

    updateDailyStatsDisplay() {
        const stats = this.getDailyStats();
        this.dailyGamesWonEl.textContent = stats.gamesWon;
        this.dailyGamesPlayedEl.textContent = stats.gamesPlayed;
        this.dailyWinStreakEl.textContent = stats.currentStreak;
    }

    handleDailyGameOver(isWin) {
        this.gameActive = false;
        const today = new Date().toDateString();
        const stats = this.getDailyStats();

        if (stats.lastGamePlayed !== today) {
            stats.gamesPlayed++;
            if (isWin) {
                stats.gamesWon++;
                stats.currentStreak++;
                stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            } else {
                stats.currentStreak = 0;
            }
            stats.lastGamePlayed = today;
            this.saveDailyStats(stats);
        }
        
        this.updateDailyStatsDisplay();
        
        setTimeout(() => {
            this.endGameButtons.style.display = 'flex';
        }, 500);
    }
    
    shareDailyResults() {
        const text = this.generateShareText();
        if (navigator.share) {
            navigator.share({ text }).catch(() => this.fallbackShare(text));
        } else {
            this.fallbackShare(text);
        }
    }

    generateShareText() {
        const today = new Date();
        const puzzleNumber = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
        const result = this.checkWin() ? `${this.currentMoves}/${this.maxMoves}` : `X/${this.maxMoves}`;
        return `🌊 Flood-This! Daily #${puzzleNumber}\nScore: ${result}\n\nPlay at: ${window.location.host}`;
    }

    fallbackShare(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.updateMessage("📋 Results copied to clipboard!", "info");
        });
    }

    // (The rest of the original functions are below, many are unchanged)

    createGameBoard() {
        const fragment = document.createDocumentFragment();
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = `cell color-${this.board[row][col]}`;
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
            button.addEventListener('click', () => this.floodFill(i), { passive: true });
            fragment.appendChild(button);
        }
        this.colorPalette.appendChild(fragment);
    }

    floodFillRecursive(row, col, oldColor, newColor, visited) {
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) return;
        if (visited[row][col] || this.board[row][col] !== oldColor) return;
        visited[row][col] = true;
        this.board[row][col] = newColor;
        this.floodFillRecursive(row + 1, col, oldColor, newColor, visited);
        this.floodFillRecursive(row - 1, col, oldColor, newColor, visited);
        this.floodFillRecursive(row, col + 1, oldColor, newColor, visited);
        this.floodFillRecursive(row, col - 1, oldColor, newColor, visited);
    }

    updateVisualBoard() {
        const cells = this.gameBoard.children;
        let index = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                cells[index].className = `cell color-${this.board[row][col]}`;
                index++;
            }
        }
    }

    checkWin() {
        const firstColor = this.board[0][0];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== firstColor) return false;
            }
        }
        return true;
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    updateMovesDisplay() {
        const remaining = this.maxMoves - this.currentMoves;
        this.movesLeft.textContent = `${remaining} moves left`;
        if (remaining <= 3) this.movesLeft.style.color = '#ff4444';
        else if (remaining <= 6) this.movesLeft.style.color = '#ff8800';
        else this.movesLeft.style.color = '#ffeb3b';
    }

    createSimpleConfetti() {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `position: fixed; width: 8px; height: 8px; background: #fff; left: ${Math.random()*100}%; top: -10px; border-radius: 50%; pointer-events: none; z-index: 9999; animation: simpleFall 2s linear forwards;`;
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 2000);
            }, i * 100);
        }
    }

    playSound(type) {
        if (!this.isVisible) return;
        if (!this.audioContext) this.audioContext = new(window.AudioContext || window.webkitAudioContext)();
        if (this.audioContext.state === 'suspended') this.audioContext.resume();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        let freq = type === 'win' ? 523.25 : 220;
        let dur = type === 'win' ? 0.3 : 0.5;
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + dur);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + dur);
    }
    
    // Classic Mode Stats (unchanged)
    getStats() {
        const defaultStats = { gamesWon: 0, gamesPlayed: 0, bestScore: null };
        return JSON.parse(localStorage.getItem('flood-it-stats')) || defaultStats;
    }

    saveStats(stats) {
        localStorage.setItem('flood-it-stats', JSON.stringify(stats));
    }

    loadStats() { this.updateStatsDisplay(); }
    
    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.bestScore.textContent = stats.bestScore !== null ? stats.bestScore : '∞';
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible && this.audioContext) this.audioContext.suspend();
        });
    }

    cleanup() {
        if (this.audioContext) this.audioContext.close();
    }
}

const style = document.createElement('style');
style.textContent = `@keyframes simpleFall { to { transform: translateY(100vh); opacity: 0; } }`;
document.head.appendChild(style);

window.addEventListener('load', () => new FloodThisGame());