class NumberGuessingGame {
    constructor() {
        this.secretNumber = 0;
        this.maxGuesses = 10;
        this.guessesLeft = this.maxGuesses;
        this.gamesWon = 0;
        this.totalGames = 0;
        this.gameActive = false;
        this.countdownTime = 120; //two minutes
        this.currentCountdown = this.countdownTime;
        this.clockInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startFloatingNumbers();
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
        this.guessButton.addEventListener('click', () => this.makeGuess());
        this.startGuessingButton.addEventListener('click', () => this.startFirstGame());
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
        });
    }
    startFirstGame() {
        //hide start button and show clock
        this.gameStartEl.style.display = 'none';
        this.clockEl.style.display = 'block';
        this.gameInterfaceEl.style.display = 'block'; //show game interface
        
        //start first game
        this.startNewGame();
        this.startClock();
    }

    startNewGame() {
        this.secretNumber = Math.floor(Math.random() * 100) + 1;
        this.guessesLeft = this.maxGuesses;
        this.gameActive = true;

        //reset countdown
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
        if (!this.gameActive) return;

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
        this.gamesWon++;
        this.totalGames++;
        this.gameActive = false;
        this.updateMessage(`🗣️ Awesome! You guessed it! The number was ${this.secretNumber}!`, "success");
        this.updateStats();
        this.playSound('win');
        this.createConfetti();
        setTimeout(() => this.startNewGame(), 3000);
    }

    handleGameOver() {
        this.totalGames++;
        this.gameActive = false;
        this.updateMessage(`💀 Game Over! The number was ${this.secretNumber}.`, "error");
        this.updateStats();
        this.playSound('lose');
        setTimeout(() => this.startNewGame(), 3000);
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

    updateStats() {
        this.gamesWonEl.textContent = this.gamesWon;
        this.totalGamesEl.textContent = this.totalGames;
    }

    startClock() {
        //set init countdown time in seconds
        this.countdownTime = 120; //2 minute countdown
        this.currentCountdown = this.countdownTime;
        
        const updateCountdown = () => {
            const minutes = Math.floor(this.currentCountdown / 60);
            const seconds = this.currentCountdown % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.clockEl.textContent = `⏱️ ${timeString}`;
            
            //warning for when time runs low
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
            
            // End game when countdown reaches 0
            if (this.currentCountdown <= 0) {
                clearInterval(this.clockInterval);
                this.handleTimeUp();
            }
        }, 1000);
    }

    handleTimeUp() {
        this.totalGames++;
        this.gameActive = false;
        this.updateMessage(`⏰ Time's up! The number was ${this.secretNumber}. Try again!`, "error");
        this.updateStats();
        this.playSound('lose');
        setTimeout(() => this.startNewGame(), 3000);
    }

    startFloatingNumbers() {
        const createFloatingNumber = () => {
            const number = document.createElement('div');
            number.className = 'floating-number';
            number.textContent = Math.floor(Math.random() * 100) + 1;
            number.style.left = Math.random() * 100 + '%';
            number.style.animationDelay = Math.random() * 2 + 's';
            number.style.animationDuration = (Math.random() * 5 + 8) + 's';
            number.style.animation = `float ${Math.random() * 5 + 8}s linear infinite`;
            number.style.animationDelay = Math.random() * 2 + 's';
                
            this.floatingNumbersEl.appendChild(number);
            
            setTimeout(() => {
                if (number.parentNode) {
                    number.parentNode.removeChild(number);
                }
            }, 13000);
        };
        
        createFloatingNumber();
        setInterval(createFloatingNumber, 2000);
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
            case 'hint':
                frequency = 440;
                duration = 0.2;
                break;
            case 'error':
                frequency = 200;
                duration = 0.3;
                break;
            case 'newGame':
                frequency = 330;
                duration = 0.3;
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
}

//css for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

//init game when page loads
window.addEventListener('load', () => {
    new NumberGuessingGame();
});