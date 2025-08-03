class SlidingPuzzleGame {
    constructor() {
        this.board = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.mode = 'daily'; // 'daily' or 'random'
        this.images = [
            'images/slider/blue-cheeked-jacama.jpg', 'images/slider/capybara.jpg', 'images/slider/CEO.jpg',
            'images/slider/earth.jpg', 'images/slider/Einstein.jpg', 'images/slider/greenfinch.jpg',
            'images/slider/SanDiegoHummingBird.jpg', 'images/slider/Warbler.jpg', 'images/slider/Water.jpg',
            'images/slider/yorkie.jpg', 'images/slider/yorkie1.jpg', 'images/slider/fine.jpg', 'images/slider/ancient-aliens.jpg'
        ];
        this.currentImage = '';
        this.imagePreloaded = false;

        this.initializeElements();
        this.setupEventListeners();
        this.startNewGame();
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

    // Preload image to prevent flashing
    preloadImage(imageSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if image fails to load
            img.src = imageSrc;
        });
    }

    async startNewGame() {
        this.gameActive = true;
        this.moves = 0;
        this.timer = 0;
        this.updateMoves();
        this.stopTimer();
        this.updateTimer();
        await this.generateBoard();
        this.renderBoard();
        this.shareButton.style.display = 'none';
    }

    async generateBoard() {
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

        // Preload the image before rendering
        await this.preloadImage(this.currentImage);
        this.imagePreloaded = true;
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

    renderBoard() {
        // Clear the board first
        this.gameBoard.innerHTML = '';
        
        // Create a document fragment to minimize DOM manipulation
        const fragment = document.createDocumentFragment();
        
        this.board.forEach((tileValue, index) => {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            
            if (tileValue === null) {
                tileElement.classList.add('empty');
            } else {
                const span = document.createElement('span');
                span.textContent = tileValue;
                tileElement.appendChild(span);

                const x = (tileValue - 1) % 4;
                const y = Math.floor((tileValue - 1) / 4);
                
                // Set background image and position in one operation to prevent flashing
                const bgPosX = (x * 100/3).toFixed(2);
                const bgPosY = (y * 100/3).toFixed(2);
                
                // Use requestAnimationFrame to ensure smooth rendering
                requestAnimationFrame(() => {
                    tileElement.style.backgroundImage = `url(${this.currentImage})`;
                    tileElement.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
                });
            }
            
            tileElement.addEventListener('click', () => this.handleTileClick(index));
            fragment.appendChild(tileElement);
        });
        
        // Add all tiles at once to minimize reflows
        this.gameBoard.appendChild(fragment);
    }

    handleTileClick(index) {
        if (!this.gameActive) return;

        if (this.moves === 0 && this.timer === 0) {
            this.startTimer();
        }

        const emptyIndex = this.board.indexOf(null);
        const { row, col } = this.getTilePosition(index);
        const { row: emptyRow, col: emptyCol } = this.getTilePosition(emptyIndex);

        if (
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        ) {
            this.swapTiles(index, emptyIndex);
            this.moves++;
            this.updateMoves();
            
            // Use a more efficient re-render approach
            this.updateTilePositions(index, emptyIndex);
            
            if (this.isSolved()) {
                this.endGame();
            }
        }
    }

    // New method to update only the affected tiles instead of re-rendering everything
    updateTilePositions(movedIndex, emptyIndex) {
        const tiles = this.gameBoard.children;
        
        // Update the moved tile
        const movedTile = tiles[movedIndex];
        const emptyTile = tiles[emptyIndex];
        
        // Get the new values
        const movedValue = this.board[movedIndex];
        const emptyValue = this.board[emptyIndex];
        
        // Update moved tile (now empty)
        if (emptyValue === null) {
            movedTile.className = 'tile empty';
            movedTile.style.backgroundImage = 'none';
            movedTile.innerHTML = '';
        }
        
        // Update empty tile (now has the moved value)
        if (movedValue !== null) {
            emptyTile.className = 'tile';
            const span = document.createElement('span');
            span.textContent = movedValue;
            emptyTile.innerHTML = '';
            emptyTile.appendChild(span);
            
            const x = (movedValue - 1) % 4;
            const y = Math.floor((movedValue - 1) / 4);
            const bgPosX = (x * 100/3).toFixed(2);
            const bgPosY = (y * 100/3).toFixed(2);
            
            // Set background properties without causing reflow
            emptyTile.style.backgroundImage = `url(${this.currentImage})`;
            emptyTile.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        }
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