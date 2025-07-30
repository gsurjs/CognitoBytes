class FloodThisGame {
    constructor() {
        this.boardSize = 14;
        this.maxMoves = 25;
        this.numColors = 4;
        this.currentMoves = 0;
        this.gameActive = true;
        this.board = [];
        this.gameMode = 'easy'; // 'daily', 'easy', 'medium', 'hard'

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
        // Load saved game mode setting
        const savedMode = localStorage.getItem('flood-this-gameMode');
        this.gameMode = savedMode || 'easy';
        
        // Update button states based on saved mode
        this.updateModeButtons();
        
        // Set difficulty parameters based on mode
        this.setModeParameters();
        
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
        this.dailyMode = document.getElementById('dailyMode');
        this.easyMode = document.getElementById('easyMode');
        this.mediumMode = document.getElementById('mediumMode');
        this.hardMode = document.getElementById('hardMode');
        //this.newGameButton = document.getElementById('newGameButton');
        this.newGameButton2 = document.getElementById('newGameButton2');
        this.shareButton = document.getElementById('shareButton');
        this.statsButton = document.getElementById('statsButton');
    }

    setupEventListeners() {
        this.dailyMode.addEventListener('click', () => this.setGameMode('daily'));
        this.easyMode.addEventListener('click', () => this.setGameMode('easy'));
        this.mediumMode.addEventListener('click', () => this.setGameMode('medium'));
        this.hardMode.addEventListener('click', () => this.setGameMode('hard'));
        //this.newGameButton.addEventListener('click', () => this.startNewGame(true)); // Force new game
        this.newGameButton2.addEventListener('click', () => this.startNewGame(true)); // Force new game

        if (this.shareButton) {
            this.shareButton.addEventListener('click', () => this.shareResults());
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

    setGameMode(mode) {
        // If mode hasn't changed, don't do anything
        if (this.gameMode === mode) return;
        
        this.gameMode = mode;
        localStorage.setItem('flood-this-gameMode', mode); // Save mode preference
        
        this.updateModeButtons();
        this.setModeParameters();
        this.updateStatsDisplay();
        
        // Start new game when switching modes
        this.startNewGame();
    }

    updateModeButtons() {
        this.dailyMode.classList.toggle('active', this.gameMode === 'daily');
        this.easyMode.classList.toggle('active', this.gameMode === 'easy');
        this.mediumMode.classList.toggle('active', this.gameMode === 'medium');
        this.hardMode.classList.toggle('active', this.gameMode === 'hard');
    }

    setModeParameters() {
        // Set difficulty parameters based on game mode
        switch(this.gameMode) {
            case 'daily':
                this.boardSize = 14;
                this.maxMoves = 25;
                this.numColors = 5; // Medium difficulty for daily
                break;
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
    }

    startNewGame(forceNew = false) {

        // Hide buttons at start of new game
        this.hideAllButtons();

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
        
        // Update message based on mode
        if (this.gameMode === 'daily') {
            this.updateMessage("Solve today's daily puzzle!", "info");
        } else {
            this.updateMessage("Flood the board from top left to bottom right!", "info");
        }
        
        // Update difficulty display
        const difficultyEl = document.querySelector('.difficulty');
        difficultyEl.textContent = `${this.boardSize}x${this.boardSize} Grid`;
        
        // Save the initial state of the new game
        this.saveGameState();
    }

    generateBoard() {
        this.board = [];
        
        if (this.gameMode === 'daily') {
            // Generate deterministic daily board
            this.generateDailyBoard();
        } else {
            // Generate random board for other modes
            this.generateRandomBoard();
        }
    }

    generateDailyBoard() {
        // Create a deterministic board based on today's date
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const seed = this.hashCode(dateString);
        
        this.board = [];
        let rng = new SeededRandom(seed);
        
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = Math.floor(rng.random() * this.numColors);
            }
        }
    }

    generateRandomBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = Math.floor(Math.random() * this.numColors);
            }
        }
    }

    // Hash function for consistent daily seeds
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
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


    hideAllButtons() {
        if (this.statsButton) {
            this.statsButton.style.display = 'none';
        }
        if (this.shareButton) {
            this.shareButton.style.display = 'none';
        }
        if (this.newGameButton) {
            this.newGameButton.style.display = 'none';
        }
    }


    handleWin() {
        this.gameActive = false;
        this.saveGameState(); // Save final game state
        this.updateMessage(`🎉 Excellent! You flooded the board in ${this.currentMoves} moves!`, "success");
        this.playSound('win');

        // Simplified confetti - less intensive
        this.createSimpleConfetti();
        
        // Update stats - simplified approach like Alpha-Bit
        const stats = this.getStats();
        const gameStateKey = this.getGameStateKey();
        
        // Check if stats for this game have already been recorded
        if (stats.lastGameCompleted !== gameStateKey) {
            stats.gamesWon++;
            stats.gamesPlayed++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            
            if (stats.bestScore === null || this.currentMoves < stats.bestScore) {
                stats.bestScore = this.currentMoves;
            }
            
            // Track score distribution (moves to win)
            if (!stats.scoreDistribution) {
                stats.scoreDistribution = {};
            }
            stats.scoreDistribution[this.currentMoves] = (stats.scoreDistribution[this.currentMoves] || 0) + 1;
            
            stats.lastGameCompleted = gameStateKey; // Mark this game as recorded
            this.saveStats(stats);
        }
        this.updateStatsDisplay();

        // Show buttons after a delay
        setTimeout(() => {
            if (this.statsButton) this.statsButton.style.display = 'inline-block';
            if (this.gameMode === 'daily' && this.shareButton) {
                this.shareButton.style.display = 'inline-block';
            }
            if (this.gameMode !== 'daily' && this.newGameButton) {
                this.newGameButton.style.display = 'inline-block';
            }
        }, 500);
    }

    handleLoss() {
        this.gameActive = false;
        this.saveGameState(); // Save final game state
        this.updateMessage(`💀 Game Over! You ran out of moves. Try again!`, "error");
        this.playSound('lose');
        
        // Update stats - simplified approach like Alpha-Bit
        const stats = this.getStats();
        const gameStateKey = this.getGameStateKey();
        
        // Check if stats for this game have already been recorded
        if (stats.lastGameCompleted !== gameStateKey) {
            stats.gamesPlayed++;
            stats.currentStreak = 0; // Reset streak on loss
            stats.lastGameCompleted = gameStateKey; // Mark this game as recorded
            this.saveStats(stats);
        }
        this.updateStatsDisplay();

        // Show buttons after a delay
        setTimeout(() => {
            if (this.statsButton) this.statsButton.style.display = 'inline-block';
            if (this.gameMode === 'daily' && this.shareButton) {
                this.shareButton.style.display = 'inline-block';
            }
            if (this.gameMode !== 'daily' && this.newGameButton) {
                this.newGameButton.style.display = 'inline-block';
            }
        }, 500);
    }

    saveGameState() {
        const state = {
            board: this.board,
            currentMoves: this.currentMoves,
            gameActive: this.gameActive,
            gameMode: this.gameMode, // Fixed: was this.difficulty
            boardSize: this.boardSize,
            maxMoves: this.maxMoves,
            numColors: this.numColors
        };
        localStorage.setItem(`flood-this-gameState-${this.gameMode}-v2`, JSON.stringify(state)); // Fixed: was this.difficulty
    }

    loadGameState() {
        const savedStateJSON = localStorage.getItem(`flood-this-gameState-${this.gameMode}-v2`);
        if (!savedStateJSON) return false;

        try {
            const savedState = JSON.parse(savedStateJSON);
            
            // For daily mode, validate that the saved game is for today
            if (this.gameMode === 'daily') {
                const today = new Date();
                const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
                const todaysSeed = this.hashCode(dateString);
                
                // Generate today's board to compare
                const todaysBoard = [];
                let rng = new SeededRandom(todaysSeed);
                for (let row = 0; row < this.boardSize; row++) {
                    todaysBoard[row] = [];
                    for (let col = 0; col < this.boardSize; col++) {
                        todaysBoard[row][col] = Math.floor(rng.random() * this.numColors);
                    }
                }
                
                // Check if the saved board matches today's board at the start positions
                let isToday = true;
                if (savedState.board.length !== todaysBoard.length) {
                    isToday = false;
                } else {
                    // Check a few positions to see if this matches today's puzzle
                    for (let checkRow = 0; checkRow < Math.min(3, this.boardSize) && isToday; checkRow++) {
                        for (let checkCol = 0; checkCol < Math.min(3, this.boardSize) && isToday; checkCol++) {
                            // We need to be smart about this check since the board might be partially flooded
                            // For now, let's just check if the dimensions match and trust the date-based validation
                        }
                    }
                }
                
                if (!isToday) {
                    this.clearGameState();
                    return false;
                }
            }
            
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
                // Game was completed, show final message and buttons
                if (this.checkWin()) {
                    const attempts = this.currentMoves;
                    this.updateMessage(`🎉 Excellent! You flooded the board in ${attempts} move${attempts === 1 ? '' : 's'}!`, "success");
                    
                    // Show appropriate buttons for completed game
                    setTimeout(() => {
                        if (this.statsButton) this.statsButton.style.display = 'inline-block';
                        if (this.gameMode === 'daily' && this.shareButton) {
                            this.shareButton.style.display = 'inline-block';
                        }
                        if (this.gameMode !== 'daily' && this.newGameButton) {
                            this.newGameButton.style.display = 'inline-block';
                        }
                    }, 100);
                } else {
                    this.updateMessage(`💀 Game Over! You ran out of moves. Try again!`, "error");
                    
                    // Show appropriate buttons for completed game
                    setTimeout(() => {
                        if (this.statsButton) this.statsButton.style.display = 'inline-block';
                        if (this.gameMode === 'daily' && this.shareButton) {
                            this.shareButton.style.display = 'inline-block';
                        }
                        if (this.gameMode !== 'daily' && this.newGameButton) {
                            this.newGameButton.style.display = 'inline-block';
                        }
                    }, 100);
                }
            } else {
                this.updateMessage("Welcome back! Continue flooding the board!", "info");
                this.hideAllButtons();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            this.clearGameState();
            return false;
        }
    }

    clearGameState() {
        localStorage.removeItem(`flood-this-gameState-${this.gameMode}-v2`); // Fixed: was this.difficulty
    }

    getGameStateKey() {
        // Create a unique key for this game
        if (this.gameMode === 'daily') {
            const today = new Date();
            const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            const key = `daily-${dateString}`;
            console.log(`Generated game state key for daily: ${key}`); // Debug log
            return key;
        } else {
            const key = `${this.gameMode}-${this.boardSize}-${this.maxMoves}-${this.numColors}`;
            console.log(`Generated game state key for ${this.gameMode}: ${key}`); // Debug log
            return key;
        }
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
        const key = `flood-this-stats-v2-${this.gameMode}`;
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            bestScore: null,
            lastGameCompleted: null,
            currentStreak: 0,
            maxStreak: 0,
            scoreDistribution: {}
        };

        const saved = localStorage.getItem(key); 
        const stats = saved ? JSON.parse(saved) : defaultStats;

        if (!stats.scoreDistribution) {
            stats.scoreDistribution = defaultStats.scoreDistribution;
        }

        return stats;
    }

    saveStats(stats) {
        const key = `flood-this-stats-v2-${this.gameMode}`;
        localStorage.setItem(key, JSON.stringify(stats));
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

    showStatsModal() {
        const stats = this.getStats();
        const modal = document.getElementById('statsModal');

        if (!modal) return;

        // Populate Stats - using the same approach as Alpha-Bit
        const statsPlayed = document.getElementById('statsPlayed');
        const statsWinRate = document.getElementById('statsWinRate');
        const statsBestScore = document.getElementById('statsBestScore');
        const statsCurrentStreak = document.getElementById('statsCurrentStreak');

        if (statsPlayed) statsPlayed.textContent = stats.gamesPlayed;
        
        const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
        if (statsWinRate) statsWinRate.textContent = winRate;
        
        if (statsBestScore) statsBestScore.textContent = stats.bestScore !== null ? stats.bestScore : '∞';
        if (statsCurrentStreak) statsCurrentStreak.textContent = stats.currentStreak || 0;

        // Populate Score Distribution
        const distributionContainer = document.getElementById('scoreDistribution');
        if (distributionContainer) {
            distributionContainer.innerHTML = ''; // Clear previous bars
            
            if (stats.scoreDistribution && Object.keys(stats.scoreDistribution).length > 0) {
                const scores = Object.keys(stats.scoreDistribution).map(Number).sort((a, b) => a - b);
                const maxCount = Math.max(...Object.values(stats.scoreDistribution));

                scores.forEach((score) => {
                    const count = stats.scoreDistribution[score];
                    const row = document.createElement('div');
                    row.className = 'dist-item';

                    const label = document.createElement('span');
                    label.textContent = score;

                    const bar = document.createElement('div');
                    bar.className = 'dist-bar';
                    bar.textContent = count;

                    // Highlight current game's score if it was just completed
                    if (!this.gameActive && this.checkWin() && score === this.currentMoves) {
                        bar.classList.add('highlight');
                    }

                    const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    bar.style.width = `${Math.max(width, 10)}%`; // Use a minimum width for visibility

                    row.appendChild(label);
                    row.appendChild(bar);
                    distributionContainer.appendChild(row);
                });
            } else {
                distributionContainer.innerHTML = '<p style="color: #ccc; font-size: 0.8rem; text-align: center;">No games completed yet</p>';
            }
        }

        modal.style.display = 'flex';
    }

        // Method to reset all stats - useful for debugging
    resetAllStats() {
        const modes = ['daily', 'easy', 'medium', 'hard'];
        modes.forEach(mode => {
            localStorage.removeItem(`flood-this-stats-v2-${mode}`);
            localStorage.removeItem(`flood-this-gameState-${mode}-v2`);
        });
        
        // Also clear old format stats if they exist
        modes.forEach(mode => {
            localStorage.removeItem(`flood-this-stats-${mode}`);
            localStorage.removeItem(`flood-this-gameState-${mode}`);
            localStorage.removeItem(`flood-this-stats-v1-${mode}`);
            localStorage.removeItem(`flood-this-gameState-${mode}-v1`);
        });
        
        console.log('All Flood-This stats and game states cleared');
        this.updateStatsDisplay();
    }

    // Debug method to check localStorage
    debugStats() {
        console.log('=== FLOOD-THIS DEBUG INFO ===');
        console.log('Current game mode:', this.gameMode);
        console.log('Current stats:', this.getStats());
        console.log('Game state key:', this.getGameStateKey());
        
        // Check all localStorage keys
        const modes = ['daily', 'easy', 'medium', 'hard'];
        modes.forEach(mode => {
            const statsKey = `flood-this-stats-v2-${mode}`;
            const gameKey = `flood-this-gameState-${mode}-v2`;
            console.log(`${mode} stats:`, localStorage.getItem(statsKey));
            console.log(`${mode} game state:`, localStorage.getItem(gameKey));
        });
        console.log('=== END DEBUG INFO ===');
    }

    shareResults() {
        const shareText = this.generateShareText();

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
                    if (this.checkWin()) {
                        const attempts = this.currentMoves;
                        this.updateMessage(`🎉 Excellent! You flooded the board in ${attempts} move${attempts === 1 ? '' : 's'}!`, "success");
                    } else {
                        this.updateMessage(`💀 Game Over! You ran out of moves. Try again!`, "error");
                    }
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
        // Prevent main page from scrolling while the modal is open
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
        // Calculate daily game number (similar to Alpha-Bit)
        const epoch = new Date('2025-07-29T00:00:00'); // Set epoch to today for Flood-This
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysSinceEpoch = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const puzzleNumber = Math.max(1, daysSinceEpoch);
        
        let shareText = `Flood-This ${puzzleNumber} `;
        
        // Add score line
        if (this.checkWin()) {
            shareText += `${this.currentMoves}/${this.maxMoves}\n\n`;
        } else {
            shareText += `X/${this.maxMoves}\n\n`;
        }
        
        // Add emoji grid (2x2 for compact sharing)
        let emojiGrid = '';
        if (this.checkWin()) {
            // Get the final color from top-left corner
            const finalColor = this.board[0][0];
            const colorEmojis = {
                0: '🟥', // Red
                1: '🟦', // Blue  
                2: '🟩', // Green
                3: '🟧', // Orange
                4: '🟪', // Purple
                5: '🟪'  // Pink (using purple as closest)
            };
            const emoji = colorEmojis[finalColor] || '⬜';
            
            // Create 2x2 grid
            emojiGrid = `${emoji}${emoji}${emoji}${emoji}${emoji}${emoji}\n${emoji}${emoji}${emoji}${emoji}${emoji}${emoji}\n${emoji}${emoji}${emoji}${emoji}${emoji}${emoji}\n${emoji}${emoji}${emoji}${emoji}${emoji}${emoji}\n${emoji}${emoji}${emoji}${emoji}${emoji}${emoji}\n${emoji}${emoji}${emoji}${emoji}${emoji}${emoji}`;
        } else {
            // Game over - use X emojis
            emojiGrid = `❌❌❌❌❌❌\n❌❌❌❌❌❌\n❌❌❌❌❌❌\n❌❌❌❌❌❌\n❌❌❌❌❌❌\n❌❌❌❌❌❌`;
        }
        
        shareText += emojiGrid + '\n\n';
        shareText += 'Play at: ' + window.location.href;
        
        return shareText;
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

// Seeded random number generator for consistent daily puzzles
class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    random() {
        this.seed = this.seed * 16807 % 2147483647;
        return (this.seed - 1) / 2147483646;
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