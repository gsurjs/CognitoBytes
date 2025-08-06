class SlidingPuzzleGame {
    constructor() {
        this.board = [];
        this.tileElements = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameActive = false;
        this.isPaused = false;
        this.mode = 'daily';
        this.images = [
            'images/slider/blue-cheeked-jacama.jpg', 'images/slider/capybara.jpg', 'images/slider/the_dude.jpg',
            'images/slider/jaguar.jpg', 'images/slider/Einstein.jpg', 'images/slider/greenfinch.jpg',
            'images/slider/SanDiegoHummingBird.jpg', 'images/slider/Warbler.jpg', 'images/slider/Water.jpg',
            'images/slider/yorkie.jpg', 'images/slider/yorkie1.jpg', 'images/slider/fine.jpg', 'images/slider/ancient-aliens.jpg'
        ];
        this.currentImage = '';
        this.boundHandleTileClick = this.handleTileClick.bind(this);

        this.initializeElements();
        this.createBoardElements();
        this.setupEventListeners();

        this.updateStatsDisplay();

        if (!this.loadState()) {
            this.startNewGame();
        }
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.newGameButton = document.getElementById('newGameButton');
        this.shareButton = document.getElementById('shareButton');
        this.dailyModeButton = document.getElementById('dailyMode');
        this.randomModeButton = document.getElementById('randomMode');
        this.pauseButton = document.getElementById('pauseButton');

        this.gamesWon = document.getElementById('gamesWon');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.winStreak = document.getElementById('winStreak');

        this.statsButton = document.getElementById('statsButton');
        this.statsModal = document.getElementById('statsModal');
    }

    getStats() {
        const key = `pixSlate-stats-${this.mode}`;
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0,
            lastGamePlayedSeed: null
        };
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultStats;
    }

    saveStats(stats) {
        const key = `pixSlate-stats-${this.mode}`;
        localStorage.setItem(key, JSON.stringify(stats));
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.winStreak.textContent = stats.currentStreak;
    }

    createBoardElements() {
        this.gameBoard.innerHTML = '';
        this.tileElements = [];
        for (let i = 0; i < 16; i++) {
            const tileElement = document.createElement('div');
            tileElement.dataset.tileValue = i + 1;
            this.gameBoard.appendChild(tileElement);
            this.tileElements.push(tileElement);
        }

        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.id = 'pauseOverlay';
        this.pauseOverlay.className = 'pause-overlay';
        this.pauseOverlay.textContent = 'PAUSED';
        this.gameBoard.appendChild(this.pauseOverlay);

        this.gameBoard.addEventListener('click', this.boundHandleTileClick);
    }

    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.shareButton.addEventListener('click', () => this.shareResults());
        this.dailyModeButton.addEventListener('click', () => this.setMode('daily'));
        this.randomModeButton.addEventListener('click', () => this.setMode('random'));
        this.pauseButton.addEventListener('click', () => this.togglePause());
        window.addEventListener('resize', () => this.renderFullBoard());

        this.statsButton.addEventListener('click', () => this.showStatsModal());
        this.statsModal.querySelector('.modal-close-button').addEventListener('click', () => this.closeStatsModal());
        this.statsModal.addEventListener('click', (e) => {
            if (e.target === this.statsModal) {
                this.closeStatsModal();
            }
        });
    }

    showStatsModal() {
        const stats = this.getStats();
        
        // Populate main stats
        document.getElementById('statsPlayed').textContent = stats.gamesPlayed;
        const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
        document.getElementById('statsWinRate').textContent = winRate;
        document.getElementById('statsCurrentStreak').textContent = stats.currentStreak;
        document.getElementById('statsMaxStreak').textContent = stats.maxStreak;
        
        // Populate best time
        if (stats.bestTime) {
            const minutes = Math.floor(stats.bestTime / 60).toString().padStart(2, '0');
            const seconds = (stats.bestTime % 60).toString().padStart(2, '0');
            document.getElementById('bestTime').textContent = `${minutes}:${seconds}`;
        } else {
            document.getElementById('bestTime').textContent = '--:--';
        }

        this.statsModal.style.display = 'flex';
    }

    closeStatsModal() {
        this.statsModal.style.display = 'none';
    }

    getStats() {
        const key = `pixSlate-stats-${this.mode}`;
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0,
            bestTime: null,
            lastGamePlayedSeed: null
        };
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultStats;
    }

    saveState() {
        const state = {
            board: this.board,
            moves: this.moves,
            timer: this.timer,
            currentImage: this.currentImage,
            gameActive: this.gameActive,
            isPaused: this.isPaused
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

        const lastTileValue = 16;
        this.tileElements.forEach(el => el.classList.remove('empty-spot'));
        const emptyElement = this.tileElements.find(el => parseInt(el.dataset.tileValue) === lastTileValue);
        if (emptyElement) {
            emptyElement.classList.add('empty-spot');
        }

        this.board = savedState.board;
        this.moves = savedState.moves;
        this.timer = savedState.timer;
        this.currentImage = savedState.currentImage;
        this.gameActive = savedState.gameActive;
        this.isPaused = savedState.isPaused || false;

        this.renderFullBoard();
        this.updateMoves();
        this.updateTimer();

        if (this.isPaused) {
            this.pauseButton.textContent = 'RESUME';
            this.pauseOverlay.classList.add('active');
        } else {
            if (this.gameActive) {
                this.startTimer();
            }
        }

        this.updateUIVisibility();
        // The extra brace was here. It has been removed.

        return true;
    }

    setMode(mode) {
        this.stopTimer();
        this.mode = mode;
        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.randomModeButton.classList.toggle('active', mode !== 'daily');

        // Update stats display for the new mode
        this.updateStatsDisplay();

        if (!this.loadState()) {
            this.startNewGame();
        }

        this.updateUIVisibility();
    }

    startNewGame() {
        this.isPaused = false;
        this.pauseButton.textContent = 'PAUSE';
        this.pauseOverlay.classList.remove('active');
        localStorage.removeItem(`pixSlateSave_${this.mode}`);
        this.gameActive = true;
        this.moves = 0;
        this.timer = 0;
        this.updateMoves();
        this.stopTimer();
        this.updateTimer();
        this.generateBoard();
        this.renderFullBoard();

        this.updateUIVisibility();

        this.saveState();
    }

    generateBoard() {
        this.board = Array.from({
            length: 16
        }, (_, i) => i + 1);
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

    renderFullBoard() {
        const boardSize = this.gameBoard.clientWidth;
        if (boardSize === 0) return;
        this.gameBoard.style.height = `${boardSize}px`;

        const gap = 0;
        const totalGapSize = gap * 3;
        const tileSize = (boardSize - totalGapSize) / 4;

        this.board.forEach((tileValue, index) => {
            const elementToMove = (tileValue === null) ?
                this.tileElements.find(el => el.classList.contains('empty-spot')) :
                this.tileElements.find(el => parseInt(el.dataset.tileValue) === tileValue);

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
        if (this.isPaused || !this.gameActive) return;

        const clickedTileElement = e.target.closest('.tile');

        if (!clickedTileElement || clickedTileElement.classList.contains('empty-spot')) {
            return;
        }

        const clickedValue = parseInt(clickedTileElement.dataset.tileValue);
        if (isNaN(clickedValue)) return;

        const clickedIndex = this.board.indexOf(clickedValue);
        const emptyIndex = this.board.indexOf(null);

        if (clickedIndex === -1) return;

        const {
            row,
            col
        } = this.getTilePosition(clickedIndex);
        const {
            row: emptyRow,
            col: emptyCol
        } = this.getTilePosition(emptyIndex);

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

    togglePause() {
        if (!this.gameActive && !this.isPaused) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.stopTimer();
            this.pauseButton.textContent = 'RESUME';
            this.pauseOverlay.classList.add('active');
        } else {
            if (this.gameActive) {
                this.startTimer();
            }
            this.pauseButton.textContent = 'PAUSE';
            this.pauseOverlay.classList.remove('active');
        }
        this.saveState();
    }

    shuffleBoard() {
        const initialTiles = this.board.filter(t => t !== null);
        let inversions = 1;
        let attempt = 0;

        const seed = (this.mode === 'daily') ?
            new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate() :
            0;

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
        if (emptyElement) {
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
        //this.isPaused = true;


        const stats = this.getStats();
        const currentSeed = (this.mode === 'daily') 
            ? new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate() 
            : new Date().getTime(); // Use timestamp for random games

        // Only update stats if this specific game hasn't been won before
        if (stats.lastGamePlayedSeed !== currentSeed) {
            stats.gamesPlayed++;
            stats.gamesWon++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            if (stats.bestTime === null || this.timer < stats.bestTime) {
                stats.bestTime = this.timer;
            }

            stats.lastGamePlayedSeed = currentSeed;
            this.saveStats(stats);
            this.updateStatsDisplay();
        }

        this.updateUIVisibility();

        this.saveState();
        setTimeout(() => {
            alert(`You solved it in ${this.timer} seconds and ${this.moves} moves!`);
        }, 300);
    }

    updateUIVisibility() {
        const isGameOver = !this.gameActive && this.isSolved();
        this.shareButton.style.display = isGameOver && this.mode === 'daily' ? 'inline-block' : 'none';
        this.statsButton.style.display = isGameOver ? 'inline-block' : 'none';
        this.pauseButton.style.display = isGameOver ? 'none' : 'inline-block';
        if (this.mode === 'daily') {
            this.newGameButton.style.display = 'none';
        } else {
            this.newGameButton.style.display = 'inline-block';
        }
    }

    showStatsModal() {
        const stats = this.getStats();
        document.getElementById('statsPlayed').textContent = stats.gamesPlayed;
        const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
        document.getElementById('statsWinRate').textContent = winRate;
        document.getElementById('statsCurrentStreak').textContent = stats.currentStreak;
        document.getElementById('statsMaxStreak').textContent = stats.maxStreak;
        if (stats.bestTime) {
            const minutes = Math.floor(stats.bestTime / 60).toString().padStart(2, '0');
            const seconds = (stats.bestTime % 60).toString().padStart(2, '0');
            document.getElementById('bestTime').textContent = `${minutes}:${seconds}`;
        } else {
            document.getElementById('bestTime').textContent = '--:--';
        }
        this.statsModal.style.display = 'flex';
    }

    closeStatsModal() {
        this.statsModal.style.display = 'none';
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.winStreak.textContent = stats.currentStreak;
    }

    generateShareText() {
        const epoch = new Date('2025-08-01T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const puzzleNumber = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        const timeString = `${minutes}:${seconds}`;

        const emojiPattern = [
            '🟩🟩🟩🟩',
            '🟩🟩🟩🟩',
            '🟩🟩🟩🟩',
            '🟩🟩🟩🏆'
        ].join('\n');

        let shareText = `Pix-Slate ${puzzleNumber}\n\nTime: ${timeString}\n${emojiPattern}\nMoves: ${this.moves}`;

        shareText += '\n\nPlay at: ' + window.location.href;

        return shareText;
    }
    
    shareResults() {
        if (this.mode!== 'daily') return;

        const text = this.generateShareText();

        if (navigator.share) {
            navigator.share({
                title: 'Pix-Slate Puzzle Result',
                text: text
            }).catch(err => console.log("Share failed:", err));
        } else {
            alert("Share this result:\n\n" + text);
        }
    }
}

window.addEventListener('load', () => {
    new SlidingPuzzleGame();
});