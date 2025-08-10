class NumberGuessingGame {
    constructor() {
        this.secretNumber = 0;
        this.maxGuesses = 10;
        this.guessesLeft = this.maxGuesses;
        this.gameActive = false;
        this.countdownTime = 120;
        this.currentCountdown = this.countdownTime;
        this.clockInterval = null;
        
        // Performance optimizations
        this.audioContext = null;
        this.isVisible = true;
        this.floatingInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.startFloatingNumbers();
        this.setupVisibilityHandling();
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!this.isVisible) {
                if (this.audioContext) {
                    this.audioContext.suspend();
                }
                // Clear floating numbers when not visible
                if (this.floatingInterval) {
                    clearInterval(this.floatingInterval);
                }
            } else {
                // Restart floating numbers when visible
                this.startFloatingNumbers();
            }
        });
    }

    initializeElements() {
        this.guessInput = document.getElementById('guessInput');
        this.guessButton = document.getElementById('guessButton');
        this.message = document.getElementById('message');
        this.guessesLeftEl = document.getElementById('guessesLeft');
        this.clockEl = document.getElementById('clock');
        this.gamesWonEl = document.getElementById('gamesWon');
        this.totalGamesEl = document.getElementById('totalGames');
        this.floatingNumbersEl = document.getElementById('floatingNumbers');
        this.gameStartEl = document.getElementById('gameStart');
        this.startGuessingButton = document.getElementById('startGuessingButton');
        this.gameInterfaceEl = document.getElementById('gameInterface');
    }

    setupEventListeners() {
        this.guessButton.addEventListener('click', () => this.makeGuess(), { passive: true });
        this.startGuessingButton.addEventListener('click', () => this.startFirstGame(), { passive: true });
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.makeGuess();
            }
        });
        this.guessInput.addEventListener('input', () => {
            const value = parseInt(this.guessInput.value);
            if (value < 1 || value > 100) {
                this.guessInput.style.borderColor = '#ff4444';
            } else {
                this.guessInput.style.borderColor = '#4CAF50';
            }
        }, { passive: true });
    }
    
    startFirstGame() {
        this.gameStartEl.style.display = 'none';
        this.clockEl.style.display = 'block';
        this.gameInterfaceEl.style.display = 'block';
        
        this.startNewGame();
        this.startClock();
    }

    startNewGame() {
        this.secretNumber = Math.floor(Math.random() * 100) + 1;
        this.guessesLeft = this.maxGuesses;
        this.gameActive = true;

        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.currentCountdown = this.countdownTime;
            this.startClock();
        }

        this.updateGuessesDisplay();
        this.updateMessage("I'm thinking of a number between 1 and 100. Can you guess it?", "");
        this.guessInput.value = '';
        this.guessInput.focus();
        this.playSound('newGame');
    }

    makeGuess() {
        if (!this.gameActive || !this.isVisible) return;

        const guess = parseInt(this.guessInput.value);
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
            this.updateMessage("Please enter a number between 1 and 100!", "error");
            this.playSound('error');
            return;
        }

        this.guessesLeft--;
        this.updateGuessesDisplay();

        if (guess === this.secretNumber) {
            this.handleCorreectGuess();
        } else if (this.guessesLeft === 0) {
            this.handleGameOver();
        } else {
            this.handleIncorrectGuess(guess);
        }

        this.guessInput.value = '';
        this.guessInput.focus();
    }

    handleCorreectGuess() {
        this.gameActive = false;
        this.updateMessage(`🗣️ Awesome! You guessed it! The number was ${this.secretNumber}!`, "success");
        this.playSound('win');
        this.createSimpleConfetti();
        
        const stats = this.getStats();
        stats.gamesWon++;
        stats.totalGames++;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => this.startNewGame(), 2000); // Reduced timing
    }

    handleGameOver() {
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The number was ${this.secretNumber}.`, "error");
        this.playSound('lose');
        
        const stats = this.getStats();
        stats.totalGames++;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => this.startNewGame(), 2000);
    }

    handleTimeUp() {
        this.gameActive = false;
        this.updateMessage(`⏰ Time's up! The number was ${this.secretNumber}. Try again!`, "error");
        this.playSound('lose');
        
        const stats = this.getStats();
        stats.totalGames++;
        this.saveStats(stats);
        this.updateStatsDisplay();
        
        setTimeout(() => this.startNewGame(), 2000);
    }

    handleIncorrectGuess(guess) {
        const hint = guess < this.secretNumber ? "higher" : "lower";
        const distance = Math.abs(guess - this.secretNumber);
        let temperature = "";
        
        if (distance <= 5) temperature = "🔥 Very Hot!";
        else if (distance <= 10) temperature = "🥵 Hot!";
        else if (distance <= 20) temperature = "☀️ Warm";
        else if (distance <= 30) temperature = "🥶 Cold";
        else temperature = "🧊 Very Cold!";

        this.updateMessage(`Try ${hint}! ${temperature}`, "hint");
        this.playSound('hint');
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    updateGuessesDisplay() {
        this.guessesLeftEl.textContent = `${this.guessesLeft} guesses left`;
        if (this.guessesLeft <= 3) {
            this.guessesLeftEl.style.color = '#ff4444';
        } else {
            this.guessesLeftEl.style.color = '#ffeb3b';
        }
    }

    startClock() {
        this.countdownTime = 120;
        this.currentCountdown = this.countdownTime;
        
        const updateCountdown = () => {
            const minutes = Math.floor(this.currentCountdown / 60);
            const seconds = this.currentCountdown % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.clockEl.textContent = `⏱️ ${timeString}`;
            
            if (this.currentCountdown <= 30) {
                this.clockEl.style.color = '#ff3333';
                this.clockEl.style.animation = 'pulse 1s ease-in-out infinite';
            } else if (this.currentCountdown <= 60) {
                this.clockEl.style.color = '#ff6b6b';
            } else {
                this.clockEl.style.color = '#ffd700';
                this.clockEl.style.animation = 'none';
            }
        };
        
        updateCountdown();
        this.clockInterval = setInterval(() => {
            this.currentCountdown--;
            updateCountdown();
            
            if (this.currentCountdown <= 0) {
                clearInterval(this.clockInterval);
                this.handleTimeUp();
            }
        }, 1000);
    }

    startFloatingNumbers() {
        if (!this.isVisible) return;
        
        // Clear existing interval
        if (this.floatingInterval) {
            clearInterval(this.floatingInterval);
        }
        
        const createFloatingNumber = () => {
            if (!this.isVisible) return;
            
            const number = document.createElement('div');
            number.className = 'floating-number';
            number.textContent = Math.floor(Math.random() * 100) + 1;
            number.style.left = Math.random() * 100 + '%';
            number.style.animation = `float ${Math.random() * 3 + 6}s linear infinite`;
            number.style.animationDelay = Math.random() * 2 + 's';
                
            this.floatingNumbersEl.appendChild(number);
            
            setTimeout(() => {
                if (number.parentNode) {
                    number.parentNode.removeChild(number);
                }
            }, 9000); // Reduced duration
        };
        
        createFloatingNumber();
        this.floatingInterval = setInterval(createFloatingNumber, 4000); // Reduced frequency
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
            case 'hint':
                frequency = 440;
                duration = 0.1;
                break;
            case 'error':
                frequency = 200;
                duration = 0.2;
                break;
            case 'newGame':
                frequency = 330;
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
            totalGames: 0
        };
        
        try {
            const saved = localStorage.getItem('number-game-stats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch (error) {
            return defaultStats;
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem('number-game-stats', JSON.stringify(stats));
        } catch (error) {
            console.warn('Could not save stats:', error);
        }
    }

    loadStats() {
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWonEl.textContent = stats.gamesWon;
        this.totalGamesEl.textContent = stats.totalGames;
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        if (this.floatingInterval) {
            clearInterval(this.floatingInterval);
        }
    }
}

// Add simple CSS animation for confetti
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
    if (window.numberGame) {
        window.numberGame.cleanup();
    }
});

// Initialize game when page loads
window.addEventListener('load', () => {
    window.numberGame = new NumberGuessingGame();
});