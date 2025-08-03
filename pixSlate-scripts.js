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

        this.initializeElements();
        this.createBoardElements();
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
    }

    createBoardElements() {
        this.gameBoard.innerHTML = ''; // Clear board once at the start
        for (let i = 0; i < 16; i++) {
            const tileElement = document.createElement('div');
            this.gameBoard.appendChild(tileElement);
            this.tileElements.push(tileElement);
        }
    }

    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.shareButton.addEventListener('click', () => this.shareResults());
        this.dailyModeButton.addEventListener('click', () => this.setMode('daily'));
        this.randomModeButton.addEventListener('click', () => this.setMode('random'));
        
        // Add a listener to resize the board when the window size changes
        window.addEventListener('resize', () => this.renderFullBoard());
    }

    setMode(mode) {
        this.mode = mode;
        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.randomModeButton.classList.toggle('active', mode !== 'daily');
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
        this.renderFullBoard();
        this.shareButton.style.display = 'none';
    }

    generateBoard() {
        this.board = Array.from({ length: 16 }, (_, i) => i + 1);
        this.board[15] = null; // Empty space

        // Create a mapping of the tile number to its element for the initial render
        this.tileElements.forEach((element, i) => {
            element.dataset.tileValue = i + 1;
        });
        
        // Set image and shuffle
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

    renderFullBoard() {
        // Ensure the game board container is a perfect square
        const boardSize = this.gameBoard.clientWidth;
        this.gameBoard.style.height = `${boardSize}px`;

        const gap = 5; // The gap in pixels from your CSS
        const totalGapSize = gap * 3;
        const tileSize = (boardSize - totalGapSize) / 4;

        this.board.forEach((tileValue, index) => {
            // Find the correct DOM element for the tile's value
            // The empty spot is handled by finding the tile that should be hidden
            const elementToMove = (tileValue === null)
                ? this.tileElements.find(el => el.classList.contains('empty-spot'))
                : this.tileElements.find(el => parseInt(el.dataset.tileValue) === tileValue);

            if (!elementToMove) return;

            // --- Part 1: Style the tile's content and appearance ---
            elementToMove.innerHTML = '';
            if (tileValue === null) {
                // This is the conceptual empty space, we just hide its element
                elementToMove.className = 'tile empty-spot'; // A hidden tile
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

            // --- Part 2: Position the tile on the board ---
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

        // Find the '.tile' element, even if the click was on the number inside it.
        const clickedTileElement = e.target.closest('.tile');

        // If the click was outside a tile or on the conceptual empty spot, do nothing.
        if (!clickedTileElement || clickedTileElement.classList.contains('empty-spot')) {
            return;
        }

        // Get the value from the tile's data attribute.
        const clickedValue = parseInt(clickedTileElement.dataset.tileValue);
        if (isNaN(clickedValue)) return;

        // Find the index of the clicked value and the empty spot in our data board
        const clickedIndex = this.board.indexOf(clickedValue);
        const emptyIndex = this.board.indexOf(null);

        if (clickedIndex === -1) return;

        const { row, col } = this.getTilePosition(clickedIndex);
        const { row: emptyRow, col: emptyCol } = this.getTilePosition(emptyIndex);

        // Check if the move is valid
        if (
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        ) {
            if (this.moves === 0 && this.timer === 0) {
                this.startTimer();
            }

            this.swapTiles(clickedIndex, emptyIndex); // Update data model
            this.renderFullBoard(); // Re-render the board, which triggers the slide animation
            
            this.moves++;
            this.updateMoves();

            if (this.isSolved()) {
                this.endGame();
            }
        }
    }
    
    // Minor change to how clicks are handled
    // We bind the events to the elements *after* they have their data-tile-value set.
    // So the old `createBoardElements` is split.
    createBoardElements() {
        this.gameBoard.innerHTML = '';
        this.tileElements = []; // Clear previous elements
        for (let i = 0; i < 16; i++) {
            const tileElement = document.createElement('div');
            // We set the click listener on the gameBoard to handle all tile clicks
            // This is more efficient and avoids issues with element reordering
            this.gameBoard.appendChild(tileElement);
            this.tileElements.push(tileElement);
        }
        // Remove old listeners and add a single new one
        this.gameBoard.removeEventListener('click', this.boundHandleTileClick);
        this.boundHandleTileClick = this.handleTileClick.bind(this);
        this.gameBoard.addEventListener('click', this.boundHandleTileClick);
    }
    
    // --- All other functions (shuffle, timer, etc.) remain the same ---

    seededRandomInt(seed, max) {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return Math.floor((((t ^ t >>> 14) >>> 0) / 4294967296) * max);
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
        
        // Find the tile that will represent the empty space and mark it
        const lastTileValue = 16;
        this.tileElements.forEach(el => el.classList.remove('empty-spot'));
        const emptyElement = this.tileElements.find(el => parseInt(el.dataset.tileValue) === lastTileValue);
        if(emptyElement) {
           emptyElement.classList.add('empty-spot');
        }
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