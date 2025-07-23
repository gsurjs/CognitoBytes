class FloodThisGame {
    constructor() {
        this.boardSize = 14;
        this.maxMoves = 25;
        this.numColors = 4;
        this.currentMoves = 0;
        this.gameActive = true;
        this.board = [];
        this.difficulty = 'easy';
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.startNewGame();
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
        this.newGameButton.addEventListener('click', () => this.startNewGame());
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
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
                this.maxMoves = 20;
                this.numColors = 6;
                break;
        }
        
        this.startNewGame();
    }

    startNewGame() {
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
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = `cell color-${this.board[row][col]}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.gameBoard.appendChild(cell);
            }
        }
    }

    createColorPalette() {
        this.colorPalette.innerHTML = '';
        
        for (let i = 0; i < this.numColors; i++) {
            const button = document.createElement('div');
            button.className = `color-button color-${i}`;
            button.dataset.color = i;
            button.addEventListener('click', () => this.floodFill(i));
            this.colorPalette.appendChild(button);
        }
    }

    floodFill(newColor) {
        if (!this.gameActive) return;
        
        const startColor = this.board[0][0];
        if (startColor === newColor) return; // No change needed
        
        this.currentMoves++;
        this.updateMovesDisplay();
        
        // Perform flood fill
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        this.floodFillRecursive(0, 0, startColor, newColor, visited);
        
        // Update visual board
        this.updateVisualBoard();
        
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
        
        // Mark cell for animation
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            setTimeout(() => {
                cell.classList.add('flooded');
                cell.className = `cell color-${newColor} flooded`;
                setTimeout(() => {
                    cell.classList.remove('flooded');
                }, 300);
            }, Math.random() * 200);
        }
        
        // Recursively flood neighboring cells
        this.floodFillRecursive(row + 1, col, oldColor, newColor, visited);
        this.floodFillRecursive(row - 1, col, oldColor, newColor, visited);
        this.floodFillRecursive(row, col + 1, oldColor, newColor, visited);
        this.floodFillRecursive(row, col - 1, oldColor, newColor, visited);
    }

    updateVisualBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.className = `cell color-${this.board[row][col]}`;
                }
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
        this.updateMessage(`🎉 Excellent! You flooded the board in ${this.currentMoves} moves!`, "success");
        this.playSound('win');
        this.createConfetti();
        
        // Update stats
        const stats = this.getStats();
        stats.gamesWon++;
        stats.gamesPlayed++;
        if (stats.bestScore === null || this.currentMoves < stats.bestScore) {
            stats.bestScore = this.currentMoves;
        }
        this.saveStats(stats);
        this.updateStatsDisplay();
    }

    handleLoss() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! You ran out of moves. Try again!`, "error");
        this.playSound('lose');
        
        // Update stats
        const stats = this.getStats();
        stats.gamesPlayed++;
        this.saveStats(stats);
        this.updateStatsDisplay();
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

    createConfetti() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e91e63'];
        
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
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        
        switch(type) {
            case 'win':
                frequency = 523.25;
                duration = 0.5;
                break;
            case 'lose':
                frequency = 220;
                duration = 0.8;
                break;
            case 'move':
                frequency = 440;
                duration = 0.1;
                break;
            default:
                frequency = 440;
                duration = 0.2;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    getStats() {
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            bestScore: null
        };
        
        const saved = localStorage.getItem('flood-it-stats');
        return saved ? JSON.parse(saved) : defaultStats;
    }

    saveStats(stats) {
        localStorage.setItem('flood-it-stats', JSON.stringify(stats));
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

// Initialize game when page loads
window.addEventListener('load', () => {
    new FloodThisGame();
});