class SlidingPuzzleGame {
    constructor() {
        this.board = [];
        this.tileElements = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.mode = 'daily'; // 'daily' or 'random'
        this.images = [
            'images/slider/blue-cheeked-jacama.jpg', 'images/slider/capybara.jpg', 'images/slider/CEO.jpg',
            'images/slider/jaguar.jpg', 'images/slider/Einstein.jpg', 'images/slider/greenfinch.jpg',
            'images/slider/SanDiegoHummingBird.jpg', 'images/slider/Warbler.jpg', 'images/slider/Water.jpg',
            'images/slider/yorkie.jpg', 'images/slider/yorkie1.jpg', 'images/slider/fine.jpg', 'images/slider/ancient-aliens.jpg'
        ];
        this.currentImage = '';
        this.boundHandleTileClick = this.handleTileClick.bind(this);

        this.initializeElements();
        this.createBoardElements();
        this.setupEventListeners();

        // Attempt to load the last daily game. If none exists, start a new one.
        if (!this.loadState()) {
            this.startNewGame();
        }
    }

    saveState() {
        const state = {
            board: this.board,
            moves: this.moves,
            timer: this.timer,
            currentImage: this.currentImage,
            gameActive: this.gameActive
        };

        if (this.mode === 'daily') {
            state.date = new Date().toDateString();
        }

        localStorage.setItem(`pixSlateSave_${this.mode}`, JSON.stringify(state));
    }

    loadState() {
        const savedStateJSON = localStorage.getItem(`pixSlateSave_${this.mode}`);
        if (!savedStateJSON) return false;

        const savedState = JSON.parse(savedStateJSON);

        if (this.mode === 'daily' && savedState.date !== new Date().toDateString()) {
            localStorage.removeItem(`pixSlateSave_${this.mode}`);
            return false;
        }

        // START OF FIX
        // This crucial step ensures the rendering engine knows which tile to hide
        // for the empty space, as this is normally done in `shuffleBoard`.
        const lastTileValue = 16;
        this.tileElements.forEach(el => el.classList.remove('empty-spot'));
        const emptyElement = this.tileElements.find(el => parseInt(el.dataset.tileValue) === lastTileValue);
        if (emptyElement) {
            emptyElement.classList.add('empty-spot');
        }
        // END OF FIX

        this.board = savedState.board;
        this.moves = savedState.moves;
        this.timer = savedState.timer;
        this.currentImage = savedState.currentImage;
        this.gameActive = savedState.gameActive;

        if (this.gameActive) {
            this.startTimer();
        }

        this.renderFullBoard();
        this.updateMoves();
        this.updateTimer();

        return true;
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.newGameButton = document.getElementById('newGameButton');
        this.shareButton = document.getElementById('shareButton');
        this.dailyModeButton = document.getElementById('dailyMode');
        this.randomModeButton = document.getElementById('randomMode');
    }

