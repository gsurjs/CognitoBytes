class MemoryGame {
    constructor() {
        this.difficulty = 'easy';
        this.numPairs = 8;
        this.memorizationTime = 3;
        this.gameTime = 120;
        this.currentTimer = 0;
        this.matchesFound = 0;
        this.attempts = 0;
        this.flippedCards = [];
        this.canFlip = false;
        this.gameActive = false;
        this.timerInterval = null;
        
        // Performance optimizations
        this.audioContext = null;
        this.isVisible = true;
        
        // Reduced image paths for better performance
        this.imagePaths = [
            'images/img01.jpg',
            'images/img02.jpg', 
            'images/img03.jpg',
            'images/img04.jpg',
            'images/img05.jpg',
            'images/img06.jpg',
            'images/img07.jpg',
            'images/img08.jpg',
            'images/img09.jpg',
            'images/img10.jpg',
            'images/img11.jpg',
            'images/img12.jpg'
        ];
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupVisibilityHandling();
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
        this.difficultySelect = document.getElementById('difficulty');
        this.pairsSelect = document.getElementById('pairs');
        this.startButton = document.getElementById('startButton');
        this.gameSetup = document.getElementById('gameSetup');
        this.memorizationPhase = document.getElementById('memorizationPhase');
        this.memorizationTimer = document.getElementById('memorizationTimer');
        this.gameInfo = document.getElementById('gameInfo');
        this.gameBoard = document.getElementById('gameBoard');
        this.gameOver = document.getElementById('gameOver');
        this.gameTimer = document.getElementById('gameTimer');
        this.matchesFoundEl = document.getElementById('matchesFound');
        this.attemptsEl = document.getElementById('attempts');
        this.totalPairsEl = document.getElementById('totalPairs');
        this.gameOverTitle = document.getElementById('gameOverTitle');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.playAgainButton = document.getElementById('playAgainButton');
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame(), { passive: true });
        this.playAgainButton.addEventListener('click', () => this.resetGame(), { passive: true });
        
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.memorizationTime = e.target.value === 'easy' ? 3 : e.target.value === 'medium' ? 5 : 8;
        }, { passive: true });
        
        this.pairsSelect.addEventListener('change', (e) => {
            this.numPairs = parseInt(e.target.value);
            this.gameTime = this.numPairs === 8 ? 120 : this.numPairs === 10 ? 150 : 180;
        }, { passive: true });
    }

    startGame() {
        this.gameSetup.style.display = 'none';
        this.memorizationPhase.style.display = 'block';
        this.totalPairsEl.textContent = this.numPairs;
        
        this.createGameBoard();
        this.startMemorizationPhase();
    }

    createGameBoard() {
        const fragment = document.createDocumentFragment();
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board grid-${this.numPairs}`;
        
        // Create card pairs
        const cardPairs = [];
        for (let i = 0; i < this.numPairs; i++) {
            const imagePath = this.imagePaths[i];
            cardPairs.push(imagePath, imagePath);
        }
        
        // Shuffle cards
        this.shuffleArray(cardPairs);
        
        // Create card elements with fragment for better performance
        cardPairs.forEach((imagePath, index) => {
            const card = this.createCard(imagePath, index);
            fragment.appendChild(card);
        });
        
        this.gameBoard.appendChild(fragment);
    }

    createCard(imagePath, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.image = imagePath;
        card.dataset.index = index;
        
        // Simplified card structure for better performance
        card.innerHTML = `
            <div class="card-face card-back">${index + 1}</div>
            <div class="card-face card-front">
                <img src="${imagePath}" alt="Memory Card" class="card-image" 
                     onerror="this.parentElement.innerHTML='<div style=&quot;display:flex;align-items:center;justify-content:center;height:100%;font-size:0.8rem;color:#666;text-align:center;&quot;>🖼️</div>'">
            </div>
        `;
        
        card.addEventListener('click', () => this.flipCard(card), { passive: true });
        return card;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startMemorizationPhase() {
        this.gameBoard.style.display = 'grid';

        // Show all cards during memorization
        const cards = this.gameBoard.querySelectorAll('.card');
        cards.forEach(card => card.classList.add('flipped'));
        
        let timeLeft = this.memorizationTime;
        this.memorizationTimer.textContent = timeLeft;
        
        const memorizationInterval = setInterval(() => {
            timeLeft--;
            this.memorizationTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(memorizationInterval);
                this.startGamePlay();
            }
        }, 1000);
    }

    startGamePlay() {
        // Hide all cards efficiently
        const cards = this.gameBoard.querySelectorAll('.card');
        cards.forEach(card => card.classList.remove('flipped'));
        
        // Show game interface
        this.memorizationPhase.style.display = 'none';
        this.gameInfo.style.display = 'block';
        this.gameBoard.style.display = 'grid';
        
        // Enable card flipping and start timer
        this.canFlip = true;
        this.gameActive = true;
        this.currentTimer = this.gameTime;
        this.startGameTimer();
    }

    startGameTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            if (!this.isVisible) return; // Pause when not visible
            
            this.currentTimer--;
            this.updateTimerDisplay();
            
            if (this.currentTimer <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.gameTimer.textContent = this.currentTimer;
        
        if (this.currentTimer <= 30) {
            this.gameTimer.classList.add('warning');
        } else {
            this.gameTimer.classList.remove('warning');
        }
    }

    flipCard(card) {
        if (!this.canFlip || !this.gameActive || !this.isVisible || 
            card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.attempts++;
            this.attemptsEl.textContent = this.attempts;
            
            setTimeout(() => this.checkMatch(), 800); // Reduced timing
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.dataset.image === card2.dataset.image) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.classList.add('flipped');
            card2.classList.add('flipped');
            this.matchesFound++;
            this.matchesFoundEl.textContent = this.matchesFound;
            this.playSound('match');
            
            if (this.matchesFound === this.numPairs) {
                setTimeout(() => this.endGame(true), 300); // Reduced timing
            }
        } else {
            // No match
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.playSound('nomatch');
        }
        
        this.flippedCards = [];
        this.canFlip = true;
    }

    endGame(success) {
        this.gameActive = false;
        this.canFlip = false;
        clearInterval(this.timerInterval);
        
        this.gameBoard.style.display = 'none';
        this.gameInfo.style.display = 'none';
        this.gameOver.style.display = 'block';
        
        // Update and save stats
        const stats = this.getStats();
        stats.gamesPlayed++;
        
        if (success) {
            stats.gamesWon++;
            this.gameOver.className = 'game-over success';
            this.gameOverTitle.textContent = '🎉 Congratulations!';
            this.gameOverMessage.textContent = `You completed the game in ${this.attempts} attempts with ${this.currentTimer} seconds remaining!`;
            this.playSound('win');
            this.createSimpleSuccessAnimation();
        } else {
            this.gameOver.className = 'game-over failure';
            this.gameOverTitle.textContent = '⏰ Time\'s Up!';
            this.gameOverMessage.textContent = `Game over! You found ${this.matchesFound} out of ${this.numPairs} pairs.`;
            this.playSound('lose');
        }
        
        this.saveStats(stats);
    }

    createSimpleSuccessAnimation() {
        if (!this.isVisible) return;
        
        // Much simpler animation
        for (let i = 0; i < 6; i++) { // Reduced from 20
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.textContent = '👟';
                sparkle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    font-size: 1.5rem;
                    pointer-events: none;
                    z-index: 9999;
                    animation: simpleSparkle 1.5s ease-out forwards;
                `;
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1500);
            }, i * 200);
        }
    }

    resetGame() {
        this.matchesFound = 0;
        this.attempts = 0;
        this.flippedCards = [];
        this.canFlip = false;
        this.gameActive = false;
        
        this.matchesFoundEl.textContent = '0';
        this.attemptsEl.textContent = '0';
        
        this.gameOver.style.display = 'none';
        this.gameSetup.style.display = 'block';
        this.gameInfo.style.display = 'none';
        this.memorizationPhase.style.display = 'none';
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
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
            case 'match':
                frequency = 523.25;
                duration = 0.2;
                break;
            case 'nomatch':
                frequency = 220;
                duration = 0.15;
                break;
            case 'win':
                frequency = 659.25;
                duration = 0.3;
                break;
            case 'lose':
                frequency = 196;
                duration = 0.4;
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
            gamesPlayed: 0
        };
        
        try {
            const saved = localStorage.getItem('memory-game-stats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch (error) {
            return defaultStats;
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem('memory-game-stats', JSON.stringify(stats));
        } catch (error) {
            console.warn('Could not save stats:', error);
        }
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

// Add simple CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes simpleSparkle {
        0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.memoryGame) {
        window.memoryGame.cleanup();
    }
});

// Initialize game when page loads
window.addEventListener('load', () => {
    window.memoryGame = new MemoryGame();
});