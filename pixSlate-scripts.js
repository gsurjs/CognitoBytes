// pixSlate-scripts.js

class SlidingPuzzleGame {
    constructor() {
        this.board = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.mode = 'daily';
        this.images = [
            'images/slider/blue-cheeked-jacama.jpg', 'images/slider/capybara.jpg', 'images/slider/CEO.jpg',
            'images/slider/earth.jpg', 'images/slider/Einstein.jpg', 'images/slider/greenfinch.jpg',
            'images/slider/SanDiegoHummingBird.jpg', 'images/slider/Warbler.jpg', 'images/slider/Water.jpg',
            'images/slider/yorkie.jpg', 'images/slider/yorkie1.jpg', 'images/slider/fine.jpg', 'images/slider/ancient-aliens.jpg'
        ];
        this.currentImage = '';
        this.tileElements = {}; // NEW: Object to hold the tile DOM elements

        this.initializeElements();
        this.setupEventListeners();
        this.setMode('daily'); // Set initial mode
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.newGameButton = document.getElementById('newGameButton');
        this.shareButton = document.getElementById('shareButton');
        this.dailyModeButton = document.getElementById('dailyMode');
        this.randomModeButton = document.getElementById('randomMode');
        this.imageCreditElement = document.getElementById('imageCredit');
    }

    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.shareButton.addEventListener('click', () => this.shareResults());
        this.dailyModeButton.addEventListener('click', () => this.setMode('daily'));
        this.randomModeButton.addEventListener('click', () => this.setMode('random'));
    }

    setMode(mode) {
        this.mode = mode;
        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.randomModeButton.classList.toggle('active', mode !== 'daily');
        this.newGameButton.style.display = mode === 'daily' ? 'none' : 'inline-block';
        this.startNewGame();
    }

    startNewGame() {
        this.gameActive = true;
        this.moves = 0;
        this.timer = 0;
        this.updateMoves();
        this.stopTimer();
        this.updateTimer();
        this.generateBoard();
        this.createBoardElements(); // CHANGED: from renderBoard
        this.updateBoardView();   // NEW: Update positions
        this.shareButton.style.display = 'none';
    }

    // NEW METHOD: Creates tile DOM elements ONCE per game
    createBoardElements() {
        this.gameBoard.innerHTML = '';
        this.tileElements = {};
        for (let i = 1; i <= 15; i++) {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            tileElement.dataset.value = i; // Store value in dataset

            const span = document.createElement('span');
            span.textContent = i;
            tileElement.appendChild(span);

            const x = (i - 1) % 4;
            const y = Math.floor((i - 1) / 4);
            tileElement.style.backgroundImage = `url(${this.currentImage})`;
            tileElement.style.backgroundPosition = `${x * 100/3}% ${y * 100/3}%`;
            
            tileElement.addEventListener('click', () => this.handleTileClick(i));
            this.gameBoard.appendChild(tileElement);
            this.tileElements[i] = tileElement;
        }
    }

    updateBoardView() {
        this.board.forEach((tileValue, index) => {
            if (tileValue === null) return;
            const { row, col } = this.getTilePosition(index);
            const tileElement = this.tileElements[tileValue];
            
            // These are the corrected calculations
            const xOffset = `${col * 25}%`;
            const yOffset = `${row * 25}%`;

            tileElement.style.transform = `translate(${xOffset}, ${yOffset})`;
        });
    }

    handleTileClick(tileValue) {
        if (!this.gameActive) return;

        if (this.moves === 0 && this.timer === 0) {
            this.startTimer();
        }

        const tileIndex = this.board.indexOf(tileValue);
        const emptyIndex = this.board.indexOf(null);
        
        const { row, col } = this.getTilePosition(tileIndex);
        const { row: emptyRow, col: emptyCol } = this.getTilePosition(emptyIndex);

        if (
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        ) {
            this.swapTiles(tileIndex, emptyIndex);
            this.moves++;
            this.updateMoves();
            this.updateBoardView(); // CHANGED: from renderBoard
            if (this.isSolved()) {
                this.endGame();
            }
        }
    }
    
    // (Keep all other methods like generateBoard, swapTiles, startTimer, etc. the same)
    // The following methods are unchanged from your original file.
    generateBoard() {
        this.board = Array.from({ length: 16 }, (_, i) => i + 1);
        this.board[15] = null; // Empty space

        if (this.mode === 'daily') {
            const date = new Date();
            const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
            this.currentImage = this.images[this.seededRandomInt(seed, this.images.length)];
            this.shuffleBoard(this.seededShuffle.bind(this, seed));
        } else {
            this.currentImage = this.images[Math.floor(Math.random() * this.images.length)];
            this.shuffleBoard(this.randomShuffle);
        }
    }
    seededRandomInt(seed, max) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return Math.floor((((t ^ t >>> 14) >>> 0) / 4294967296) * max);
    }
    shuffleBoard(shuffleFunction) {
        let tempBoard = this.board.filter(t => t !== null);
        let inversions = 1;
        while (inversions % 2 !== 0) {
            tempBoard = shuffleFunction(tempBoard);
            inversions = this.countInversions(tempBoard);
        }
        this.board = [...tempBoard, null];
    }
    randomShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    seededShuffle(seed, array) {
        let currentIndex = array.length, temporaryValue, randomIndex;
        const random = () => {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        while (0 !== currentIndex) {
            randomIndex = Math.floor(random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    countInversions(array) {
        let inversions = 0;
        for (let i = 0; i < array.length - 1; i++) {
            for (let j = i + 1; j < array.length; j++) {
                if (array[i] && array[j] && array[i] > array[j]) {
                    inversions++;
                }
            }
        }
        return inversions;
    }
    swapTiles(index1, index2) {
        [this.board[index1], this.board[index2]] = [this.board[index2], this.board[index1]];
    }
    getTilePosition(index) {
        return { row: Math.floor(index / 4), col: index % 4 };
    }
    updateMoves() {
        this.movesElement.textContent = `Moves: ${this.moves}`;
    }
    startTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }
    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
    updateTimer() {
        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        this.timerElement.textContent = `Time: ${minutes}:${seconds}`;
    }
    isSolved() {
        for (let i = 0; i < 15; i++) {
            if (this.board[i] !== i + 1) return false;
        }
        return true;
    }
    endGame() {
        this.gameActive = false;
        this.stopTimer();
        setTimeout(() => {
            alert(`You solved it in ${this.timer} seconds and ${this.moves} moves!`);
            this.shareButton.style.display = 'inline-block';
        }, 300);
    }
    shareResults() {
        const time = this.timerElement.textContent;
        const text = `I solved the daily sliding puzzle in ${time} and ${this.moves} moves! Can you beat my score?`;
        if (navigator.share) {
            navigator.share({
                title: 'Sliding Puzzle Challenge',
                text: text,
                url: window.location.href
            });
        } else {
            alert(text);
        }
    }
}

window.addEventListener('load', () => {
    new SlidingPuzzleGame();
});