    // START OF FIX
    // This function now gives each tile a permanent ID when it's created.
    createBoardElements() {
        this.gameBoard.innerHTML = '';
        this.tileElements = [];
        for (let i = 0; i < 16; i++) {
            const tileElement = document.createElement('div');
            tileElement.dataset.tileValue = i + 1;
            this.gameBoard.appendChild(tileElement);
            this.tileElements.push(tileElement);
        }

        this.gameBoard.removeEventListener('click', this.boundHandleTileClick);
        this.gameBoard.addEventListener('click', this.boundHandleTileClick);
    }
    // END OF FIX

    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.shareButton.addEventListener('click', () => this.shareResults());
        this.dailyModeButton.addEventListener('click', () => this.setMode('daily'));
        this.randomModeButton.addEventListener('click', () => this.setMode('random'));
        window.addEventListener('resize', () => this.renderFullBoard());
    }

    setMode(mode) {
        this.stopTimer();
        this.mode = mode;
        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.randomModeButton.classList.toggle('active', mode !== 'daily');

        if (!this.loadState()) {
            this.startNewGame();
        }
    }

    startNewGame() {
        localStorage.removeItem(`pixSlateSave_${this.mode}`);
        this.gameActive = true;
        this.moves = 0;
        this.timer = 0;
        this.updateMoves();
        this.stopTimer();
        this.updateTimer();
        this.generateBoard();
        this.renderFullBoard();
        this.shareButton.style.display = 'none';
        this.saveState();
    }

    // START OF FIX
    // This function no longer needs to set the 'data-tile-value' attribute.
    generateBoard() {
        this.board = Array.from({ length: 16 }, (_, i) => i + 1);
        this.board[15] = null;

        if (this.mode === 'daily') {
            const date = new Date();
            const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
            this.currentImage = this.images[this.seededRandomInt(seed, this.images.length)];
            this.shuffleBoard();
        } else {
            this.currentImage = this.images[Math.floor(Math.random() * this.images.length)];
            this.shuffleBoard();
        }
    }
    // END OF FIX

    renderFullBoard() {
        const boardSize = this.gameBoard.clientWidth;
        if (boardSize === 0) return;
        this.gameBoard.style.height = `${boardSize}px`;

        const gap = 5;
        const totalGapSize = gap * 3;
        const tileSize = (boardSize - totalGapSize) / 4;

        this.board.forEach((tileValue, index) => {
            const elementToMove = (tileValue === null)
                ? this.tileElements.find(el => el.classList.contains('empty-spot'))
                : this.tileElements.find(el => parseInt(el.dataset.tileValue) === tileValue);

            if (!elementToMove) return;

            elementToMove.innerHTML = '';
            if (tileValue === null) {
                elementToMove.className = 'tile empty-spot';
                elementToMove.style.display = 'none';
            } else {
                elementToMove.className = 'tile';
                elementToMove.style.display = 'flex';
                const span = document.createElement('span');
                span.textContent = tileValue;
                elementToMove.appendChild(span);

                const x = (tileValue - 1) % 4;
                const y = Math.floor((tileValue - 1) / 4);
                elementToMove.style.backgroundImage = `url(${this.currentImage})`;
                elementToMove.style.backgroundPosition = `${x * 100 / 3}% ${y * 100 / 3}%`;
            }

            const row = Math.floor(index / 4);
            const col = index % 4;
            const top = row * (tileSize + gap);
            const left = col * (tileSize + gap);

            elementToMove.style.width = `${tileSize}px`;
            elementToMove.style.height = `${tileSize}px`;
            elementToMove.style.top = `${top}px`;
            elementToMove.style.left = `${left}px`;
        });
    }

    handleTileClick(e) {
        if (!this.gameActive) return;

        const clickedTileElement = e.target.closest('.tile');

        if (!clickedTileElement || clickedTileElement.classList.contains('empty-spot')) {
            return;
        }

        const clickedValue = parseInt(clickedTileElement.dataset.tileValue);
        if (isNaN(clickedValue)) return;

        const clickedIndex = this.board.indexOf(clickedValue);
        const emptyIndex = this.board.indexOf(null);

        if (clickedIndex === -1) return;

        const { row, col } = this.getTilePosition(clickedIndex);
        const { row: emptyRow, col: emptyCol } = this.getTilePosition(emptyIndex);

        if (
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        ) {
            if (this.moves === 0 && this.timer === 0) {
                this.startTimer();
            }

            this.swapTiles(clickedIndex, emptyIndex);
            this.renderFullBoard();
            
            this.moves++;
            this.updateMoves();

            if (this.isSolved()) {
                this.gameActive = false;
                this.endGame();
            }
            this.saveState();
        }
    }
    
    shuffleBoard() {
        const initialTiles = this.board.filter(t => t !== null);
        let inversions = 1;
        let attempt = 0;

        const seed = (this.mode === 'daily') 
            ? new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate()
            : 0;

        while (inversions % 2 !== 0) {
            let boardToShuffle = [...initialTiles]; 
            let shuffledResult;

            if (this.mode === 'daily') {
                shuffledResult = this.seededShuffle(seed + attempt, boardToShuffle);
            } else {
                shuffledResult = this.randomShuffle(boardToShuffle);
            }
            
            inversions = this.countInversions(shuffledResult);
            
            if (inversions % 2 === 0) {
                this.board = [...shuffledResult, null];
            }
            attempt++;
        }
        
        const lastTileValue = 16;
        this.tileElements.forEach(el => el.classList.remove('empty-spot'));
        const emptyElement = this.tileElements.find(el => parseInt(el.dataset.tileValue) === lastTileValue);
        if(emptyElement) {
           emptyElement.classList.add('empty-spot');
        }
    }

    seededRandomInt(seed, max) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return Math.floor((((t ^ t >>> 14) >>> 0) / 4294967296) * max);
    }

    randomShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    seededShuffle(seed, array) {
        let currentIndex = array.length;
        const random = () => {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        while (0 !== currentIndex) {
            let randomIndex = Math.floor(random() * currentIndex);
            currentIndex -= 1;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
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
        return {
            row: Math.floor(index / 4),
            col: index % 4
        };
    }

    updateMoves() {
        this.movesElement.textContent = `Moves: ${this.moves}`;
    }

    startTimer() {
        if (this.timerInterval) return;
        this.gameActive = true;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
            this.saveState();
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