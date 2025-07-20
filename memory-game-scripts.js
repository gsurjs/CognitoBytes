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
        
        //image paths for cards
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
        this.startButton.addEventListener('click', () => this.startGame());
        this.playAgainButton.addEventListener('click', () => this.resetGame());
        
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.memorizationTime = e.target.value === 'easy' ? 3 : e.target.value === 'medium' ? 5 : 8;
        });
        
        this.pairsSelect.addEventListener('change', (e) => {
            this.numPairs = parseInt(e.target.value);
            this.gameTime = this.numPairs === 8 ? 120 : this.numPairs === 10 ? 150 : 180;
        });
    }

    startGame() {
        this.gameSetup.style.display = 'none';
        this.memorizationPhase.style.display = 'block';
        this.totalPairsEl.textContent = this.numPairs;
        
        this.createGameBoard();
        this.startMemorizationPhase();
    }

    createGameBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board grid-${this.numPairs}`;
        
        //create card pairs
        const cardPairs = [];
        for (let i = 0; i < this.numPairs; i++) {
            const imagePath = this.imagePaths[i];
            cardPairs.push(imagePath, imagePath);
        }
        
        //shuffle cars
        this.shuffleArray(cardPairs);
        
        //create card elements
        cardPairs.forEach((imagePath, index) => {
            const card = this.createCard(imagePath, index);
            this.gameBoard.appendChild(card);
        });
    }

    createCard(imagePath, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.image = imagePath;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-face card-back">${index + 1}</div>
            <div class="card-face card-front">
                <img src="${imagePath}" alt="Memory Card" class="card-image" 
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;display:flex;align-items:center;justify-content:center;height:100%;font-size:0.8rem;color:#666;text-align:center;&quot;>Image<br>Missing</div>'">
            </div>
        `;
        
        card.addEventListener('click', () => this.flipCard(card));
        return card;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startMemorizationPhase() {
        //visible during memorization
        this.gameBoard.style.display = 'grid';

        //show all cards during memorization
        const cards = document.querySelectorAll('.card');
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
        //hide all cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.remove('flipped'));
        
        //show game interface
        this.memorizationPhase.style.display = 'none';
        this.gameInfo.style.display = 'block';
        this.gameBoard.style.display = 'grid';
        
        //enable card flipping start timer
        this.canFlip = true;
        this.gameActive = true;
        this.currentTimer = this.gameTime;
        this.startGameTimer();
    }

    startGameTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
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
        if (!this.canFlip || !this.gameActive || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.attempts++;
            this.attemptsEl.textContent = this.attempts;
            
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.dataset.image === card2.dataset.image) {
            //match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.classList.add('flipped'); //keep flipped after match
            card2.classList.add('flipped'); //keep flipped after match
            this.matchesFound++;
            this.matchesFoundEl.textContent = this.matchesFound;
            this.playSound('match');
            
            if (this.matchesFound === this.numPairs) {
                setTimeout(() => this.endGame(true), 500);
            }
        } else {
            //no match
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
        
        if (success) {
            this.gameOver.className = 'game-over success';
            this.gameOverTitle.textContent = '🎉 Congratulations!';
            this.gameOverMessage.textContent = `You completed the game in ${this.attempts} attempts with ${this.currentTimer} seconds remaining!`;
            this.playSound('win');
            this.createSuccessAnimation();
        } else {
            this.gameOver.className = 'game-over failure';
            this.gameOverTitle.textContent = '⏰ Time\'s Up!';
            this.gameOverMessage.textContent = `Game over! You found ${this.matchesFound} out of ${this.numPairs} pairs.`;
            this.playSound('lose');
        }
    }

    createSuccessAnimation() {
        //create floating sparkles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.textContent = '👟';
                sparkle.style.position = 'fixed';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                sparkle.style.fontSize = '2rem';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '9999';
                sparkle.style.animation = 'sparkle 3s ease-out forwards';
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 3000);
            }, i * 100);
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
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        //sound tone types
        switch(type) {
            case 'match':
                frequency = 523.25;
                duration = 0.3;
                break;
            case 'nomatch':
                frequency = 220;
                duration = 0.2;
                break;
            case 'win':
                frequency = 659.25;
                duration = 0.5;
                break;
            case 'lose':
                frequency = 196;
                duration = 0.8;
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

//styling for sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
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

//init game when page loads
window.addEventListener('load', () => {
    new MemoryGame();
});