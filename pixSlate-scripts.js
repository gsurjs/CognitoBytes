class SlidingPuzzleGame {
    constructor() {
        this.board = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.mode = 'daily'; // 'daily' or 'random'

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
        this.startNewGame();
    }

    startNewGame() {
        this.gameActive = true;
        this.moves = 0;
        this.timer = 0;
        this.updateMoves();
        this.stopTimer();
        this.startTimer();
        this.generateBoard();
        this.renderBoard();
        this.shareButton.style.display = 'none';
    }

    generateBoard() {
        this.board = Array.from({ length: 16 }, (_, i) => i + 1);
        this.board[15] = null; // Empty space

        if (this.mode === 'daily') {
            const date = new Date();
            const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
            this.shuffleBoard(this.seededShuffle.bind(this, seed));
        } else {
            this.shuffleBoard(this.randomShuffle);
        }
    }

    shuffleBoard(shuffleFunction) {
        let inversions = 1;
        while (inversions % 2 !== 0) {
            this.board = shuffleFunction(this.board.filter(t => t !== null));
            this.board.push(null);
            inversions = this.countInversions();
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

    countInversions() {
        let inversions = 0;
        for (let i = 0; i < 15; i++) {
            for (let j = i + 1; j < 15; j++) {
                if (this.board[i] && this.board[j] && this.board[i] > this.board[j]) {
                    inversions++;
                }
            }
        }
        return inversions;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.board.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            if (tile === null) {
                tileElement.classList.add('empty');
            } else {
                const span = document.createElement('span');
                span.textContent = tile;
                tileElement.appendChild(span);
            }
            tileElement.addEventListener('click', () => this.handleTileClick(index));
            this.gameBoard.appendChild(tileElement);
        });
    }

    handleTileClick(index) {
        if (!this.gameActive) return;

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
            this.renderBoard();
            if (this.isSolved()) {
                this.endGame();
            }
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
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
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
        alert(`You solved it in ${this.timer} seconds and ${this.moves} moves!`);
        this.shareButton.style.display = 'inline-block';
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